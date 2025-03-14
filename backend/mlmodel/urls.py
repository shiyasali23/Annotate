from django.urls import path 
from . import views

urlpatterns = [

    path('register_prediction', views.handle_predictions, name='predictions'),

]