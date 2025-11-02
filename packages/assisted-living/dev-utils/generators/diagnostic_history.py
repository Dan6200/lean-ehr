import random
from .utils import generate_uuid, get_random_datetime
from .config import CONDITION_STATUSES

def generate_diagnostic_history_for_resident(resident_id: str, staff_ids: list, start_date: datetime, end_date: datetime, snomed_disorders: list) -> list:
    num_disorders = random.randint(1, 3)
    diagnostic_history = []
    for _ in range(num_disorders):
        if snomed_disorders:
            disorder_example = random.choice(snomed_disorders)
            clinical_status = random.choice(CONDITION_STATUSES)
            abatement_date = (
                get_random_datetime(start_date, end_date)
                if clinical_status == "resolved"
                else None
            )
            diagnostic_history.append(
                {
                    "id": generate_uuid(),
                    "data": {
                        "resident_id": resident_id,
                        "recorder_id": random.choice(staff_ids),
                        "clinical_status": clinical_status,
                        "recorded_date": get_random_datetime(
                            datetime(2020, 1, 1), end_date
                        ),
                        "onset_datetime": get_random_datetime(
                            datetime(2000, 1, 1), datetime(2023, 1, 1)
                        ),
                        "abatement_datetime": abatement_date,
                        "code": {
                            "coding": disorder_example,
                            "text": disorder_example[0]["display"],
                        },
                    },
                }
            )
    return diagnostic_history
