from django.urls import path
from . import views

urlpatterns = [

    path('signup', views.signup, name='signup'),
    path('authenticate', views.authenticate, name='authenticate'),
    path('biometrics', views.biometrics_view, name='biometrics'),


]