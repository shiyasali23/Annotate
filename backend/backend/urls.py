
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('backend/', include('adminpanel.urls')),
    path('backend/', include('webapp.urls')),
    path('backend/', include('diagnosis.urls')),
    path('backend/', include('mlmodel.urls')),
]

