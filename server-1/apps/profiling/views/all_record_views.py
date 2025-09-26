from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db.models import Q
from django.db import transaction
from pagination import StandardResultsPagination
from apps.profiling.serializers.all_record_serializers import *
from apps.profiling.models import ResidentProfile, BusinessRespondent
from apps.profiling.serializers.all_record_serializers import *
from apps.administration.models import Staff
from apps.account.models import Account
from ..models import FamilyComposition
from datetime import datetime
from ..utils import *
from utils.supabase_client import upload_to_storage
from ..utils import *
from ..double_queries import PostQueries

class AllRecordTableView(generics.GenericAPIView):
  serializer_class = AllRecordTableSerializer
  pagination_class = StandardResultsPagination

  def get(self, request, *args, **kwargs):
    search = request.query_params.get('search', '').strip()

    residents = [
      {
        'id': res.rp_id,
        'lname': res.per.per_lname,
        'fname': res.per.per_fname,
        'mname': res.per.per_mname,
        'suffix': res.per.per_suffix,
        'sex': res.per.per_sex,
        'date_registered': res.rp_date_registered,
        'family_no': (fam_comp.fam.fam_id if (fam_comp := FamilyComposition.objects.filter(rp=res.rp_id).first()) else None),
        'type': 'Resident',
      }
      for res in ResidentProfile.objects.select_related('per').filter(
          Q(per__per_fname__icontains=search) |
          Q(per__per_lname__icontains=search) |
          Q(per__per_mname__icontains=search) |
          Q(per__per_suffix__icontains=search)
      )
    ]
    respondents = [
      {
        'id': res.br_id,
        'lname': res.br_lname,
        'fname': res.br_fname,
        'mname': res.br_mname,
        'suffix': '',
        'sex': res.br_sex,
        'date_registered': res.br_date_registered,
        'type': 'Business',
      }
      for res in BusinessRespondent.objects.all()
    ]
    
    unified_data = residents + respondents
    page = self.paginate_queryset(unified_data)
    serializer = self.get_serializer(page, many=True)
    return self.get_paginated_response(serializer.data)
  

class CompleteRegistrationView(APIView):
  permission_classes = [AllowAny]

  @transaction.atomic
  def post(self, request, *args, **kwargs):
    personal = request.data.get("personal", None)
    account = request.data.get("account", None)
    houses = request.data.get("houses", [])
    livingSolo = request.data.get("livingSolo", None)
    family = request.data.get("family", None)
    business = request.data.get("business", None)
    staff = request.data.get("staff", None)
    

    if staff:
      staff=Staff.objects.filter(staff_id=staff).first()

    results = {}
    hh = []

    if personal:
        per_id = personal.get("per_id", None)

        # Create ResidentProfile record
        rp = ResidentProfile.objects.create(
          rp_id = generate_resident_no(),
          per = Personal.objects.get(per_id=per_id),
          staff = staff
        ) if per_id else self.create_resident_profile(personal, staff)

        if rp:
          results["rp_id"] = rp.pk

    if account:
        self.create_account(account, rp)


    if len(houses) > 0:
        hh = self.create_household(houses, rp, staff)

    if livingSolo:
        new_fam = self.create_family(livingSolo, rp, hh, staff)
        if new_fam:
          results["fam_id"] = new_fam.pk

    if family:
        self.join_family(family, rp)


    # Perform double query
    double_queries = PostQueries()
    response = double_queries.complete_profile(request.data) 
    if not response.ok:
      try:
          error_detail = response.json()
      except ValueError:
          error_detail = response.text
      raise serializers.ValidationError({"error": error_detail})
    
    if business:
        bus = self.create_business(business, rp, staff)
        if bus:
          results["bus_id"] = bus.pk
          
    return Response(results, status=status.HTTP_200_OK)
  
  def create_resident_profile(self, personal, staff):
    addresses = personal.pop("per_addresses", [])
    add_instances = [
      Address.objects.get_or_create(
        add_province=add["add_province"],
        add_city=add["add_city"],
        add_barangay = add["add_barangay"],
        sitio=Sitio.objects.filter(sitio_name=add["sitio"]).first(),
        add_external_sitio=add["add_external_sitio"],
        add_street=add["add_street"]
      )[0]
      for add in addresses
    ]

    # Create Personal record
    per_instance = Personal(**personal)
    per_instance._history_user = staff
    per_instance.save()

    try:
      latest_history = per_instance.history.latest()
      history_id = latest_history.history_id
    except per_instance.history.model.DoesNotExist:
      history_id = None  

    for add in add_instances:
      PersonalAddress.objects.create(add=add, per=per_instance) 
      history = PersonalAddressHistory(add=add, per=per_instance)
      history.history_id=history_id
      history.save()
      

    # Create ResidentProfile record
    resident_profile = ResidentProfile.objects.create(
      rp_id = generate_resident_no(),
      per = per_instance,
      staff = staff
    )

    return resident_profile

  def create_account(self, account, rp):
    instance = Account.objects.create_user(
      phone=account.get('phone'),
      email=account.get("email", None),
      rp=rp,
      username=account.get('phone'),
      password=account.get('password')
    )

    return instance
  
  def create_household(self, houses, rp, staff):
    house_instances = []
    for house in houses:
      print(house["address"])
      data = house["address"].split("-") 
      house_instances.append(Household(
        hh_id = generate_hh_no(),
        hh_nhts = house['nhts'],
        add = Address.objects.get_or_create(
          add_province="CEBU",
          add_city="CEBU CITY",
          add_barangay="SAN ROQUE (CIUDAD)",
          sitio=Sitio.objects.filter(sitio_name=data[1]).first(),
          add_street=data[2]
        )[0],
        rp = rp,
        staff = staff
      ))
    
    if len(house_instances) > 0:
      created_instances = Household.objects.bulk_create(house_instances)
    
    return created_instances
  
  def create_family(self, livingSolo, rp, hh, staff):
    household_no = livingSolo["householdNo"]
    is_owned_selected = not household_no.split("-")[0] == "HH"
    fam = Family.objects.create(
      fam_id=generate_fam_no(livingSolo["building"]),
      fam_indigenous=livingSolo["indigenous"],
      fam_building=livingSolo["building"],
      hh=hh[int(household_no)] if is_owned_selected else \
        Household.objects.get(hh_id=household_no),
      staff=staff
    )

    FamilyComposition.objects.create(
      fc_role="Independent",
      fam=fam,
      rp=rp
    )

    return fam
  
  def join_family(self, family, rp):
    return FamilyComposition.objects.create(
      fam=Family.objects.filter(fam_id=family["familyId"]).first(),
      fc_role=family["role"],
      rp=rp
    )
  
  def create_business(self, business, rp, staff):
    files = business.get("files", [])
    
    business = Business(
      bus_name=business["bus_name"],
      bus_gross_sales=business["bus_gross_sales"],
      bus_location=business["bus_location"],
      bus_status="Active",
      bus_date_verified=datetime.today(),
      rp=rp,
      staff=staff
    )
    business._history_user=staff
    business.save()

    if len(files) > 0:
      business_files = []
      for file_data in files:
        folder = "images" if file_data['type'].split("/")[0] == "image" else "documents"

        business_file = BusinessFile(
          bus=business,
          bf_name=file_data['name'],
          bf_type=file_data['type'],
          bf_path=f"{folder}/{file_data['name']}",
        )
        
        url = upload_to_storage(file_data, 'business-bucket', folder)
        business_file.bf_url=url
        business_files.append(business_file)

      if len(business_files) > 0:
          BusinessFile.objects.bulk_create(business_files)

    return business

  