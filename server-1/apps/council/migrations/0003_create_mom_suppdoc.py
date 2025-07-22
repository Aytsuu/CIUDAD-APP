from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('council', '0002_rename_mom_num_minutesofmeeting_mom_id_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='MOMSuppDoc',
            fields=[
                ('momsp_id', models.BigAutoField(primary_key=True, serialize=False)),
                ('momsp_is_archive', models.BooleanField(default=False)),
                ('mom_id', models.ForeignKey(blank=True, db_column='mom_id', null=True, on_delete=django.db.models.deletion.SET_NULL, to='council.minutesofmeeting')),
            ],
            options={
                'db_table': 'mom_supporting_document',
            },
        ),
    ]