from django.urls import path
from .views import (
    signup, 
    login, 
    create_biometrics, 
    deactivate_user,
    update_user,
    get_user,
    logout
)

app_name = 'webapp'

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),

    path('user/', get_user, name='get-user'),
    path('deactivate/', deactivate_user, name='deactivate-user'),
    path('userupdate/', update_user, name='update-user'),
    
    path('biometrics/create/', create_biometrics, name='create-biometrics'),  
    
]
