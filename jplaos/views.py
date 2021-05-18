import django_excel as excel
from django import forms
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseBadRequest, HttpResponse
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
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


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
