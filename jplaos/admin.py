from django.contrib import admin

from .models import *

admin.site.site_header = 'JP Laos - 3W Dashboard'
admin.site.site_title = '3W administration'


class LocationInline(admin.TabularInline):
    model = Location
    extra = 1


class PartnerInline(admin.TabularInline):
    model = PartnerFunding
    extra = 1


class GreenCategoryInline(admin.StackedInline):
    model = GreenSubCategoryFundingAllocation
    extra = 1
    classes = ['collapse']


class PipelineAllocationInline(admin.TabularInline):
    model = PipelinePlannedAmount
    extra = 1
    classes = ['collapse']


class FundingByModalityInline(admin.TabularInline):
    model = FundingByModality
    extra = 1


# PhakhaoLaoCategory
# ForestPartnershipCategory
# forest_partnership_categories
# phakhao_lao_categories
# FundingByPhakhaoLaoCategory
# FundingByForestPartnershipCategory
class FundingByPhakhaoLaoCategoryInline(admin.TabularInline):
    model = FundingByPhakhaoLaoCategory
    extra = 1
    classes = ['collapse']


class FundingByForestPartnershipCategoryInline(admin.TabularInline):
    model = FundingByForestPartnershipCategory
    extra = 1
    classes = ['collapse']



@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    inlines = (
        FundingByModalityInline,
        LocationInline,
        PartnerInline,
        FundingByPhakhaoLaoCategoryInline,
        FundingByForestPartnershipCategoryInline
    )

    fieldsets = (
        (None, {
            'fields': (
                'project_code',
                'project_title',
                ('start_date', 'end_date'),
                'is_regional',
                'implementing_partner',
                'sector',
                'cross_cutting_issues',

            )
        }),
        ('Team Europe Initiative', {
            'classes': ('collapse',),
            'fields': ('complementary_area_categories', 'green_catalyzers_categories'),
        }),
    )

    list_filter = ['sector', 'is_regional']
    search_fields = ['project_title', 'project_code']
    filter_horizontal = (
    'implementing_partner', 'complementary_area_categories', 'green_catalyzers_categories', 'cross_cutting_issues')
    # filter_vertical = ()
    list_display = [
        'id',
        'project_code',
        'project_title',
        'status_code',
        'sector',
        'is_regional',
        'get_is_cofounded',
        'total_funding'
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


@admin.register(Pipeline)
class PipelineAdmin(admin.ModelAdmin):

    inlines = (PipelineAllocationInline, )
    list_display = [
        'id',
        'partner'
    ]


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


@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'sector_name',
    ]


admin.site.register([
    Partner,
    PriorityArea,
    CrossCuttingIssue,
    SustainableDevelopmentGoal,
    NSEDPOutput,
    NSEDPOutcome,
    ComplementaryAreaCategory,
    GreenCatalyzersCategory,
    PhakhaoLaoCategory,
    ForestPartnershipCategory,
    Modality
])
