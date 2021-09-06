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
    #
    # def formfield_for_foreignkey(self, db_field, request, **kwargs):
    #     if db_field.name == 'partner':
    #         if not request.user.is_superuser:
    #             user_primary_partner = request.user.partner_user.primary_partner.id
    #             kwargs["queryset"] = Partner.objects.filter(id=user_primary_partner)
    #     return super(PartnerInline, self).formfield_for_foreignkey(db_field, request, **kwargs)


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


class FundingByGreenCategoryInline(admin.TabularInline):
    model = FundingByGreenCategory
    extra = 1
    classes = ['collapse']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    inlines = (
        LocationInline,
        PartnerInline,
        FundingByGreenCategoryInline
    )

    fieldsets = (
        (None, {
            'fields': (
                ('project_code', 'is_regional'),
                'project_title',
                ('start_date', 'end_date'),
                'sector',
                'cross_cutting_issues',
                'implementing_partner_categories'

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
        'implementing_partner_categories', 'complementary_area_categories', 'green_catalyzers_categories',
        'cross_cutting_issues')
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
        user_primary_partner = request.user.partner_user.primary_partner
        projects = PartnerFunding.objects.filter(partner=user_primary_partner).values_list('project_id')
        return qs.filter(id__in=projects)




@admin.register(Pipeline)
class PipelineAdmin(admin.ModelAdmin):
    inlines = (PipelineAllocationInline,)
    list_display = [
        'id',
        'partner'
    ]

    def get_form(self, request, obj=None, **kwargs):
        if not request.user.is_superuser:
            self.exclude = ('partner',)
        form = super(PipelineAdmin, self).get_form(request, obj, **kwargs)
        return form

    def save_model(self, request, obj, form, change):
        if not request.user.is_superuser:
            partner = request.user.partner_user.primary_partner
            obj.partner = partner
        super().save_model(request, obj, form, change)


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
    PartnerUser,
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
    Modality,
    GreenCategory
])
