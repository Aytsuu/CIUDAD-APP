from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import date
from apps.profiling.models import ResidentProfile, PersonalAddress
import logging

logger = logging.getLogger(__name__)

class AllResidentsView(APIView):
    def get(self, request):
        try:
            # Fetch residents with related person, addresses, and account
            residents = (
                ResidentProfile.objects
                .select_related('per', 'account')  # ✅ include account (OneToOne)
                .prefetch_related('per__personal_addresses__add')  # prefetch addresses
                .all()[:100]
            )

            results = []

            for resident in residents:
                person = getattr(resident, 'per', None)
                if not person:
                    continue

                # Build full name
                name_parts = [person.per_fname]
                if person.per_mname:
                    name_parts.append(person.per_mname)
                name_parts.append(person.per_lname)
                if person.per_suffix:
                    name_parts.append(person.per_suffix)
                full_name = " ".join(name_parts).strip()

                # Calculate age
                today = date.today()
                age = today.year - person.per_dob.year
                if (today.month, today.day) < (person.per_dob.month, person.per_dob.day):
                    age -= 1

                # Get address
                address_parts = []
                personal_address = getattr(person, 'personal_addresses', None)
                if personal_address:
                    first_address = personal_address.first()
                    if first_address and getattr(first_address, 'add', None):
                        addr = first_address.add
                        address_parts = [
                            addr.add_street,
                            addr.add_barangay,
                            addr.add_city,
                            addr.add_province,
                        ]

                # ✅ Get profile picture (from Account)
                profile_image = None
                if hasattr(resident, 'account') and resident.account:
                    profile_image = resident.account.profile_image

                results.append({
                    "id": resident.rp_id,
                    "rp_id": resident.rp_id,
                    "profile_image": profile_image,
                    "name": full_name,
                    "gender": person.per_sex or "Unknown",
                    "age": str(age),
                    "number": person.per_contact or "",
                    "address": ", ".join(filter(None, address_parts)),
                })

            return Response(results, status=200)

        except Exception as e:
            logger.error(f"Error fetching all residents: {e}")
            return Response([], status=500)
