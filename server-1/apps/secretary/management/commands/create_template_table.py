from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Create ordinance_template table manually'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Create the table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ordinance_template (
                    template_id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    template_body TEXT NOT NULL,
                    with_seal BOOLEAN DEFAULT FALSE,
                    with_signature BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE
                );
            """)
            
            # Create index for ordering
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_ordinance_template_created_at 
                ON ordinance_template(created_at DESC);
            """)
            
            self.stdout.write(
                self.style.SUCCESS('Successfully created ordinance_template table')
            ) 