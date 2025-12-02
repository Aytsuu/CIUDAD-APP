from django.core.management.base import BaseCommand
from apps.medicalConsultation.utils import create_future_date_slots

class Command(BaseCommand):
    help = 'Generates medical consultation slots'

    def handle(self, *args, **kwargs):
        self.stdout.write("Generating slots...")
        create_future_date_slots(days_in_advance=30)
        self.stdout.write(self.style.SUCCESS('Successfully created future slots.'))