from django.contrib import admin

from .models import *

admin.site.site_header = 'JP Laos - 3W Dashboard'
admin.site.site_title = '3W administration'


class LocationInline(admin.TabularInline):
    model = Location
    extra = 1


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):

    inlines = (LocationInline,)
    list_filter = ['partner', 'sector']
    search_fields = ['project_title', 'project_code']
    filter_horizontal = ('implementing_partner',)
    list_display = [
        'id',
        'project_code',
        'project_title',
        'status_code',
        'partner',
        'sector',
        'planed_amount'
    ]

    def get_queryset(self, request):
        qs = super(ProjectAdmin, self).get_queryset(request)
        if request.user.is_superuser:
            return qs

        return qs.filter(partner__in=request.user.partner_set.values_list('pk'))

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'partner':
            if not request.user.is_superuser:
                kwargs["queryset"] = Partner.objects.filter(id__in=request.user.partner_set.values_list('pk'))
        return super(ProjectAdmin, self).formfield_for_foreignkey(
            db_field, request, **kwargs)


@admin.register(ImplementingPartner)
class ImplementingPartnersAdmin(admin.ModelAdmin):

    search_fields = ['implementing_partner_name']
    list_display = [
        'id',
        'implementing_partner_name'
    ]


@admin.register(Province)
class ProvinceAdmin(admin.ModelAdmin):

    search_fields = ['name']
    list_display = [
        'name',
        'pcode',
        'name_l'
    ]


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):

    list_filter = ['province']
    search_fields = ['name']
    list_display = [
        'dcode',
        'name',
        'name_l',
        'province'
    ]


admin.site.register([
    Sector,
    Partner,
    Subsector,
    PriorityArea,
    CrossCuttingIssue,
    SustainableDevelopmentGoal,
    NSEDPOutput,
    NSEDPOutcome,
])
