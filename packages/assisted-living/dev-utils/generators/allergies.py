import random
from .utils import generate_uuid, get_random_datetime
from .config import ALLERGY_STATUSES, ALLERGY_TYPES

def generate_allergies_for_resident(resident_id: str, staff_ids: list, start_date: datetime, end_date: datetime, snomed_allergy_names: list, snomed_allergy_reactions: list, snomed_allergy_substances: list) -> list:
    num_allergies = random.randint(0, 2)
    allergies = []
    for i in range(num_allergies):
        if (
            snomed_allergy_names
            and snomed_allergy_reactions
            and snomed_allergy_substances
        ):
            allergy_name = snomed_allergy_names[i % len(snomed_allergy_names)]
            reaction = snomed_allergy_reactions[i % len(snomed_allergy_reactions)]
            substance = snomed_allergy_substances[
                i % len(snomed_allergy_substances)
            ]
            allergies.append(
                {
                    "id": generate_uuid(),
                    "data": {
                        "resident_id": resident_id,
                        "recorder_id": random.choice(staff_ids),
                        "clinical_status": random.choice(
                            ALLERGY_STATUSES["clinical"]
                        ),
                        "verification_status": random.choice(
                            ALLERGY_STATUSES["verification"]
                        ),
                        "name": {
                            "coding": allergy_name,
                            "text": allergy_name[0]["display"],
                        },
                        "type": random.choice(ALLERGY_TYPES),
                        "recorded_date": get_random_datetime(start_date, end_date),
                        "substance": {
                            "coding": substance,
                            "text": substance[0]["display"],
                        },
                        "reaction": {
                            "code": {
                                "coding": [
                                    {
                                        "system": "http://snomed.info/sct",
                                        "code": reaction["code"],
                                        "display": reaction["display"],
                                    }
                                ],
                                "text": reaction["display"],
                            },
                            "severity": reaction["severity"],
                        },
                    },
                }
            )
    return allergies
