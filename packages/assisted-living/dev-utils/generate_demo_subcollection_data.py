import json
import uuid
import random
from datetime import datetime, timedelta
import os
import pytz # Import pytz for timezone awareness (standard for FHIR)

# --- Configuration ---
RESIDENTS_FILE = 'demo-data/residents/data-plain.json'

SUBCOLLECTIONS_DIR = 'demo-data'
SUBCOLLECTION_FILES = {
    # Removed 'emergency_contacts'
    'allergies': 'allergies/data-plain.json',
    'medications': 'medications/data-plain.json',
    'observations': 'observations/data-plain.json',
    'diagnostic_history': 'diagnostic_history/data-plain.json',
    'financials': 'financials/data-plain.json',
    'medication_administration': 'medication_administration/data-plain.json', # New eMAR subcollection
}

SNOMED_ALLERGIES_FILE = 'demo-data/snomed-examples/allergies.txt'
SNOMED_DISORDERS_FILE = 'demo-data/snomed-examples/disorders.txt'
LOINC_EXAMPLES_FILE = 'demo-data/loinc-examples.txt'

# --- FHIR-like Configuration Lists ---
OBSERVATION_STATUSES = ['final', 'amended']
ALLERGY_STATUSES = ['active', 'inactive', 'resolved']
CONDITION_STATUSES = ['active', 'recurrence', 'remission', 'resolved']
MEDICATION_STATUSES = ['active', 'on-hold', 'stopped']
ADMINISTRATION_STATUSES = ['administered', 'missed', 'refused'] # Status for eMAR events
ADMINISTRATION_ROUTES = ['Oral', 'IV', 'Subcutaneous', 'Topical', 'Inhalation']
FINANCIAL_TYPES = ['CHARGE', 'PAYMENT', 'ADJUSTMENT']

# Define realistic ranges for common vitals (FHIR-aligned with UCUM units)
# Units set to SI standards (Cel and kg)
VITAL_RANGES = {
    '8480-6': {'name': 'Systolic Blood Pressure', 'unit': 'mmHg', 'min': 100, 'max': 140, 'type': 'int'},
    '8462-4': {'name': 'Diastolic Blood Pressure', 'unit': 'mmHg', 'min': 60, 'max': 90, 'type': 'int'},
    '8867-4': {'name': 'Heart Rate', 'unit': '/min', 'min': 60, 'max': 100, 'type': 'int'},
    '2708-6': {'name': 'Oxygen Saturation', 'unit': '%', 'min': 94, 'max': 100, 'type': 'int'},
    # Celsius (SI Unit)
    '8310-5': {'name': 'Body Temperature', 'unit': 'Cel', 'min': 36.4, 'max': 37.5, 'type': 'float'},
    # Kilograms (SI Unit)
    '29463-7': {'name': 'Body Weight', 'unit': 'kg', 'min': 54.4, 'max': 113.4, 'type': 'float'},
}

# --- Helper Functions ---
def generate_uuid():
    return str(uuid.uuid4())

def get_random_datetime(start_date, end_date):
    """Returns a random datetime string in ISO 8601 format with Z timezone."""
    time_between_dates = end_date - start_date
    seconds_between_dates = int(time_between_dates.total_seconds())
    random_number_of_seconds = random.randrange(seconds_between_dates)
    random_datetime = start_date + timedelta(seconds=random_number_of_seconds)
    # Ensure it's timezone-aware (using UTC/Z)
    return pytz.utc.localize(random_datetime).isoformat().replace('+00:00', 'Z')

def get_observation_value(code):
    """Generates a realistic, numerical value based on LOINC code and unit."""
    config = VITAL_RANGES.get(code)
    if not config:
        # Fallback for codes not in the VITAL_RANGES map
        return random.randint(10, 100), '10^3/uL'

    val = random.uniform(config['min'], config['max'])
    if config['type'] == 'int':
        return int(round(val)), config['unit']
    
    # Handle specific formatting for decimal values (e.g., Temperature, Weight)
    return round(val, 1), config['unit']


def load_snomed_examples(filepath):
    examples = []
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            for line in f:
                parts = line.strip().split('|')
                if len(parts) >= 2:
                    # Clean up SNOMED descriptions
                    name = parts[1].strip().replace('(finding)', '').replace('(disorder)', '').replace('(substance)', '').strip()
                    examples.append({'code': parts[0].strip(), 'name': name})
    return examples

def load_loinc_examples(filepath):
    # Use the defined VITAL_RANGES keys for guaranteed realistic vitals
    return [{'code': k, 'name': v['name']} for k, v in VITAL_RANGES.items()]

