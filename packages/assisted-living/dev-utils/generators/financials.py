import random
from .utils import generate_uuid, get_random_datetime
from datetime import datetime


def generate_financial_data_for_resident(
    resident_id: str, resident_name: str, start_date: datetime, end_date: datetime
) -> dict:
    """Generates a dictionary of related financial data for a single resident."""
    accounts = []
    coverages = []
    charges = []
    claims = []

    # --- 1. Create the main Account for the resident ---
    account_id = f"acc_{resident_id}"
    accounts.append(
        {
            "id": account_id,
            "data": {
                "subject": {"id": resident_id, "name": resident_name},
                "balance": 0,  # Will be calculated later
                "currency": "NGN",
                "created_at": get_random_datetime(start_date, end_date),
                "billing_status": {
                    "coding": [
                        {
                            "system": "http://hl7.org/fhir/account-billing-status",
                            "code": "open",
                            "display": "Open",
                        }
                    ]
                },
            },
        }
    )

    # --- 2. Create Coverage for the resident ---
    coverage_id = f"cov_{resident_id}"
    coverages.append(
        {
            "id": coverage_id,
            "data": {
                "status": "active",
                "type": "Private Insurance",
                "beneficiary_id": resident_id,
                "payor": {"id": "org_HMO-A", "organization": "HMO-A"},
                "period": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat(),
                },
                "created_at": get_random_datetime(start_date, end_date),
            },
        }
    )

    # --- 3. Generate Charges ---
    total_charges = 0
    for _ in range(random.randint(2, 10)):
        unit_price = round(random.uniform(5000, 2000000), 2)
        quantity = random.randint(1, 3)
        charge_total = unit_price * quantity
        total_charges += charge_total

        charge = {
            "id": generate_uuid(),
            "data": {
                "service": random.choice(
                    [
                        "Monthly Rent",
                        "Physical Therapy",
                        "Medication Fee",
                        "Specialist Consultation",
                    ]
                ),
                "quantity": quantity,
                "unit_price": unit_price,
                "currency": "NGN",
                "occurrence_datetime": get_random_datetime(start_date, end_date),
            },
        }
        charges.append(charge)

    # --- 4. Create a Claim for some of the charges ---
    if charges:
        claim_charges = random.sample(
            charges, k=min(len(charges), random.randint(1, 5))
        )
        claim_total = sum(
            c["data"]["unit_price"] * c["data"]["quantity"] for c in claim_charges
        )

        claim_id = f"claim_{resident_id}"
        claims.append(
            {
                "id": claim_id,
                "data": {
                    "created": get_random_datetime(start_date, end_date),
                    "status": "submitted",
                    "coverage_id": coverage_id,
                    "charges": [c["id"] for c in claim_charges],
                    "total": claim_total,
                    "currency": "NGN",
                },
            }
        )

    # Update account balance
    if accounts:
        accounts[0]["data"]["balance"] = total_charges

    return {
        "accounts": accounts,
        "coverages": coverages,
        "charges": charges,
        "claims": claims,
    }

