from django.urls import path
from . import views

urlpatterns = [

    path('diseases', views.handle_diseases, name='diseases'),
    


]