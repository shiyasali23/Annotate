
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/adminpanel/', include('adminpanel.urls')),
    path('api/webapp/', include('webapp.urls')), 
    path('api/mlmodels/', include('mlmodels.urls')), 
    path('api/diagnosis/', include('diagnosis.urls')), 
   
]

# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)