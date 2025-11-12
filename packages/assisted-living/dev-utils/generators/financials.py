import random
from .utils import generate_uuid, get_random_datetime
from datetime import datetime


def generate_financial_data_for_resident(
    resident_id: str, resident_name: str, start_date: datetime, end_date: datetime
) -> dict:
    """Generates a dictionary of related financial data for a single resident."""
    accounts = []
    coverages = []
    all_charges = []
    claims = []
    payments = []
    adjustments = []

    # --- 1. Create the main Account for the resident ---
    account_id = f"acc_{resident_id}"
    accounts.append(
        {
            "id": account_id,
            "data": {
                "subject": {"id": resident_id, "name": resident_name},
                "balance": {"value": 0, "currency": "NGN"},
                "authored_on": get_random_datetime(start_date, end_date),
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
    payor_org = "HMO-A"
    coverages.append(
        {
            "id": coverage_id,
            "data": {
                "status": "active",
                "type": "Private Insurance",
                "beneficiary_id": resident_id,
                "payor": {"id": f"org_{payor_org}", "organization": payor_org},
                "period": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat(),
                },
                "authored_on": get_random_datetime(start_date, end_date),
            },
        }
    )

    # --- 3. Generate All Charges ---
    total_charges_value = 0
    for _ in range(random.randint(5, 15)):
        unit_price_value = round(random.uniform(5000, 150000), 2)
        quantity = random.randint(1, 2)
        total_charges_value += unit_price_value * quantity

        charge = {
            "id": generate_uuid(),
            "data": {
                "resident_id": resident_id,
                "service": random.choice(
                    [
                        "Monthly Rent",
                        "Physical Therapy",
                        "Medication Fee",
                        "Specialist Consultation",
                        "Activities Fee",
                        "Transportation",
                    ]
                ),
                "quantity": quantity,
                "unit_price": {"value": unit_price_value, "currency": "NGN"},
                "occurrence_datetime": get_random_datetime(start_date, end_date),
            },
        }
        all_charges.append(charge)

    # --- 4. Separate Claimed vs. Unclaimed Charges ---
    claimed_charges = random.sample(
        all_charges, k=min(len(all_charges), random.randint(3, 10))
    )
    unclaimed_charges = [c for c in all_charges if c not in claimed_charges]
    total_unclaimed_value = sum(
        c["data"]["unit_price"]["value"] * c["data"]["quantity"]
        for c in unclaimed_charges
    )

    # --- 5. Create a Claim for the claimed charges ---
    claim_total_value = 0
    if claimed_charges:
        claim_total_value = sum(
            c["data"]["unit_price"]["value"] * c["data"]["quantity"]
            for c in claimed_charges
        )
        claim_id = f"claim_{resident_id}"
        claims.append(
            {
                "id": claim_id,
                "data": {
                    "resident_id": resident_id,
                    "authored_on": get_random_datetime(start_date, end_date),
                    "status": "adjudicated",
                    "coverage_id": coverage_id,
                    "charge_ids": [c["id"] for c in claimed_charges],
                    "total": {"value": claim_total_value, "currency": "NGN"},
                },
            }
        )

        # --- 6. Generate Insurer Payment and Adjustment for the Claim ---
        insurer_paid_amount = round(
            claim_total_value * random.uniform(0.7, 0.95), 2
        )
        patient_responsibility_from_claim = claim_total_value - insurer_paid_amount

        payments.append(
            {
                "id": generate_uuid(),
                "data": {
                    "resident_id": resident_id,
                    "claim_id": claim_id,
                    "coverage_id": coverage_id,
                    "amount": {"value": insurer_paid_amount, "currency": "NGN"},
                    "payor": payor_org,
                    "occurrence_datetime": get_random_datetime(start_date, end_date),
                    "method": "EFT",
                },
            }
        )
        adjustments.append(
            {
                "id": generate_uuid(),
                "data": {
                    "resident_id": resident_id,
                    "claim_id": claim_id,
                    "reason": "Contractual Adjustment",
                    "approved_amount": {
                        "value": patient_responsibility_from_claim,
                        "currency": "NGN",
                    },
                    "authored_on": get_random_datetime(start_date, end_date),
                },
            }
        )

    # --- 7. Generate Out-of-Pocket Payment ---
    # Resident pays for unclaimed charges + their responsibility from the claim
    total_oop_payment = total_unclaimed_value + (
        patient_responsibility_from_claim if claimed_charges else 0
    )
    if total_oop_payment > 0:
        payments.append(
            {
                "id": generate_uuid(),
                "data": {
                    "resident_id": resident_id,
                    "claim_id": None,  # No claim for OOP
                    "coverage_id": None,
                    "amount": {"value": total_oop_payment, "currency": "NGN"},
                    "payor": resident_name,  # Payor is the resident
                    "occurrence_datetime": get_random_datetime(start_date, end_date),
                    "method": "Credit Card",
                },
            }
        )

    # --- 8. Update final Account Balance ---
    final_balance = (
        total_charges_value
        - sum(p["data"]["amount"]["value"] for p in payments)
        - sum(a["data"]["approved_amount"]["value"] for a in adjustments)
    )
    if accounts:
        accounts[0]["data"]["balance"]["value"] = round(final_balance, 2)

    return {
        "accounts": accounts,
        "coverages": coverages,
        "charges": all_charges,
        "claims": claims,
        "payments": payments,
        "adjustments": adjustments,
    }