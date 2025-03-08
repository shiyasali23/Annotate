from django.urls import path
from . import views

app_name = 'webapp'

urlpatterns = [

    path('signup', views.signup, name='signup'),
    path('authenticate', views.authenticate, name='authenticate'),
    
    path('user/update', views.handle_user, name='user_update'),
    
    path('biometrics', views.handle_biometrics, name='biometrics'),
   
    path('food_scores', views.handle_food_score, name='food_scores'),


]