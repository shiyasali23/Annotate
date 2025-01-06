from django.urls import path
from .views import register_model, models_list, get_prediction, get_diagnosis_model

urlpatterns = [
    path('register_model/', register_model, name='register_model'),
    path('list/', models_list, name='models_list'),
    path('diagnosis/', get_diagnosis_model, name='get_diagnosis_model'),
    path('predict/', get_prediction, name='get_prediction'),
]
