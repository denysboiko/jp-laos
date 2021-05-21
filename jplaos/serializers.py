from rest_framework import serializers

from .models import *


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


class ProjectSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    project_code = serializers.ReadOnlyField()
    project_title = models.CharField(max_length=80)
    planed_amount = models.FloatField()
    partner = serializers.StringRelatedField()
    status = serializers.ReadOnlyField(source='status_code')
    implementing_partner = serializers.StringRelatedField(many=True)

    cross_cutting_issues = serializers.StringRelatedField(many=True)

    sector = serializers.StringRelatedField()
    other_subsector = serializers.StringRelatedField()
    locations = LocationSerializer(many=True)

    class Meta:
        model = Project
        fields = [
            'id',
            'project_code',
            'project_title',
            'status',
            'implementing_partner',
            'sector',
            'partner',
            'planed_amount',
            'other_subsector',
            'cross_cutting_issues',
            'locations'
        ]