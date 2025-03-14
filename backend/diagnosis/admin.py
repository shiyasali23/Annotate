from django.contrib import admin
from .models import (
    Disease, Symptom, Medication, Precaution, Diet
)

admin.site.register(Disease)
admin.site.register(Symptom)
admin.site.register(Medication)
admin.site.register(Precaution)
admin.site.register(Diet)