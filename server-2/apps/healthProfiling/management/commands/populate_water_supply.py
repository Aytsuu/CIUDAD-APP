from django.core.management.base import BaseCommand
from apps.healthProfiling.models import WaterSupply, Household


class Command(BaseCommand):
    help = 'Populate water supply types with initial data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting water supply data population...'))

        # First, we need to check if we have any households to link to
        # For now, we'll create sample water supply types without household links
        # You can modify this later to link to specific households

        water_supply_data = [
            {
                'water_sup_id': 'level1',
                'water_sup_type': 'LEVEL I',
                'water_conn_type': 'POINT SOURCE',
                'water_sup_desc': 'Developed/protected/improved spring or dug well without distribution/piping system. This includes springs, dug wells, and other point sources that are protected from contamination.'
            },
            {
                'water_sup_id': 'level2',
                'water_sup_type': 'LEVEL II',
                'water_conn_type': 'COMMUNAL (COMMON) FAUCET OR STAND POST',
                'water_sup_desc': 'HH using point source with distribution system to a communal (common) faucet or stand post. Water is distributed through a simple distribution system to a shared public tap.'
            },
            {
                'water_sup_id': 'level3',
                'water_sup_type': 'LEVEL III',
                'water_conn_type': 'INDIVIDUAL CONNECTION',
                'water_sup_desc': 'HH with faucet/tap (e.g. water supplied by MCWD, BWSA, Homeowner\'s Association, or private deep well). Individual household connection with piped water supply system.'
            }
        ]

        # Get a sample household if available, otherwise we'll need to create one or handle null
        sample_household = Household.objects.first()
        
        if not sample_household:
            self.stdout.write(
                self.style.WARNING(
                    'No households found. These water supply records will need to be linked to households later.'
                )
            )
            return

        created_count = 0
        updated_count = 0

        for data in water_supply_data:
            water_supply, created = WaterSupply.objects.get_or_create(
                water_sup_id=data['water_sup_id'],
                defaults={
                    'water_sup_type': data['water_sup_type'],
                    'water_conn_type': data['water_conn_type'],
                    'water_sup_desc': data['water_sup_desc'],
                    'hh': sample_household  # Link to sample household
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created water supply type: {data["water_sup_type"]}')
                )
            else:
                # Update existing record
                water_supply.water_sup_type = data['water_sup_type']
                water_supply.water_conn_type = data['water_conn_type']
                water_supply.water_sup_desc = data['water_sup_desc']
                water_supply.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated existing water supply type: {data["water_sup_type"]}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully processed water supply data: {created_count} created, {updated_count} updated'
            )
        )
