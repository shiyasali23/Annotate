from django.urls import path # type: ignore
from . import views

urlpatterns = [

    path('diseases', views.handle_diseases, name='diseases'),

]