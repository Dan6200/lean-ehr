import random
from datetime import timedelta, datetime
from .utils import generate_uuid, get_random_datetime
from .config import PROCEDURE_STATUSES, SNOMED_PROCEDURES


def generate_procedures_for_resident(
    resident_id: str,
    resident_name: str,
    staff_ids: list,
    start_date: datetime,
    end_date: datetime,
) -> list:
    """Generates a list of procedures for a resident that conforms to the ProcedureSchema."""
    num_procedures = random.randint(0, 3)
    procedures = []

    for _ in range(num_procedures):
        procedure_code = random.choice(SNOMED_PROCEDURES)
        performed_time = get_random_datetime(start_date, end_date)
        performer_id = random.choice(staff_ids)

        procedure = {
            "id": generate_uuid(),
            "data": {
                "subject": {"id": resident_id, "name": resident_name},
                "focus": f"Procedure for {resident_id}",
                "code": {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": procedure_code["code"],
                            "display": procedure_code["display"],
                        }
                    ],
                    "text": procedure_code["display"],
                },
                "status": random.choice(PROCEDURE_STATUSES),
                "occurrence": {
                    "start": performed_time,
                    "end": performed_time + timedelta(minutes=random.randint(15, 60)),
                },
                "performer": {
                    "id": performer_id,
                    "name": f"Staff Member {staff_ids.index(performer_id) + 1}",
                    "period": {
                        "start": performed_time,
                        "end": performed_time + timedelta(minutes=random.randint(10, 60)),
                    },
                },
                "outcome": "successful",
                "recorded_at": performed_time + timedelta(minutes=random.randint(5, 30)),
            },
        }
        procedures.append(procedure)

    return procedures
