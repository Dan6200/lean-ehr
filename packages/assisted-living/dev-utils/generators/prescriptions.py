import random
from .utils import generate_uuid, get_random_datetime
from .config import PRESCRIPTION_STATUSES, PRESCRIPTION_ADHERENCE_STATUSES

def generate_prescriptions_for_resident(resident_id: str, staff_ids: list, start_date: datetime, intermediary_date: datetime, end_date: datetime, prescriptions_templates: list, dosage_instructions: dict) -> list:
    num_prescriptions = random.randint(1, 3)
    prescriptions = []
    for _ in range(num_prescriptions):
        if prescriptions_templates:
            rx_template = random.choice(prescriptions_templates)

            dosage_obj = {
                "timing": random.choice(dosage_instructions["timing"]),
                "site": random.choice(dosage_instructions["site"]),
                "route": random.choice(dosage_instructions["route"]),
                "method": random.choice(dosage_instructions["method"]),
                "dose_and_rate": [
                    {
                        "dose_quantity": {
                            "value": rx_template["strength"]["value"],
                            "unit": rx_template["strength"]["unit"],
                        }
                    }
                ],
            }

            rx_record = {
                "id": generate_uuid(),
                "data": {
                    "resident_id": resident_id,
                    "recorder_id": random.choice(staff_ids),
                    "period": {
                        "start": get_random_datetime(start_date, intermediary_date),
                        "end": get_random_datetime(intermediary_date, end_date),
                    },
                    "status": random.choice(PRESCRIPTION_STATUSES),
                    "adherence": random.choice(PRESCRIPTION_ADHERENCE_STATUSES),
                    "medication": rx_template,
                    "dosage_instruction": [dosage_obj],
                },
            }
            prescriptions.append(rx_record)
    return prescriptions
