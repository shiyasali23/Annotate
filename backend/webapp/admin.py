from django.contrib import admin
from .models import (
    User,Biometrics,BiometricsEntry
)

admin.site.register(User)
admin.site.register(BiometricsEntry)
admin.site.register(Biometrics)
