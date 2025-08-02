from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Add pdf_url field to ordinance_template table'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Add pdf_url column if it doesn't exist
            cursor.execute("""
                ALTER TABLE ordinance_template 
                ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500) NULL;
            """)
            
            self.stdout.write(
                self.style.SUCCESS('Successfully added pdf_url field to ordinance_template table')
            ) 