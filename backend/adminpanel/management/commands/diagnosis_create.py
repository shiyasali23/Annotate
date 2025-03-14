from django.core.management.base import BaseCommand
from django.db import transaction
from django.conf import settings
from diagnosis.models import Disease, Symptom, Medication, Precaution, Diet
from adminpanel.models import Category

import pandas as pd
import os
import sys
from collections import defaultdict

class Command(BaseCommand):
    help = 'Create diagnosis data from CSV file'
    error = "Error creating diagnosis"

    def handle(self, *args, **kwargs):
        try:
            base_path = os.path.join(settings.BASE_DIR, "datasets/")
            
            
            descriptions_df = pd.read_csv(os.path.join(base_path, 'new_description.csv'))
            diets_df = pd.read_csv(os.path.join(base_path, 'new_diets_df.csv'))
            medications_df = pd.read_csv(os.path.join(base_path, 'new_medications_df.csv'))
            precautions_df = pd.read_csv(os.path.join(base_path, 'new_precautions_df.csv'))
            symptoms_category_df = pd.read_csv(os.path.join(base_path, 'symptoms_category_df.csv'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"{self.error}: reading CSV file: {e}"))
            sys.exit(1)

        with transaction.atomic():
            try:
                
                disease_objects = [
                    Disease(name=row['Disease'], description=row['Description'])
                    for _, row in descriptions_df.iterrows()
                ]
                Disease.objects.bulk_create(disease_objects)
                
                # Create a lookup dictionary for diseases
                disease_lookup = {disease.name: disease for disease in Disease.objects.all()}
                
                # Create categories and symptoms with bulk operations
                categories = set(symptoms_category_df['Category'])
                category_objects = [Category(name=category) for category in categories]
                Category.objects.bulk_create(category_objects)
                
                # Create category lookup
                category_lookup = {category.name: category for category in Category.objects.all()}
                
                # Create symptoms
                symptom_objects = [
                    Symptom(name=row['Symptom'], category=category_lookup[row['Category']])
                    for _, row in symptoms_category_df.iterrows()
                ]
                Symptom.objects.bulk_create(symptom_objects)
                
                # Process medications
                medication_columns = [col for col in medications_df.columns if col != 'Disease']
                medication_objects = [Medication(name=medication) for medication in medication_columns]
                Medication.objects.bulk_create(medication_objects)
                
                # Create medication lookup
                medication_lookup = {med.name: med for med in Medication.objects.all()}
                
                # Create medication-disease relationships
                medication_disease_relations = []
                for medication in medication_columns:
                    medication_instance = medication_lookup[medication]
                    diseases_to_add = [
                        disease_lookup[row['Disease']]
                        for _, row in medications_df[medications_df[medication] == 1].iterrows()
                    ]
                    for disease in diseases_to_add:
                        medication_instance.diseases.add(disease)
                
                # Process precautions
                precaution_columns = [col for col in precautions_df.columns if col != 'Disease']
                precaution_objects = [Precaution(name=precaution) for precaution in precaution_columns]
                Precaution.objects.bulk_create(precaution_objects)
                
                # Create precaution lookup
                precaution_lookup = {prec.name: prec for prec in Precaution.objects.all()}
                
                # Create precaution-disease relationships
                for precaution in precaution_columns:
                    precaution_instance = precaution_lookup[precaution]
                    diseases_to_add = [
                        disease_lookup[row['Disease']]
                        for _, row in precautions_df[precautions_df[precaution] == 1].iterrows()
                    ]
                    for disease in diseases_to_add:
                        precaution_instance.diseases.add(disease)
                
                # Process diets
                diets_columns = [col for col in diets_df.columns if col != 'Disease']
                diet_objects = [Diet(name=diet) for diet in diets_columns]
                Diet.objects.bulk_create(diet_objects)
                
                # Create diet lookup
                diet_lookup = {diet.name: diet for diet in Diet.objects.all()}
                
                # Create diet-disease relationships
                for diet in diets_columns:
                    diet_instance = diet_lookup[diet]
                    diseases_to_add = [
                        disease_lookup[row['Disease']]
                        for _, row in diets_df[diets_df[diet] == 1].iterrows()
                    ]
                    for disease in diseases_to_add:
                        diet_instance.diseases.add(disease)
                
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"{self.error}: {e}"))
                sys.exit(1)  

        self.stdout.write(self.style.SUCCESS("Diagnosis data imported successfully."))