from django.contrib import admin

from django.urls import path, include
from rest_framework import routers

from jplaos.views import home, ProvinceViewSet, DistrictViewSet, ProjectViewSet, import_sheet

router = routers.DefaultRouter()
router.register(r'provinces', ProvinceViewSet)
router.register(r'districts', DistrictViewSet)
router.register(r'projects', ProjectViewSet)

urlpatterns = [
    path('', home),
    path('', include('smart_selects.urls')),
    path('', include(router.urls)),

    path('upload/', import_sheet),

    path('admin/', admin.site.urls),
]