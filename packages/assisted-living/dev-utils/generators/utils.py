import uuid
import random
from datetime import timedelta, time
import pytz
import os
import re


def convert_times(obj):
    if isinstance(obj, dict):
        return {k: convert_times(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_times(v) for v in obj]
    elif isinstance(obj, time):
        return obj.isoformat()
    else:
        return obj


def generate_uuid():
    return str(uuid.uuid4())


def get_random_datetime(start_date, end_date):
    time_between_dates = end_date - start_date
    seconds_between_dates = int(time_between_dates.total_seconds())
    random_number_of_seconds = random.randrange(seconds_between_dates)
    random_datetime = start_date + timedelta(seconds=random_number_of_seconds)
    return pytz.utc.localize(random_datetime).isoformat().replace("+00:00", "Z")


def load_snomed_file(filepath):
    data = []
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            for line in f:
                parts = line.strip().split("|")
                if len(parts) >= 2:
                    data.append(
                        [
                            {
                                "system": "http://snomed.info/sct",
                                "code": parts[0].strip(),
                                "display": (re.sub(r"\([^)]*\)", "", parts[1])).strip(),
                            }
                        ]
                    )
    return data


def load_allergy_reactions(filepath):
    reactions = []
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            for line in f:
                parts = line.strip().split("|")
                if len(parts) >= 3:
                    reactions.append(
                        {
                            "code": parts[0].strip(),
                            "display": (re.sub(r"\([^)]*\)", "", parts[1])).strip(),
                            "severity": parts[2].strip(),
                        }
                    )
    return reactions


def get_loinc_codes(vital_ranges):
    return [k for k, _ in vital_ranges.items()]
