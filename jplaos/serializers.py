from .models import *
from django.contrib.auth.models import User, Group
from rest_framework import serializers


class DistinctSerializer(serializers.ModelSerializer):

    id = serializers.ReadOnlyField()
    dcode = serializers.ReadOnlyField()
    name = serializers.ReadOnlyField()
    province = serializers.StringRelatedField()

    class Meta:
        model = District
        fields = ('id','dcode','name', 'province')


class ProvinceSerializer(serializers.ModelSerializer):

    name = serializers.ReadOnlyField()
    districts = serializers.SlugRelatedField(read_only=True, many=True, slug_field='dcode')
        # serializers.StringRelatedField(many=True)
        # DistinctSerializer(many=True)

    class Meta:
        model = Province
        fields = ('name','districts')
# ,'district'


class LocationSerializer(serializers.ModelSerializer):

    province = serializers.StringRelatedField()
    districts = serializers.SlugRelatedField(read_only=True,many=True,slug_field='dcode')
        # serializers.StringRelatedField(many=True)


    class Meta:
        model = Location
        fields = ('province', 'districts')
        # , 'districts'

class ProjectSerializer(serializers.ModelSerializer):

    id = serializers.ReadOnlyField()
    project_code = serializers.ReadOnlyField()
    project_title = models.CharField(max_length=80)
    planed_amount = models.FloatField()
    partner = serializers.StringRelatedField()
    status = serializers.ReadOnlyField(source='status_code')
        # StringRelatedField()
    implementing_partner = serializers.StringRelatedField(many=True)

    # implementing_partner = serializers.StringRelatedField()

    sector = serializers.StringRelatedField()
    other_subsector = serializers.StringRelatedField()

    # province = serializers.StringRelatedField(many=True)
    # province_l = serializers.SlugRelatedField(
    #     many=True,
    #     read_only=True,
    #     slug_field='name_l',
    #     source='province'
    #  )

    locations = LocationSerializer(many=True)
    # district = DistinctSerializer(many=True)
    # serializers.StringRelatedField(many=True)
        #
        # serializers.StringRelatedField(many=True)
        # ProvinceAmountSerializer(many=True, source='project_by_provinces_set')

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
            # 'province',
            # 'province_l',
            # 'district',
            'locations'
        ]