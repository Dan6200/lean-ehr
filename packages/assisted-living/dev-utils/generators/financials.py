import random
from .utils import generate_uuid, get_random_datetime
from .config import FINANCIAL_TYPES

def generate_financials_for_resident(resident_id: str, start_date: datetime, end_date: datetime) -> list:
    num_financials = random.randint(0, 5)
    financials = []
    for _ in range(num_financials):
        financials.append(
            {
                "id": generate_uuid(),
                "data": {
                    "resident_id": resident_id,
                    "amount": round(random.uniform(50, 5000), 2),
                    "occurrence_datetime": get_random_datetime(
                        start_date, end_date
                    ),
                    "type": random.choice(FINANCIAL_TYPES),
                    "description": random.choice(
                        [
                            "Monthly Rent",
                            "Prescription Fee",
                            "Therapy Session",
                            "Payment Received",
                            "Co-pay",
                            "Late Fee",
                        ]
                    ),
                },
            }
        )
    return financials
