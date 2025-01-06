from django.contrib import admin
from .models import MachineLearningModel, Prediction

# Register the models with the Django admin interface
admin.site.register(MachineLearningModel)
admin.site.register(Prediction)
