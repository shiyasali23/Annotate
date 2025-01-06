from django.urls import path
from . import views

urlpatterns = [

    # Condition URLs
    path('conditions/', views.condition_list, name='condition-list'),

    # Biochemical URLs
    path('biochemicals/', views.biochemical_list, name='biochemical-list'),

    # Food URLs
    path('foods/', views.food_list, name='food-list'),

]
