"""jp_laos URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
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
