from adminpanel.models import BaseModel
from django.db import models 

class Prediction(BaseModel):
    user = models.ForeignKey('webapp.User', on_delete=models.SET_NULL, null=True, blank=True)
    model_id = models.CharField(max_length=100)
    prediction = models.JSONField()
    probability = models.JSONField(null=True, blank=True)
    
    def __str__(self):
        return self.model_id

