from django.urls import path
from . import views

urlpatterns = [

    path('biochemichals/', views.handle_biochemicals, name='biochemicals'),


]