# --- Main Script ---
if __name__ == '__main__':
    # Define a start date range for all records
    START_DATE = datetime(2023, 1, 1)
    END_DATE = datetime.now()
    # Generate 6 unique UUIDs for staff IDs (no prefix)
    NUM_STAFF = 6
    STAFF_IDS = [generate_uuid() for _ in range(NUM_STAFF)]

    # Backup original residents file
    os.makedirs(os.path.dirname(RESIDENTS_FILE), exist_ok=True)
    try:
        os.system(f'cp {RESIDENTS_FILE} {RESIDENTS_FILE}.bak')
    except Exception as e:
        print(f"Warning: Could not backup file {RESIDENTS_FILE}. {e}")
    
    try:
        with open(RESIDENTS_FILE, 'r') as f:
            residents_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Residents file not found at {RESIDENTS_FILE}.")
        exit(1)


    all_allergies = []
    all_medications = []
    all_observations = []
    all_diagnostic_history = []
    all_financials = []
    all_medication_administration = [] # New list for eMAR entries

    snomed_allergies = load_snomed_examples(SNOMED_ALLERGIES_FILE)
    snomed_disorders = load_snomed_examples(SNOMED_DISORDERS_FILE)
    loinc_vitals = load_loinc_examples(LOINC_EXAMPLES_FILE) 

    # Sample RxNorm medications (simplified for demo)
    rxnorm_medications = [
        {'code': '314076', 'name': 'Lisinopril', 'strength': '10mg'},
        {'code': '860975', 'name': 'Metformin', 'strength': '500mg'},
        {'code': '1048953', 'name': 'Atorvastatin', 'strength': '20mg'},
        {'code': '197358', 'name': 'Amoxicillin', 'strength': '250mg'},
        {'code': '1113000', 'name': 'Insulin Glargine', 'strength': '10 units'},
    ]

    for resident in residents_data:
        resident_id = resident['id']
        resident_data = resident['data']

        # NOTE: Emergency contacts logic removed as per user request.

        resident_medications = [] # Temp list to hold meds created for the current resident for eMAR generation

        # Generate Allergies (FHIR: AllergyIntolerance Resource)
        num_allergies = random.randint(0, 2)
        for _ in range(num_allergies):
            if snomed_allergies:
                allergy_example = random.choice(snomed_allergies)
                all_allergies.append({
                    'id': generate_uuid(),
                    'data': {
                        'resident_id': resident_id,
                        'recorder_id': random.choice(STAFF_IDS),
                        'clinical_status': random.choice(ALLERGY_STATUSES),
                        'recorded_date': get_random_datetime(START_DATE, END_DATE),
                        'substance_name': allergy_example['name'],
                        'snomed_code': allergy_example['code'],
                        'reaction_description': random.choice(['Urticaria (Hives)', 'Angioedema (Swelling)', 'Anaphylaxis', 'Gastrointestinal upset']),
                        'severity': random.choice(['mild', 'moderate', 'severe'])
                    }
                })
        
        # Generate Medications (FHIR: MedicationStatement Resource)
        num_medications = random.randint(0, 3)
        for _ in range(num_medications):
            if rxnorm_medications:
                med_example = random.choice(rxnorm_medications)
                med_record = {
                    'id': generate_uuid(),
                    'data': {
                        'resident_id': resident_id,
                        'recorder_id': random.choice(STAFF_IDS),
                        'effective_period_start': get_random_datetime(START_DATE, END_DATE),
                        'status': random.choice(MEDICATION_STATUSES),
                        'name': med_example['name'],
                        'rxnorm_code': med_example['code'],
                        'dosage': med_example['strength'],
                        'frequency': random.choice(['Daily', 'Twice a day', 'Three times a day', 'As needed'])
                    }
                }
                all_medications.append(med_record)
                resident_medications.append(med_record) # Store locally for eMAR generation

        # Generate Medication Administration Records (eMAR)
        # This simulates recording actual administrations based on prescribed medications
        for med_record in resident_medications:
            med_id = med_record['id']
            frequency = med_record['data']['frequency']
            start_date_str = med_record['data']['effective_period_start']
            
            # Simple logic to determine number of doses to generate
            doses_per_day = 0
            if frequency == 'Daily':
                doses_per_day = 1
            elif frequency == 'Twice a day':
                doses_per_day = 2
            elif frequency == 'Three times a day':
                doses_per_day = 3
            # Skip 'As needed' or handle as a low, random chance event
            if doses_per_day == 0:
                continue 

            start_dt = datetime.fromisoformat(start_date_str.replace('Z', '+00:00')).replace(tzinfo=None)
            
            # Generate administrations up to END_DATE (today)
            current_date = start_dt.date()
            while current_date <= END_DATE.date():
                for dose_num in range(doses_per_day):
                    # Create a standard time for administration based on dose number
                    hour = (9 + (dose_num * (24 // doses_per_day))) % 24
                    
                    # Add some randomness to the administration time (e.g., +/- 30 mins)
                    minute_offset = random.randint(-30, 30)
                    admin_time = datetime(current_date.year, current_date.month, current_date.day, 
                                          hour, 30, 0) + timedelta(minutes=minute_offset)
                    
                    # Only generate if the time is not in the future
                    if admin_time > END_DATE:
                        continue
                        
                    # Determine Status/Outcome
                    status = random.choices(
                        ADMINISTRATION_STATUSES, 
                        weights=[0.9, 0.05, 0.05], # 90% administered, 5% missed, 5% refused
                        k=1
                    )[0]

                    all_medication_administration.append({
                        'id': generate_uuid(),
                        'data': {
                            'resident_id': resident_id,
                            'medication_statement_id': med_id, # Link to the prescribed medication
                            'medication_name': med_record['data']['name'],
                            'recorder_id': random.choice(STAFF_IDS),
                            'status': status,
                            'administration_route': random.choice(ADMINISTRATION_ROUTES),
                            'administered_dosage': med_record['data']['dosage'],
                            'administration_datetime': pytz.utc.localize(admin_time).isoformat().replace('+00:00', 'Z')
                        }
                    })

                current_date += timedelta(days=1)


        # Generate Observations (FHIR: Observation Resource)
        # Note: We generate Systolic and Diastolic BP separately as FHIR often links them via components, 
        # but storing them individually simplifies our Lean EHR model.
        num_observations = random.randint(3, 8) 
        
        for _ in range(num_observations):
            if loinc_vitals:
                vital_example = random.choice(loinc_vitals)
                loinc_code = vital_example['code']
                value, unit = get_observation_value(loinc_code)

                observation = {
                    'id': generate_uuid(),
                    'data': {
                        'resident_id': resident_id,
                        'recorder_id': random.choice(STAFF_IDS),
                        'status': random.choice(OBSERVATION_STATUSES),
                        'effective_datetime': get_random_datetime(START_DATE, END_DATE),
                        'loinc_code': loinc_code,
                        'name': vital_example['name'],
                        'value': value, # Now numerical
                        'unit': unit, # Now UCUM-aligned
                    }
                }
                
                # Add body site for Temp/O2 Sat
                if loinc_code in ['8310-5', '2708-6']:
                    observation['data']['body_site'] = random.choice(['Oral', 'Axillary', 'Finger'])

                all_observations.append(observation)

        # Generate Diagnostic History (FHIR: Condition Resource)
        num_disorders = random.randint(1, 3)
        for _ in range(num_disorders):
            if snomed_disorders:
                disorder_example = random.choice(snomed_disorders)
                # Determine status first
                clinical_status = random.choice(CONDITION_STATUSES)
                
                abatement_date = None
                # If the status is resolved, set an abatement (resolution) date
                if clinical_status == 'resolved':
                    # Set the abatement date to be between the recorded date start and now
                    abatement_date = get_random_datetime(datetime(2023, 1, 1), END_DATE)

                all_diagnostic_history.append({
                    'id': generate_uuid(),
                    'data': {
                        'resident_id': resident_id,
                        'recorder_id': random.choice(STAFF_IDS),
                        'clinical_status': clinical_status,
                        'recorded_date': get_random_datetime(datetime(2020, 1, 1), END_DATE),
                        'onset_date': get_random_datetime(datetime(2000, 1, 1), datetime(2023, 1, 1)), # Onset likely before residence
                        'abatement_date': abatement_date, # FHIR-ALIGNED RESOLUTION FIELD
                        'title': disorder_example['name'],
                        'notes': f'Patient history of {disorder_example['name']}. Reviewed and confirmed.',
                        'snomed_code': disorder_example['code']
                    }
                })

        # Generate Financials (Updated to use numerical amount)
        num_financials = random.randint(0, 5)
        for _ in range(num_financials):
            all_financials.append({
                'id': generate_uuid(),
                'data': {
                    'resident_id': resident_id,
                    'amount': round(random.uniform(50, 5000), 2), # Now numerical
                    'effective_datetime': get_random_datetime(START_DATE, END_DATE),
                    'type': random.choice(FINANCIAL_TYPES),
                    'description': random.choice(['Monthly Rent', 'Medication Fee', 'Therapy Session', 'Payment Received', 'Co-pay', 'Late Fee'])
                }
            })

    # Write updated residents data (without embedded arrays)
    with open(RESIDENTS_FILE, 'w') as f:
        json.dump(residents_data, f, indent=2)

    # Write subcollection data
    for sub_dir, sub_file in SUBCOLLECTION_FILES.items():
        os.makedirs(os.path.join(SUBCOLLECTIONS_DIR, sub_dir), exist_ok=True)
        data_to_dump = []
        # if sub_dir == 'emergency_contacts': # Removed
        #     data_to_dump = all_emergency_contacts # Removed
        if sub_dir == 'allergies':
            data_to_dump = all_allergies
        elif sub_dir == 'medications':
            data_to_dump = all_medications
        elif sub_dir == 'observations':
            data_to_dump = all_observations
        elif sub_dir == 'diagnostic_history':
            data_to_dump = all_diagnostic_history
        elif sub_dir == 'financials':
            data_to_dump = all_financials
        elif sub_dir == 'medication_administration': # NEW
            data_to_dump = all_medication_administration
            
        with open(os.path.join(SUBCOLLECTIONS_DIR, sub_file), 'w') as f:
            json.dump(data_to_dump, f, indent=2)

    print("FHIR-Aligned Demo data generation complete.")
