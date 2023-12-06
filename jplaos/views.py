from collections import defaultdict

import django_excel as excel
# import django_filters
# import django_filters
from django import forms
from django.contrib.auth.decorators import login_required
from django.db.models import Q, Count
from django.http import HttpResponseBadRequest, HttpResponse, JsonResponse
from django.shortcuts import render
from rest_framework import viewsets

from .serializers import *


@login_required(login_url='/admin/login/')
def home(request):
    return render(
        request,
        'index.html',
        {'user': request.user,
         'data': 'Hi'
         }
    )


class SDGViewSet(viewsets.ModelViewSet):
    serializer_class = SDGSerializer
    queryset = SustainableDevelopmentGoal.objects.all()


class ProjectLightViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectLightSerializer
    queryset = Project.objects.all()


def green_data(request):
    if request.method == 'GET':
        data = PartnerFunding.objects \
            .filter(Q(project__start_date__lte=datetime.datetime.today().date(),
                      project__end_date__gt=datetime.datetime.today().date())) \
            .values(
            'partner__partner_name',
            'project',
            'planed_amount'
        ).annotate(
            has_green1=Count('project__funding_by_green_category'),
            has_green3=Count('project__complementary_area_categories'),
            has_green4=Count('project__green_catalyzers_categories'),
        )

        data_with_green = filter(lambda d: d['has_green1'] + d['has_green3'] + d['has_green4'] > 0, data)

        fp = FundingByGreenCategory.objects.all().values('category__category', 'allocation', 'project')

        green_categories_by_project = defaultdict(list)
        for k in fp:
            green_categories_by_project[k['project']].append(k)

        results = []
        for d in data_with_green:
            project_id = d['project']
            green_categories = green_categories_by_project[project_id]
            if len(green_categories) > 0:
                for green_category in green_categories:
                    result = dict()
                    result['partner'] = d['partner__partner_name']
                    result['project'] = d['project']
                    result['category'] = green_category['category__category']
                    result['allocation'] = green_category['allocation'] / 100
                    result['total_amount'] = d['planed_amount']
                    result['planed_amount'] = d['planed_amount'] * (green_category['allocation'] / 100)
                    results.append(result)
            else:
                result = dict()
                result['partner'] = d['partner__partner_name']
                result['project'] = d['project']
                result['category'] = 'None'
                result['allocation'] = 1
                result['total_amount'] = d['planed_amount']
                result['planed_amount'] = d['planed_amount']
                results.append(result)

        return JsonResponse(results, safe=False)


# @login_required(login_url='/admin/login/')
def data(request):
    if request.method == 'GET':
        status = request.GET.get('status')
        if status is not None:
            statuses = status.split(',')
            fetched_results = PartnerFunding.objects \
                .filter(get_dates_filter(statuses, get_status_filter_related)) \
                .values(
                'partner__partner_name',
                'project',
                'funding_type__funding_type',
                'planed_amount',
                'project__project_title'
            )
        else:
            fetched_results = PartnerFunding.objects \
                .all().values(
                'partner__partner_name',
                'project',
                'funding_type__funding_type',
                'planed_amount',
                'project__project_title'
            )

        data_objects = []
        for d in fetched_results:
            result = dict()
            result['partner'] = d['partner__partner_name']
            result['project'] = d['project']
            result['funding_type'] = d['funding_type__funding_type']
            result['planed_amount'] = d['planed_amount']
            data_objects.append(result)

        return JsonResponse(data_objects, safe=False)


class PipelineView(viewsets.ModelViewSet):
    queryset = PipelinePlannedAmount.objects.all()
    serializer_class = PipelineFundingSerializer


class GreenCategories(viewsets.ModelViewSet):
    queryset = GreenSubCategory.objects.all()
    serializer_class = GreenCatSerializer


class SectorView(viewsets.ModelViewSet):
    queryset = Sector.objects.all()
    serializer_class = SectorByPriorityAreaSerializer


class ProvinceViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Province.objects.all()
    serializer_class = ProvinceSerializer


class DistrictViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = District.objects.all()
    serializer_class = DistinctSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    serializer_class = ProjectSerializer
    queryset = Project.objects.all()

    # filter_backends = [django_filters.rest_framework.DjangoFilterBackend]

    def get_queryset(self):
        """
        Optionally restricts the returned purchases to a given user,
        by filtering against a `username` query parameter in the URL.
        """
        queryset = Project.objects.all()
        status = self.request.query_params.get('status')
        if status is not None:
            statuses = status.split(',')
            queryset = queryset.filter(get_dates_filter(statuses, get_status_filter))
        return queryset


def get_dates_filter(statuses, mapper):
    queries = list(map(mapper, statuses))
    if len(queries) == 3:
        return queries[0] | queries[1] | queries[2]
    elif len(queries) == 2:
        return queries[0] | queries[1]
    elif len(queries) == 1:
        return queries[0]


def get_status_filter_related(status):
    today = datetime.datetime.today().date()
    ongoing_filter = Q(project__start_date__lte=today, project__end_date__gt=today)
    closed_filter = Q(project__end_date__lte=today)
    planned_filter = Q(project__start_date__gte=today)
    if status == 'ongoing':
        return ongoing_filter
    elif status == 'closed':
        return closed_filter
    elif status == 'planned':
        return planned_filter


def get_status_filter(status):
    today = datetime.datetime.today().date()
    ongoing_filter = Q(start_date__lte=today, end_date__gt=today)
    closed_filter = Q(end_date__lte=today)
    planned_filter = Q(start_date__gte=today)
    if status == 'ongoing':
        return ongoing_filter
    elif status == 'closed':
        return closed_filter
    elif status == 'planned':
        return planned_filter


class UploadFileForm(forms.Form):
    file = forms.FileField()


def upload(request):
    if request.method == "POST":
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            filehandle = request.FILES['file']
            return excel.make_response(filehandle.get_sheet(), "csv")
        else:
            return HttpResponseBadRequest()
    else:
        form = UploadFileForm()

    return render(request, 'upload.html', {'form': form})


@login_required(login_url='/admin/login/')
def import_sheet(request):
    if request.method == "POST":
        form = UploadFileForm(request.POST,
                              request.FILES)
        request.FILES['file'].save_to_database(
            # save_book_to_database
            # save_to_database
            model=Location,
            # ProjectByProvinces,
            # [ImplementingPartner, Subsector],
            # initializers=[None, None],
            mapdict=[
                'project_id',
                'province_id'
            ]
            # [
            #     'id',
            #     'dcode',
            #     'name',
            #     'name_l',
            #     'area',
            #     'province_id'
            # ]
            # [
            #     "project_code",
            #     "partner_id",
            #     "project_title",
            #     "start_date",
            #     "end_date",
            #     "sector_id",
            #     "other_subsector_id",
            #     "planed_amount"
            # ]
            # [
            #     "project_id",
            #     "province_id",
            #     "district_id"
            # ]
            # [
            #     'implementing_partner_name',
            # ]
            #     [
            #         'other_subsector_name',
            #     ]

        )
        if form.is_valid():
            return HttpResponse("OK")
        else:
            return HttpResponseBadRequest()
    else:
        form = UploadFileForm()
    return render(
        request,
        'upload.html',
        {'form': form})
