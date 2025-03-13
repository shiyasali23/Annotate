from django.contrib import admin
from .models import (
    User,Biometrics,BiometricsEntry,FoodsScore
)

admin.site.register(User)
admin.site.register(BiometricsEntry)
admin.site.register(Biometrics)
admin.site.register(FoodsScore)
