from rest_framework import serializers
from .models import MachineLearningModel, Prediction
import json


class MachineLearningModelSerializer(serializers.ModelSerializer):
    highest_feature_impact = serializers.SerializerMethodField()

    class Meta:
        model = MachineLearningModel
        fields = '__all__'
        
    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super(MachineLearningModelSerializer, self).__init__(*args, **kwargs)
        
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    def get_highest_feature_impact(self, obj):
        if obj.feature_impacts:
            impacts = json.loads(obj.feature_impacts)
            highest_feature = max(impacts, key=impacts.get)
            return highest_feature
        return None

    def create(self, validated_data):
        name = validated_data.get('name')
        version = validated_data.get('version')
        id = validated_data.get('id')

        model_instance = MachineLearningModel.objects.filter(name=name, version=version, id=id).first()

        if model_instance:
            return model_instance
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class PredictionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Prediction
        fields = '__all__'


