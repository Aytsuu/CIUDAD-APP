from django.apps import AppConfig

<<<<<<<< HEAD:server-2/apps/reports/apps.py

class ReportsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.reports'
========
class ActLogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.act_log' 
>>>>>>>> master-pao-backup:server-1/apps/act_log/apps.py
