from django.core.management.base import BaseCommand
from django.test import Client
from django.urls import reverse
from adminpanel.models import Biochemical
import json

class Command(BaseCommand):
    help = 'Creating user biometrics'

    def handle(self, *args, **options):
        user_biometrics = [
            {"Blood Glucose": [102.4, 98.7, 94.3, 102.4]},
            {"Hemoglobin A1c": [5.8, 5.7, 5.5, 5.4]},
            {"Glycated Albumin": [13.8, 14.2, 13.9, 13.5]},
            {"Total Cholesterol": [213.6, 208.4, 204.7, 198.3]},
            {"LDL Cholesterol": [158.3, 152.6, 147.8, 142.4]},
            {"HDL Cholesterol": [47.3, 48.9, 51.2, 53.7]},
            {"Triglycerides": [198.4, 187.6, 176.3, 168.9]},
            {"Apolipoprotein A1": [112.4, 118.7, 125.3, 132.8]},
            {"Apolipoprotein B": [134.8, 128.3, 122.7, 118.4]},
            {"Vitamin D": [18.4, 21.7, 24.3, 18.4]},
            {"Vitamin C": [3.7, 4.8, 6.2, 8.4]},
            {"Vitamin K": [1.8, 1.9, 2.1, 2.2]},
            {"Vitamin B6 (Pyridoxine)": [27.4, 31.8, 35.2, 38.6]},
            {"Vitamin B1 (Thiamine)": [123.7, 125.4, 128.9, 131.2]},
            {"Vitamin B2 (Riboflavin)": [18.4, 21.3, 24.7, 27.8]},
            {"Vitamin B3 (Niacin)": [22.8, 26.4, 29.7, 32.4]},
            {"Vitamin B5 (Pantothenic Acid)": [423.6, 445.8, 467.2, 482.4]},
            {"Vitamin B7 (Biotin)": [487.3, 492.8, 498.4, 503.7]},
            {"Vitamin B9 (Folate)": [7.8, 8.4, 9.2, 10.1]},
            {"Vitamin B12 (Cobalamin)": [456.8, 478.3, 492.7, 508.4]},
            {"Vitamin A": [42.7, 44.3, 45.8, 46.9]},
            {"Creatinine": [0.92, 0.88, 0.85, 0.83]},
            {"Uric Acid": [6.3, 5.8, 5.4, 6.3]},
            {"Blood Urea Nitrogen": [15.8, 14.9, 14.3, 13.8]},
            {"Cystatin C": [0.88, 0.84, 0.81, 0.78]},
            {"Sodium": [141.3, 140.6, 139.8, 139.2]},
            {"Potassium": [4.4, 4.3, 4.2, 4.1]},
            {"Calcium": [9.2, 9.3, 9.4, 9.4]},
            {"Magnesium": [1.65, 1.72, 1.78, 1.83]},
            {"Phosphate": [3.2, 3.4, 3.5, 3.6]},
            {"Chloride": [103.4, 102.8, 102.3, 101.9]},
            {"Bicarbonate": [24.8, 25.2, 25.7, 26.1]},
            {"Iron": [48.3, 53.7, 58.4, 47.8]},
            {"Globulin": [2.7, 2.8, 2.9, 3.0]},
            {"Albumin": [3.4, 3.6, 3.8, 4.0]},
            {"Total Protein": [6.1, 6.4, 6.7, 7.0]},
            {"Albumin/Globulin Ratio": [1.26, 1.29, 1.31, 1.33]},
            {"C-Reactive Protein": [3.8, 3.2, 2.7, 4.0]},
            {"Haptoglobin": [187.4, 173.8, 162.5, 154.3]},
            {"Transferrin": [234.7, 248.3, 259.6, 268.4]},
            {"C-Peptide": [3.7, 3.4, 3.1, 2.8]},
            {"Testosterone": [42.8, 40.3, 38.7, 37.4]},
            {"Estrogen": [67.4, 72.8, 78.3, 82.6]},
            {"Progesterone": [0.8, 1.2, 1.5, 1.8]},
            {"Cortisol": [24.8, 22.3, 19.7, 17.4]},
            {"Aldosterone": [9.8, 9.2, 8.7, 8.3]},
            {"Thyroid-Stimulating Hormone (TSH)": [4.3, 3.8, 3.4, 4.4]},
            {"Free Thyroxine (Free T4)": [0.68, 0.72, 0.78, 0.84]},
            {"Free Triiodothyronine (Free T3)": [2.1, 2.3, 2.5, 2.7]},
            {"Aspartate Aminotransferase": [38.4, 35.7, 32.8, 30.2]},
            {"Alanine Aminotransferase": [41.3, 37.8, 34.6, 31.9]},
            {"Alkaline Phosphatase": [112.7, 106.4, 99.8, 94.3]},
            {"Gamma-Glutamyl Transferase": [42.8, 38.4, 34.7, 43.0]},
            {"Bilirubin": [1.3, 1.1, 0.9, 0.8]},
            {"Lactate Dehydrogenase": [267.4, 254.8, 242.3, 231.7]},
            {"Prothrombin Time": [13.8, 13.4, 13.1, 12.8]},
            {"Partial Thromboplastin Time": [34.7, 33.8, 32.9, 32.1]},
            {"Fibrinogen": [387.4, 372.8, 358.3, 344.6]}
        ]

        client = Client()

        token_response = client.post(reverse('webapp:login'), {'email': 'm@g.com', 'password': 'x'})

        if token_response.status_code == 200:
            self.stdout.write(self.style.SUCCESS("Login successful."))
            token_response_json = json.loads(token_response.content)
            token = token_response_json.get('token')

            for count in range(4):
                input_list = []
                for item in user_biometrics:
                    for biochemical_name, values in item.items():
                        if count < len(values):
                            first_value = values[count]
                            try:
                                biochemical_id = Biochemical.objects.get(name=biochemical_name).id
                            except Biochemical.DoesNotExist:
                                self.stdout.write(self.style.ERROR(f"Biochemical '{biochemical_name}' does not exist."))
                                continue

                            input_list.append(
                                {
                                    'biochemical_id': str(biochemical_id),
                                    'value': first_value
                                }
                            )

                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': f'Token {token}',
                }
                json_input_list = json.dumps(input_list)

                self.stdout.write(self.style.SUCCESS(f"{count} Set of biometrics creating..."))

                response = client.post(reverse('webapp:create-biometrics'), data=json_input_list, content_type='application/json', headers=headers)

                if response.status_code in [200, 201]:
                    self.stdout.write(self.style.SUCCESS(f"{count} Set of biometrics creation successful."))
                else:
                    self.stdout.write(self.style.ERROR(f"Biometrics creation failed in set {count}: {response.content.decode()}"))

        else:
            self.stdout.write(self.style.ERROR(f"Login failed: {token_response.content.decode()}"))
