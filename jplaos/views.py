import django_excel as excel
# import django_filters
# import django_filters
from django import forms
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseBadRequest, HttpResponse
from django.shortcuts import render
from rest_framework import viewsets
from django.db.models import Q

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
            queryset = queryset.filter(get_dates_filter(statuses))
        return queryset


def get_dates_filter(statuses):
    queries = list(map(get_status_filter, statuses))
    if len(queries) == 3:
        return queries[0] | queries[1] | queries[2]
    elif len(queries) == 2:
        return queries[0] | queries[1]
    elif len(queries) == 1:
        return queries[0]


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
            model= Location,
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
