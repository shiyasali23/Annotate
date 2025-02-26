from django.core.management.base import BaseCommand
from django.test import Client
from django.urls import reverse
import json
import sys

class Command(BaseCommand):
    help = 'Creating user biometrics'

    def handle(self, *args, **options):
        user_biometrics=[
            {1: [102.4, 98.7, 94.3, 102.4]}, 
            {2: [5.8, 5.7, 5.5, 5.4]}, 
            {3: [13.8, 14.2, 13.9, 13.5]}, 
            {4: [213.6, 208.4, 204.7, 198.3]}, 
            {5: [158.3, 152.6, 147.8, 142.4]}, 
            {6: [47.3, 48.9, 51.2, 53.7]}, 
            {7: [198.4, 187.6, 176.3, 168.9]}, 
            {8: [112.4, 118.7, 125.3, 132.8]}, 
            {9: [134.8, 128.3, 122.7, 118.4]}, 
            {10: [18.4, 21.7, 24.3, 18.4]}, 
            {11: [3.7, 4.8, 6.2, 8.4]}, 
            {12: [1.8, 1.9, 2.1, 2.2]}, 
            {13: [27.4, 31.8, 35.2, 38.6]}, 
            {14: [123.7, 125.4, 128.9, 131.2]}, 
            {15: [18.4, 21.3, 24.7, 27.8]}, 
            {16: [22.8, 26.4, 29.7, 32.4]}, 
            {17: [423.6, 445.8, 467.2, 482.4]}, 
            {18: [487.3, 492.8, 498.4, 503.7]}, 
            {19: [7.8, 8.4, 9.2, 10.1]}, 
            {20: [456.8, 478.3, 492.7, 508.4]}, 
            {21: [42.7, 44.3, 45.8, 46.9]}, 
            {22: [0.92, 0.88, 0.85, 0.83]}, 
            {23: [6.3, 5.8, 5.4, 6.3]}, 
            {24: [15.8, 14.9, 14.3, 13.8]}, 
            {25: [0.88, 0.84, 0.81, 0.78]}, 
            {26: [141.3, 140.6, 139.8, 139.2]}, 
            {27: [4.4, 4.3, 4.2, 4.1]}, 
            {28: [9.2, 9.3, 9.4, 9.4]}, 
            {29: [1.65, 1.72, 1.78, 1.83]}, 
            {30: [3.2, 3.4, 3.5, 3.6]}, 
            {31: [103.4, 102.8, 102.3, 101.9]}, 
            {32: [24.8, 25.2, 25.7, 26.1]}, 
            {33: [48.3, 53.7, 58.4, 47.8]}, 
            {34: [2.7, 2.8, 2.9, 3.0]}, 
            {35: [3.4, 3.6, 3.8, 4.0]}, 
            {36: [6.1, 6.4, 6.7, 7.0]}, 
            {37: [1.26, 1.29, 1.31, 1.33]}, 
            {38: [3.8, 3.2, 2.7, 4.0]}, 
            {39: [187.4, 173.8, 162.5, 154.3]}, 
            {40: [234.7, 248.3, 259.6, 268.4]}, 
            {41: [3.7, 3.4, 3.1, 2.8]}, 
            {42: [42.8, 40.3, 38.7, 37.4]}, 
            {43: [67.4, 72.8, 78.3, 82.6]}, 
            {44: [0.8, 1.2, 1.5, 1.8]}, 
            {45: [24.8, 22.3, 19.7, 17.4]}, 
            {46: [9.8, 9.2, 8.7, 8.3]}, 
            {47: [4.3, 3.8, 3.4, 4.4]}, 
            {48: [0.68, 0.72, 0.78, 0.84]}, 
            {49: [2.1, 2.3, 2.5, 2.7]}, 
            {50: [38.4, 35.7, 32.8, 30.2]}, 
            {51: [41.3, 37.8, 34.6, 31.9]}, 
            {52: [112.7, 106.4, 99.8, 94.3]}, 
            {53: [42.8, 38.4, 34.7, 43.0]}, 
            {54: [1.3, 1.1, 0.9, 0.8]}, 
            {55: [267.4, 254.8, 242.3, 231.7]}, 
            {56: [13.8, 13.4, 13.1, 12.8]}, 
            {57: [34.7, 33.8, 32.9, 32.1]}, 
            {58: [387.4, 372.8, 358.3, 344.6]}
        ]

        client = Client()
        try:     
            token_response = client.post(
                reverse('webapp:authenticate'),
                data={'data': {'email': 'jhnoe@example.com', 'password': 'securepassword123'}},
                content_type='application/json'  
            )

            if token_response.status_code == 200:
                self.stdout.write(self.style.SUCCESS("Login successful."))
                token_response_json = json.loads(token_response.content)
                token = token_response_json.get('response', {}).get('token')

                for count in range(4):
                    input_list = []
                    for item in user_biometrics:
                        for biochemical_id, values in item.items():
                            if count < len(values):
                                first_value = values[count]
                                input_list.append(
                                    {
                                        'id': biochemical_id,
                                        'value': first_value
                                    }
                                )

                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': f'Token {token}',
                    }
                    json_input_list = json.dumps({
                        'data': input_list
                    })

                    response = client.post(reverse('webapp:biometrics'), data=json_input_list, content_type='application/json', headers=headers)

                    if response.status_code in [200, 201]:
                        self.stdout.write(self.style.SUCCESS(f"{count} Set of biometrics creation successful."))
                    else:
                        self.stdout.write(self.style.ERROR(f"Biometrics creation failed in set {count}: {response.content.decode()}"))

            else:
                self.stdout.write(self.style.ERROR(f"Login failed: {token_response.content.decode()}"))
                sys.exit(1)
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))
            sys.exit(1)
