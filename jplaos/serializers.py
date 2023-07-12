from rest_framework import serializers

from .models import *


class PipelineFundingSerializer(serializers.ModelSerializer):
    priority_area = serializers.CharField(read_only=True, source="sector.priority_area.priority_area")
    partner = serializers.CharField(read_only=True, source="pipeline.partner.partner_name")
    sector = serializers.StringRelatedField()

    class Meta:
        model = PipelinePlannedAmount
        fields = (
            'partner',
            'sector',
            'priority_area',
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


class SDGSerializer(serializers.ModelSerializer):
    class Meta:
        model = SustainableDevelopmentGoal
        fields = ('id', 'goal', 'short_name',)


class PriorityAreaSerializer(serializers.ModelSerializer):
    outcomes = serializers.StringRelatedField(many=True)

    class Meta:
        model = PriorityArea
        fields = ('priority_area', 'sdg', 'outcomes',)


class GreenCategorySerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
    allocation = serializers.IntegerField(min_value=0)

    class Meta:
        model = FundingByGreenCategory
        depth = 1
        fields = ('category', 'allocation')


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


class ProjectLightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    project_code = serializers.ReadOnlyField()
    project_title = models.CharField(max_length=80)
    status = serializers.ReadOnlyField(source='status_code')
    start_date = serializers.DateField(format="%d/%m/%Y")
    end_date = serializers.DateField(format="%d/%m/%Y")
    total_funding = serializers.ReadOnlyField()
    implementing_partner_categories = serializers.StringRelatedField(many=True)
    partners = PartnerSerializer(many=True)
    cross_cutting_issues = serializers.StringRelatedField(many=True)
    has_green_category = serializers.ReadOnlyField()
    sector = serializers.StringRelatedField()
    locations = LocationSerializer(many=True)
    is_regional = serializers.BooleanField()
    funding_by_green_category = GreenCategorySerializer(many=True)
    complementary_area_categories = serializers.StringRelatedField(many=True)
    outcomes = serializers.StringRelatedField(many=True)
    green_catalyzers_categories = serializers.StringRelatedField(many=True)
    is_cofounded = serializers.BooleanField(source='get_is_cofounded')
    priority_area = PriorityAreaSerializer(source='sector.priority_area')

    class Meta:
        model = Project
        fields = [
            'id',
            'project_code',
            'project_title',
            'status',
            'start_date',
            'end_date',
            'implementing_partner_categories',
            'sector',
            'partners',
            'cross_cutting_issues',
            'locations',
            'outcomes',
            'has_green_category',
            'total_funding',
            'is_regional',
            'funding_by_green_category',
            'complementary_area_categories',
            'green_catalyzers_categories',
            'is_cofounded',
            'priority_area',
            'additional_info'
        ]
