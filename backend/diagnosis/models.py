from django.db import models
from adminpanel.models import BaseModel, Category


class Disease(BaseModel):  
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)  # Optional description
    
    class Meta:
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return self.name


class Symptom(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL,  
        null=True,
        blank=True,
        related_name='symptoms'
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['name', 'category']),
        ]

    def __str__(self):
        return self.name


class Medication(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    diseases = models.ManyToManyField(
        Disease, 
        related_name='medications'
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return self.name


class Precaution(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    diseases = models.ManyToManyField(
        Disease, 
        related_name='precautions'
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return self.name


class Diet(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    diseases = models.ManyToManyField(
        Disease, 
        related_name='diets'
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return self.name
