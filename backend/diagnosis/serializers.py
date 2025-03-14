from rest_framework import serializers
from .models import Disease, Medication, Precaution, Diet

class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = [ 'name']

class PrecautionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Precaution
        fields = [ 'name']

class DietSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diet
        fields = [ 'name']

class DiseaseSerializer(serializers.ModelSerializer):
    medications = MedicationSerializer(many=True, read_only=True)
    precautions = PrecautionSerializer(many=True, read_only=True)
    diets = DietSerializer(many=True, read_only=True)

    class Meta:
        model = Disease
        fields = [ 'name', 'description', 'medications', 'precautions', 'diets']
