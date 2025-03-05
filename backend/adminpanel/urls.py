from django.urls import path
from . import views

urlpatterns = [

    path('biochemicals', views.handle_biochemicals, name='biochemicals'),
    path('conditions', views.handle_conditions, name='conditions'),
    path('food_nutrients', views.handle_food_nutrients, name='food_nutrients'),


]