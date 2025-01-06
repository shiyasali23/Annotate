from django.core.management.base import BaseCommand
from django.db import transaction
from diagnosis.models import Disease, Symptom, Medication, Precaution, Diet  # Fixed Desease typo
from adminpanel.models import Category

import pandas as pd
import os

class Command(BaseCommand):
    help = 'Create diagnosis data from CSV file'

    def handle(self, *args, **kwargs):        
        descriptions_df = pd.read_csv(os.path.join(os.path.dirname(__file__), '../../../../datasets/csv/new_description.csv'))
        diets_df = pd.read_csv(os.path.join(os.path.dirname(__file__), '../../../../datasets/csv/new_diets_df.csv'))
        medications_df = pd.read_csv(os.path.join(os.path.dirname(__file__), '../../../../datasets/csv/new_medications_df.csv'))
        precautions_df = pd.read_csv(os.path.join(os.path.dirname(__file__), '../../../../datasets/csv/new_precautions_df.csv'))
        symptoms_category_df = pd.read_csv(os.path.join(os.path.dirname(__file__), '../../../../datasets/csv/symptoms_category_df.csv')) 
        

        with transaction.atomic():
            try: 
#-----------------------------Disease-------------------------------------------------------------------------------------
                
                for index, row in descriptions_df.iterrows():
                    Disease.objects.create(  
                        name=row['Disease'],
                        description=row['Description']  
                    )

#-----------------------------Symptoms--------------------------------------------------------------------------------------
                
                for index, row in symptoms_category_df.iterrows():
                    category, created = Category.objects.get_or_create(name=row['Category'])
                    Symptom.objects.create(
                        name=row['Symptom'],
                        category=category
                    )
 
#-----------------------------Medication-------------------------------------------------------------------------------------
                    
                medication_columns = [col for col in medications_df.columns if col != 'Disease']

                for medication in medication_columns:
                    medication_instance = Medication(name=medication)
                    medication_instance.save()  

                    diseases_to_add = []
                    for index, row in medications_df[medications_df[medication] == 1].iterrows():
                        disease_name = row['Disease']
                        disease_instance = Disease.objects.get(name=disease_name)
                        diseases_to_add.append(disease_instance)

                    medication_instance.diseases.set(diseases_to_add)
                    

#-----------------------------Precautions-------------------------------------------------------------------------------------

                precaution_columns = [col for col in precautions_df.columns if col != 'Disease']
                
                for precaution in precaution_columns:
                    precaution_instance = Precaution(name=precaution)
                    precaution_instance.save()  

                    diseases_to_add = []
                    for index, row in precautions_df[precautions_df[precaution] == 1].iterrows():
                        disease_name = row['Disease']
                        disease_instance = Disease.objects.get(name=disease_name)
                        diseases_to_add.append(disease_instance)

                    precaution_instance.diseases.set(diseases_to_add)
                            
#-----------------------------Diet-------------------------------------------------------------------------------------
                
                diets_columns = [col for col in diets_df.columns if col != 'Disease']
                for diet in diets_columns:
                    diet_instance = Diet(name=diet)
                    diet_instance.save()
                    
                    diseases_to_add = []
                    for index, row in diets_df[diets_df[diet] == 1].iterrows():
                        disease_name = row['Disease']
                        disease_instance = Disease.objects.get(name=disease_name)
                        diseases_to_add.append(disease_instance)

                    diet_instance.diseases.set(diseases_to_add)             
                    
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error processing row {index}: {e}"))
                raise  

        self.stdout.write(self.style.SUCCESS("Diagnosis data import completed successfully."))
