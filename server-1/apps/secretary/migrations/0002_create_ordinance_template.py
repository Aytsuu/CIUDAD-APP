# Generated manually to create ordinance_template table

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('secretary', '0001_initial'),
        ('file', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='OrdinanceTemplate',
            fields=[
                ('template_id', models.AutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('template_body', models.TextField()),
                ('with_seal', models.BooleanField(default=False)),
                ('with_signature', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('header_media', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='template_headers', to='file.file')),
            ],
            options={
                'db_table': 'ordinance_template',
                'ordering': ['-created_at'],
            },
        ),
    ] 