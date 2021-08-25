from django.contrib import admin
from django.urls import path, include
from rest_framework import routers

from jplaos.views import home, ProvinceViewSet, DistrictViewSet, ProjectViewSet, import_sheet, GreenCategories, \
    PipelineView, SectorView, FundingView, data, green_data

router = routers.DefaultRouter()
router.register(r'provinces', ProvinceViewSet)
router.register(r'districts', DistrictViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'green-categories', GreenCategories)
router.register(r'pipelines', PipelineView)
router.register(r'sectors', SectorView)
router.register(r'funding', FundingView)

urlpatterns = [
    path('', home),
    path('', include('smart_selects.urls')),
    path('', include(router.urls)),
    path('upload/', import_sheet),
    path('data/', data),
    path('green-data/', green_data),
    path('admin/', admin.site.urls),
    path('projects/<slug:status>/', ProjectViewSet.as_view({'get': 'list'}))
]
