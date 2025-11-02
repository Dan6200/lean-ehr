import random
from datetime import datetime, timedelta, time
import pytz
from .utils import generate_uuid
from .config import ADMINISTRATION_STATUSES

def generate_prescription_administration_for_resident(resident_id: str, resident_prescriptions: list, staff_ids: list, end_date: datetime) -> list:
    prescription_administration = []
    for rx_record in resident_prescriptions:
        timing = rx_record["data"]["dosage_instruction"][0]["timing"]
        doses_per_day = timing["repeat"]["frequency"]
        if doses_per_day == 0:
            continue

        start_date_str = rx_record["data"]["period"]["start"]
        start_dt = datetime.fromisoformat(
            start_date_str.replace("Z", "+00:00")
        ).replace(tzinfo=None)
        current_date = start_dt.date()
        time_of_day = timing["repeat"].get("time_of_day", [time(9, 0)])
        while current_date <= end_date.date():
            for i, dose_num in enumerate(range(doses_per_day)):
                hour = time_of_day[i].hour
                minute = time_of_day[i].minute
                hour_offset = random.randint(-2, 2)
                minute_offset = random.randint(-30, 30)
                admin_time = datetime(
                    current_date.year,
                    current_date.month,
                    current_date.day,
                    hour,
                    30,
                    0,
                ) + timedelta(hours=hour_offset, minutes=minute_offset)

                if admin_time > end_date:
                    continue

                administered_dosage = rx_record["data"]["dosage_instruction"][0][
                    "dose_and_rate"
                ][0]["dose_quantity"]

                prescription_administration.append(
                    {
                        "id": generate_uuid(),
                        "data": {
                            "resident_id": resident_id,
                            "prescription_id": rx_record["id"],
                            "medication": rx_record["data"]["medication"],
                            "recorder_id": random.choice(staff_ids),
                            "status": random.choice(ADMINISTRATION_STATUSES),
                            "effective_datetime": pytz.utc.localize(admin_time)
                            .isoformat()
                            .replace("+00:00", "Z"),
                            "dosage": {
                                "route": rx_record["data"]["dosage_instruction"][0][
                                    "route"
                                ],
                                "administered_dose": administered_dosage,
                            },
                        },
                    }
                )
            current_date += timedelta(days=1)
    return prescription_administration
