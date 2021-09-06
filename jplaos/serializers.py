from rest_framework import serializers

from .models import *


class PipelineFundingSerializer(serializers.ModelSerializer):
    partner = serializers.CharField(read_only=True, source="pipeline.partner.partner_name")
    sector = serializers.StringRelatedField()

    class Meta:
        model = PipelinePlannedAmount
        fields = (
            'partner',
            'sector',
            'amount'
        )


# class PipelineSerializer(serializers.ModelSerializer):
#     pipeline_by_partners = PipelineFundingSerializer(many=True)
#     priority_area = serializers.StringRelatedField()
#
#     class Meta:
#         model = Sector
#         fields = ('id', 'sector_name', 'priority_area', 'pipeline_by_partners')


class GreenCatSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    sub_category = serializers.ReadOnlyField()
    category = serializers.StringRelatedField()

    class Meta:
        model = GreenSubCategory
        fields = ('id', 'category', 'sub_category')


class DistinctSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    dcode = serializers.ReadOnlyField()
    name = serializers.ReadOnlyField()
    province = serializers.StringRelatedField()

    class Meta:
        model = District
        fields = ('id', 'dcode', 'name', 'province')


class ProvinceSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField()
    districts = serializers.SlugRelatedField(read_only=True, many=True, slug_field='dcode')

    class Meta:
        model = Province
        fields = ('name', 'districts')


class LocationSerializer(serializers.ModelSerializer):
    province = serializers.StringRelatedField()
    districts = serializers.SlugRelatedField(read_only=True, many=True, slug_field='dcode')

    class Meta:
        model = Location
        fields = ('province', 'districts')


class OutputSerializer(serializers.ModelSerializer):
    output = serializers.CharField()
    outcome = serializers.StringRelatedField()

    class Meta:
        model = NSEDPOutput
        fields = ('output', 'outcome')


class SectorByPriorityAreaSerializer(serializers.ModelSerializer):
    priority_area = serializers.StringRelatedField()

    class Meta:
        model = Sector
        fields = ('sector_name', 'priority_area')


class SectorSerializer(serializers.ModelSerializer):
    sector_name = serializers.CharField()
    priority_area = serializers.StringRelatedField()
    sdg = serializers.StringRelatedField(many=True)
    outcomes = serializers.StringRelatedField(many=True)

    class Meta:
        model = Sector
        fields = ('sector_name', 'priority_area', 'sdg', 'outcomes',)


class GreenCategorySerializer(serializers.ModelSerializer):
    funding_allocation = serializers.IntegerField(min_value=0)
    sub_category = serializers.StringRelatedField()
    category = serializers.StringRelatedField()

    class Meta:
        model = GreenSubCategoryFundingAllocation
        depth = 1
        fields = ('funding_allocation', 'sub_category', 'category')


class ModalityFundingSerializer(serializers.ModelSerializer):
    modality = serializers.StringRelatedField()
    allocation = serializers.IntegerField()

    class Meta:
        model = FundingByModality
        fields = ('modality', 'allocation')


class PartnerSerializer(serializers.ModelSerializer):
    partner = serializers.StringRelatedField()
    planed_amount = serializers.FloatField()

    class Meta:
        model = PartnerFunding
        fields = ('partner', 'planed_amount')


class PhakhaoLaoSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    allocation = serializers.IntegerField()

    class Meta:
        model = FundingByPhakhaoLaoCategory
        fields = ('category', 'allocation')


class ForestPartnershipSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    allocation = serializers.IntegerField()

    class Meta:
        model = FundingByForestPartnershipCategory
        fields = ('category', 'allocation')


class ProjectLightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    project_code = serializers.ReadOnlyField()
    project_title = models.CharField(max_length=80)
    status = serializers.ReadOnlyField(source='status_code')
    total_funding = serializers.ReadOnlyField()
    implementing_partner_categories = serializers.StringRelatedField(many=True)
    partners = PartnerSerializer(many=True)
    green_categories = GreenCategorySerializer(many=True)
    cross_cutting_issues = serializers.StringRelatedField(many=True)
    has_green_category = serializers.ReadOnlyField()
    sector = SectorSerializer()
    locations = LocationSerializer(many=True)
    is_regional = serializers.BooleanField()
    funding_by_modality = ModalityFundingSerializer(many=True)
    complementary_area_categories = serializers.StringRelatedField(many=True)
    green_catalyzers_categories = serializers.StringRelatedField(many=True)
    funding_by_phakhao_lao = PhakhaoLaoSerializer(many=True)
    funding_by_forest_partnership = ForestPartnershipSerializer(many=True)
    is_cofounded = serializers.BooleanField(source='get_is_cofounded')
    class Meta:
        model = Project
        fields = [
            'id',
            'project_code',
            'project_title',
            'status',
            'implementing_partner_categories',
            'sector',
            'partners',
            'green_categories',
            'cross_cutting_issues',
            'locations',
            'has_green_category',
            'total_funding',
            'funding_by_modality',
            'is_regional',
            'complementary_area_categories',
            'green_catalyzers_categories',
            'funding_by_phakhao_lao',
            'funding_by_forest_partnership',
            'is_cofounded'
        ]


class ProjectSerializer2(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    project_code = serializers.ReadOnlyField()
    project_title = models.CharField(max_length=80)
    status = serializers.ReadOnlyField(source='status_code')
    total_funding = serializers.ReadOnlyField()
    green_categories = GreenCategorySerializer(many=True)
    cross_cutting_issues = serializers.StringRelatedField(many=True)
    has_green_category = serializers.ReadOnlyField()
    sector = SectorSerializer()
    locations = LocationSerializer(many=True)
    is_regional = serializers.BooleanField()
    funding_by_modality = ModalityFundingSerializer(many=True)
    complementary_area_categories = serializers.StringRelatedField(many=True)
    green_catalyzers_categories = serializers.StringRelatedField(many=True)
    funding_by_phakhao_lao = PhakhaoLaoSerializer(many=True)
    funding_by_forest_partnership = ForestPartnershipSerializer(many=True)
    is_cofounded = serializers.BooleanField(source='get_is_cofounded')

    class Meta:
        model = Project
        fields = [
            'id',
            'project_code',
            'project_title',
            'status',
            'sector',
            'partners',
            'green_categories',
            'cross_cutting_issues',
            'locations',
            'has_green_category',
            'total_funding',
            'funding_by_modality',
            'is_regional',
            'complementary_area_categories',
            'green_catalyzers_categories',
            'funding_by_phakhao_lao',
            'funding_by_forest_partnership',
            'get_is_cofounded'
        ]


class PartnerSerializer2(serializers.ModelSerializer):
    partner = serializers.StringRelatedField()
    project = ProjectSerializer2()

    class Meta:
        model = PartnerFunding
        fields = ('partner', 'planed_amount', 'project')
