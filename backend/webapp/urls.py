from django.urls import path
from . import views

app_name = 'webapp'

urlpatterns = [

    path('signup', views.signup, name='signup'),
    path('authenticate', views.authenticate, name='authenticate'),
    path('biometrics', views.biometrics_view, name='biometrics'),
    path('user/update', views.user_view, name='user_update'),


]