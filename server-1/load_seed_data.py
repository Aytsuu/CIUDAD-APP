#!/usr/bin/env python
"""
Load sanitized seed data into database.
Run in preview environments after migrations.
"""
import os
import sys
import json
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from django.core import serializers
from django.db import transaction, connection

def check_if_seeded():
    """Check if database already has seed data"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT EXISTS (
                SELECT 1 FROM django_migrations 
                WHERE app = '_seed_data_marker'
            )
        """)
        return cursor.fetchone()[0]

def mark_as_seeded():
    """Mark database as seeded to prevent re-seeding"""
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO django_migrations (app, name, applied)
            VALUES ('_seed_data_marker', 'initial_seed', NOW())
            ON CONFLICT DO NOTHING
        """)

def load_json_fixture(filepath):
    """Load a JSON fixture file"""
    if not filepath.exists():
        print(f"⚠️  File not found: {filepath}")
        return 0
    
    with open(filepath, 'r') as f:
        data = f.read()
    
    try:
        objects = serializers.deserialize('json', data)
        count = 0
        
        for obj in objects:
            obj.save()
            count += 1
        
        return count
    except Exception as e:
        print(f"❌ Error loading {filepath.name}: {e}")
        return 0

def load_seed_data():
    """Load all seed data files"""
    print("="*70)
    print("Loading Seed Data")
    print("="*70)
    print()
    
    # Check if already seeded
    if check_if_seeded():
        print("ℹ️  Database already seeded (skipping)")
        print("To re-seed, remove the marker:")
        print("  DELETE FROM django_migrations WHERE app = '_seed_data_marker';")
        return
    
    seed_dir = Path(__file__).parent / 'seed_data'
    
    if not seed_dir.exists():
        print(f"⚠️  Seed data directory not found: {seed_dir}")
        print("Run export_sanitized_data.py first to create seed data")
        return
    
    # Load files in dependency order
    load_order = [
        'account_account.json',
        'administration_staff.json',
        'profiling_resident_profile.json',
        'profiling_personal.json',
        'profiling_personaladdress.json',
        'profiling_address.json',
        'profiling_business.json',
        'profiling_businessrespondent.json',
        'profiling_sitio.json'
    ]
    
    total_loaded = 0
    
    with transaction.atomic():
        for filename in load_order:
            filepath = seed_dir / filename
            
            if filepath.exists():
                print(f"📦 Loading: {filename}")
                count = load_json_fixture(filepath)
                print(f"   ✅ Loaded {count} records")
                total_loaded += count
            else:
                print(f"   ⚠️  Not found: {filename}")
        
        # Load any remaining files not in load_order
        for filepath in seed_dir.glob('*.json'):
            if filepath.name not in load_order and filepath.name != 'all_data.json':
                print(f"📦 Loading: {filepath.name}")
                count = load_json_fixture(filepath)
                print(f"   ✅ Loaded {count} records")
                total_loaded += count
        
        # Mark as seeded
        mark_as_seeded()
    
    print()
    print("="*70)
    print(f"✅ Loaded {total_loaded} total records")
    print("="*70)

if __name__ == '__main__':
    try:
        load_seed_data()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)