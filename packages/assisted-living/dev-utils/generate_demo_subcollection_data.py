import json
import os
from datetime import datetime

from generators.utils import (
    convert_times,
    load_snomed_file,
    load_allergy_reactions,
    get_loinc_codes,
    generate_uuid,
)
from generators.config import (
    VITAL_RANGES,
    PRESCRIPTION_TEMPLATES,
    DOSAGE_INSTRUCTIONS,
)
from generators.allergies import generate_allergies_for_resident
from generators.prescriptions import generate_prescriptions_for_resident
from generators.prescription_administration import (
    generate_prescription_administration_for_resident,
)
from generators.observations import generate_observations_for_resident
from generators.diagnostic_history import generate_diagnostic_history_for_resident
from generators.financials import generate_financials_for_resident
from generators.episodes_of_care import generate_episodes_of_care_for_resident
from generators.care_plans import generate_care_plans_for_resident

# --- Configuration ---
RESIDENTS_FILE = "demo-data/residents/data-plain.json"
SUBCOLLECTIONS_DIR = "demo-data"
SUBCOLLECTION_FILES = {
    "allergies": "allergies/data-plain.json",
    "prescriptions": "prescriptions/data-plain.json",
    "observations": "observations/data-plain.json",
    "diagnostic_history": "diagnostic_history/data-plain.json",
    "financials": "financials/data-plain.json",
    "prescription_administration": "prescription_administration/data-plain.json",
    "episodes_of_care": "episodes_of_care/data-plain.json",
    "care_plans": "care_plans/data-plain.json",
}

SNOMED_DISORDERS_FILE = "demo-data/snomed-examples/disorders.txt"
SNOMED_ALLERGY_NAMES_FILE = "demo-data/snomed-examples/allergies/name.txt"
SNOMED_ALLERGY_REACTIONS_FILE = "demo-data/snomed-examples/allergies/reaction.txt"
SNOMED_ALLERGY_SUBSTANCES_FILE = "demo-data/snomed-examples/allergies/substance.txt"


# --- Main Script ---
if __name__ == "__main__":
    START_DATE = datetime(2023, 1, 1)
    INTERMEDIARY_DATE = datetime(2024, 1, 1)
    END_DATE = datetime.now()
    NUM_STAFF = 6
    STAFF_IDS = [generate_uuid() for _ in range(NUM_STAFF)]

    os.makedirs(os.path.dirname(RESIDENTS_FILE), exist_ok=True)

    try:
        with open(RESIDENTS_FILE, "r") as f:
            residents_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Residents file not found at {RESIDENTS_FILE}.")
        exit(1)

    all_allergies = []
    all_prescriptions = []
    all_observations = []
    all_diagnostic_history = []
    all_financials = []
    all_prescription_administration = []
    all_episodes_of_care = []
    all_care_plans = []

    snomed_allergy_names = load_snomed_file(SNOMED_ALLERGY_NAMES_FILE)
    snomed_allergy_reactions = load_allergy_reactions(SNOMED_ALLERGY_REACTIONS_FILE)
    snomed_allergy_substances = load_snomed_file(SNOMED_ALLERGY_SUBSTANCES_FILE)
    snomed_disorders = load_snomed_file(SNOMED_DISORDERS_FILE)
    loinc_codes = get_loinc_codes(VITAL_RANGES)

    for resident in residents_data:
        resident_id = resident["id"]

        # Generate data for each subcollection
        all_allergies.extend(
            generate_allergies_for_resident(
                resident_id,
                STAFF_IDS,
                START_DATE,
                END_DATE,
                snomed_allergy_names,
                snomed_allergy_reactions,
                snomed_allergy_substances,
            )
        )
        resident_prescriptions = generate_prescriptions_for_resident(
            resident_id,
            STAFF_IDS,
            START_DATE,
            INTERMEDIARY_DATE,
            END_DATE,
            PRESCRIPTION_TEMPLATES,
            DOSAGE_INSTRUCTIONS,
        )
        all_prescriptions.extend(resident_prescriptions)
        if resident_prescriptions:
            all_prescription_administration.extend(
                generate_prescription_administration_for_resident(
                    resident_id, resident_prescriptions, STAFF_IDS, END_DATE
                )
            )
        all_observations.extend(
            generate_observations_for_resident(
                resident_id, STAFF_IDS, START_DATE, END_DATE, loinc_codes
            )
        )
        all_diagnostic_history.extend(
            generate_diagnostic_history_for_resident(
                resident_id, STAFF_IDS, START_DATE, END_DATE, snomed_disorders
            )
        )
        all_financials.extend(
            generate_financials_for_resident(resident_id, START_DATE, END_DATE)
        )
        all_episodes_of_care.extend(generate_episodes_of_care_for_resident(resident_id))
        all_care_plans.extend(
            generate_care_plans_for_resident(resident_id, STAFF_IDS, END_DATE)
        )

    # --- Write Sub-Collection Files (Corrected Pathing) ---
    for sub_dir, sub_file in SUBCOLLECTION_FILES.items():
        # Ensure the directory exists (e.g., 'demo-data/allergies')
        os.makedirs(
            os.path.join(SUBCOLLECTIONS_DIR, os.path.dirname(sub_file)), exist_ok=True
        )
        data_map = {
            "allergies": all_allergies,
            "prescriptions": all_prescriptions,
            "observations": all_observations,
            "diagnostic_history": all_diagnostic_history,
            "financials": all_financials,
            "prescription_administration": all_prescription_administration,
            "episodes_of_care": all_episodes_of_care,
            "care_plans": all_care_plans,
        }
        if sub_dir in data_map:
            # Write to the full path (e.g., 'demo-data/allergies/data-plain.json')
            with open(os.path.join(SUBCOLLECTIONS_DIR, sub_file), "w") as f:
                data = convert_times(data_map[sub_dir])
                json.dump(data, f, indent=2)

    print("FHIR-Aligned Demo data generation complete.")