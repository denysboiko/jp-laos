from django.contrib import admin

from .models import *

admin.site.site_header = 'Team Europe Dashboard'
admin.site.site_title = 'Team Europe Dashboard'


class LocationInline(admin.TabularInline):
    insert_before = 'additional_info'
    help_text = "If this parameter is left blank, the project is considered to be national"
    model = Location
    extra = 1


class PartnerInline(admin.TabularInline):
    insert_before = 'sector'
    model = PartnerFunding
    extra = 1
    #
    # def formfield_for_foreignkey(self, db_field, request, **kwargs):
    #     if db_field.name == 'partner':
    #         if not request.user.is_superuser:
    #             user_primary_partner = request.user.partner_user.primary_partner.id
    #             kwargs["queryset"] = Partner.objects.filter(id=user_primary_partner)
    #     return super(PartnerInline, self).formfield_for_foreignkey(db_field, request, **kwargs)


class PipelineAllocationInline(admin.TabularInline):
    model = PipelinePlannedAmount
    extra = 1
    classes = ['collapse']


class FundingByModalityInline(admin.TabularInline):
    model = FundingByModality
    extra = 1


class FundingByGreenCategoryInline(admin.TabularInline):
    insert_before = 'complementary_area_categories'
    model = FundingByGreenCategory
    extra = 1


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
                'funding_type',
                'project_title',
                ('start_date', 'end_date'),
                'programming_cycle',
                'sector',
                'implementing_partner_categories',
                'cross_cutting_issues',
                'outcomes',
            )
        }),
        ('Team Europe Initiative', {
            'classes': ('collapse',),
            'fields': ('complementary_area_categories', 'green_catalyzers_categories'),
        }),
        (None, {
            'fields': (
                'additional_info',
            )
        })
    )

    list_filter = ['sector', 'is_regional']
    search_fields = ['project_title', 'project_code']
    filter_horizontal = (
        'implementing_partner_categories', 'complementary_area_categories', 'green_catalyzers_categories',
        'cross_cutting_issues', 'outcomes')
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
    change_form_template = 'admin/custom/change_form.html'

    class Meta:
        help_texts = {
            'cross_cutting_issues': "If this parameter is left blank, the project is considered to be national"}

    class Media:
        css = {
            'all': (
                'css/admin.css',
            )
        }

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
    ImplementingPartnerCategory,
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
