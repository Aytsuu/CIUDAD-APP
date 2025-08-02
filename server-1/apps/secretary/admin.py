from django.contrib import admin
from .models import Ordinance, OrdinanceSupplementaryDoc

@admin.register(Ordinance)
class OrdinanceAdmin(admin.ModelAdmin):
    list_display = ('ord_num', 'ord_title', 'ord_date_created', 'ord_category', 'ord_year', 'ord_is_archive')
    list_filter = ('ord_category', 'ord_year', 'ord_is_archive')
    search_fields = ('ord_num', 'ord_title', 'ord_details')
    date_hierarchy = 'ord_date_created'

@admin.register(OrdinanceSupplementaryDoc)
class OrdinanceSupplementaryDocAdmin(admin.ModelAdmin):
    list_display = ('osd_id', 'osd_title', 'ordinance', 'osd_is_archive')
    list_filter = ('osd_is_archive',)
    search_fields = ('osd_title', 'ordinance__ord_num') 