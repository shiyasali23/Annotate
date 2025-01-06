from django.urls import path
from . import views

urlpatterns = [

    path('symptoms/', views.symptoms_list, name='symptoms-list'),


]
