from django.urls import path
from . import views

app_name = 'webapp'

urlpatterns = [

    path('signup', views.signup, name='signup'),
    path('authenticate', views.authenticate, name='authenticate'),
    
    path('user/update', views.handle_user, name='user-update-create'),
    
    path('biometrics', views.handle_biometrics, name='biometrics'),
    path('foods_score/create', views.handle_foods_score, name='foods-score-create'),
   


]