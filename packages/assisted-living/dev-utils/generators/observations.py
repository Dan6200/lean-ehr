import random
from datetime import datetime
from .utils import generate_uuid, get_random_datetime
from .config import OBSERVATION_STATUSES, VITAL_RANGES


def make_observation(
    code: str,
    resident_id: str,
    staff_ids: list,
    start_date: datetime,
    end_date: datetime,
) -> dict:
    """Generate a FHIR Observation resource for a given vital sign code."""
    vital = VITAL_RANGES.get(code)
    if not vital:
        raise ValueError(f"Unknown vital code: {code}")

    # Randomize value
    if vital["type"] == "int":
        value = random.randint(vital["min"], vital["max"])
    else:
        value = round(random.uniform(vital["min"], vital["max"]), 1)

    # Generate a FHIR Observation resource
    observation = {
        "id": generate_uuid(),
        "data": {
            "resident_id": resident_id,
            "recorder_id": random.choice(staff_ids),
            "status": random.choice(OBSERVATION_STATUSES),
            "category": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "vital-signs",
                            "display": "Vital Signs",
                        }
                    ]
                }
            ],
            "code": {"coding": vital["coding"], "text": vital["coding"][0]["display"]},
            "effective_datetime": get_random_datetime(start_date, end_date),
            "value_quantity": {
                "value": value,
                "unit": vital["unit"]["display"],
                "system": vital["unit"]["system"],
                "code": vital["unit"]["code"],
            },
            "body_site": vital["body_site"],
            "method": vital["method"],
            "device": vital["device"],
        },
    }

    return observation


def generate_observations_for_resident(
    resident_id: str,
    staff_ids: list,
    start_date: datetime,
    end_date: datetime,
    loinc_codes: list,
) -> list:
    num_observations = random.randint(3, 8)
    observations = []
    for _ in range(num_observations):
        if loinc_codes:
            observations.append(
                make_observation(
                    random.choice(loinc_codes),
                    resident_id=resident_id,
                    staff_ids=staff_ids,
                    start_date=start_date,
                    end_date=end_date,
                )
            )
    return observations
