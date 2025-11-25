from rest_framework import generics, status, serializers
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db.models import Q
from django.db import transaction
from apps.profiling.models import *
from apps.profiling.serializers.resident_profile_serializers import ResidentProfileTableSerializer
from apps.administration.models import Staff, Assignment
from apps.account.models import Account
from ..models import FamilyComposition
from datetime import datetime
from ..utils import *
from utils.supabase_client import upload_to_storage
from apps.notification.utils import create_notification
from ..utils import *
from ..double_queries import PostQueries
import copy
import json
from ..notif_recipients import general_recipients, family_recipients
import logging

logger = logging.getLogger(__name__)

class CompleteRegistrationView(APIView):
  permission_classes = [AllowAny]

  @transaction.atomic
  def post(self, request, *args, **kwargs):
    data_copy = copy.deepcopy(request.data)
    personal = data_copy.get("personal", None)
    account = data_copy.get("account", None)
    houses = data_copy.get("houses", [])
    livingSolo = data_copy.get("livingSolo", None)
    family = data_copy.get("family", None)
    business = data_copy.get("business", None)
    staff = data_copy.get("staff", None)

    if staff:
      staff=Staff.objects.filter(staff_id=staff).first()

    # Initialize general recipients
    general_all = general_recipients(False, staff.staff_id)
    general_is_brgy = general_recipients(True, staff.staff_id)

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
        
        # Create notification
        create_notification(
          title="New House Record",
          message=(
              f"{len(houses)} new house{'s' if len(houses) > 1 else ''} has been registered."
          ),
          recipients=general_all,
          notif_type="REGISTRATION",
          web_route="profiling/household",
          web_params={},
          mobile_route="/(profiling)/household/records",
          mobile_params={},
        )

    if livingSolo:
        new_fam = self.create_family(livingSolo, rp, hh, staff)
        if new_fam:
          results["fam_id"] = new_fam.pk
        
        # Create notification
        create_notification(
          title="New Family Record",
          message=(
              f"A new family has been registered."
          ),
          recipients=general_all,
          notif_type="REGISTRATION",
          web_route="profiling/family",
          web_params={},
          mobile_route="/(profiling)/family/records",
          mobile_params={},
        )

    if family:
        new_fam = self.join_family(family, rp)

        # Create notification
        create_notification(
          title="New Family Member",
          message="You have a new member registered in your family.",
          recipients=family_recipients(family),
          notif_type="",
          web_route="",
          web_params={},
          mobile_route="/(account)/family",
          mobile_params={}
        )

    # Perform double query
    double_queries = PostQueries()
    response = double_queries.complete_profile(request.data) 
    if not response.ok:
      try:
          error_details = response.json()
      except ValueError:
          error_details = response.text
      raise serializers.ValidationError({"error": error_details})
    
    if business:
        bus = self.create_business(business, rp, staff)
        if bus:
          results["bus_id"] = bus.pk

          # Create notification
          create_notification(
            title="New Business Record",
            message=(
                f"A new business has been registered."
            ),
            recipients=general_is_brgy,
            notif_type="REGISTRATION",
            web_route="profiling/business/record",
            web_params={},
            mobile_route="/(profiling)/business/records",
            mobile_params={},
          )

    # Create notification
    resident_name = f"{rp.per.per_fname}{f' {rp.per.per_mname[0]}.' if rp.per.per_mname else ''} {rp.per.per_lname}"
    staff_name = f"{staff.rp.per.per_lname} {staff.rp.per.per_fname[0]}."
    residentId = rp.rp_id
    familyId = new_fam.fam_id
    try:
       rp.per.per_dob = datetime.strptime(rp.per.per_dob, '%Y-%m-%d').date()
    except:
       logger.info("per_dob is of type Date")
    json_data = json.dumps(
       ResidentProfileTableSerializer(rp).data,
       default=str
    )

    create_notification(
      title="New Resident",
      message=(
          f"{resident_name} has been registered as resident by {staff_name}"
      ),
      recipients=general_all,
      notif_type="REGISTRATION",
      web_route="profiling/resident/view/personal",
      web_params={"type": "viewing", "data": {"residentId": residentId, "familyId": familyId}},
      mobile_route="/(profiling)/resident/details",
      mobile_params={"resident": json_data},
    )
          
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
      password="!"
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

    created_instances = []
    for house in house_instances:
       house.save()
       created_instances.append(house)
    
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
      fc_role="INDEPENDENT",
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
      bus_id=generate_business_no(),
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

  