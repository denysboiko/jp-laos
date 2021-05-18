from .models import *
from django.contrib import admin
from django.contrib.admin import AdminSite, ModelAdmin

admin.site.site_header = 'JP Laos - 3W Dashboard'
admin.site.site_title = '3W administration'


class LocationInline(admin.TabularInline):
    model = Location
    extra = 1


class ProjectAdmin(admin.ModelAdmin):

    inlines = (LocationInline,)
    list_filter = ['partner','sector']
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
        """Limit Pages to those that belong to the request's user."""
        qs = super(ProjectAdmin, self).get_queryset(request)
        if request.user.is_superuser:
            # It is mine, all mine. Just return everything.
            return qs
        # Now we just add an extra filter on the queryset and
        # we're done. Assumption: Page.owner is a foreignkey
        # to a User.

        # print()
        return qs.filter(partner__in=request.user.partner_set.values_list('pk'))

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Limit choices for 'picture' field to only your pictures."""
        if db_field.name == 'partner':
            if not request.user.is_superuser:
                kwargs["queryset"] = Partner.objects.filter(id__in=request.user.partner_set.values_list('pk'))
        return super(ProjectAdmin, self).formfield_for_foreignkey(
            db_field, request, **kwargs)


class ImplementingParntersAdmin(admin.ModelAdmin):

    search_fields = ['implementing_partner_name']
    list_display = [
        'id',
        'implementing_partner_name'
    ]


class ProvinceAdmin(admin.ModelAdmin):

    search_fields = ['name']
    list_display = [
        'name',
        'pcode',
        'name_l'
    ]


class DistrictAdmin(admin.ModelAdmin):

    list_filter = ['province']
    search_fields = ['name']
    list_display = [
        'dcode',
        'name',
        'name_l',
        'province'
    ]

admin.site.register(Project, ProjectAdmin)
admin.site.register(ImplementingPartner, ImplementingParntersAdmin)
admin.site.register(Province, ProvinceAdmin)
admin.site.register(District, DistrictAdmin)
admin.site.register([Sector, Partner, Subsector])
