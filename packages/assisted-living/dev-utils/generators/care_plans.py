import random
from datetime import datetime
from .utils import generate_uuid, get_random_datetime
from .config import CARE_PLAN_GOALS, CARE_PLAN_ACTIVITIES

def generate_care_plans_for_resident(resident_id: str, staff_ids: list, end_date: datetime) -> list:
    selected_goals = random.sample(CARE_PLAN_GOALS, random.randint(2, 3))
    selected_activities = random.sample(CARE_PLAN_ACTIVITIES, random.randint(3, 5))

    care_plan_activities_list = [
        {
            "id": generate_uuid(),
            "data": {
                "code": {
                    "coding": {
                        "system": "http://snomed.info/sct",
                        "code": act["code"],
                        "display": act["display"],
                    },
                    "text": act["display"],
                },
                "status": "scheduled",
                "timing": act["timing"],
                "staff_instructions": f"Ensure resident comfort during {act['display'].split('(')[0].strip().lower()}.",
            },
        }
        for act in selected_activities
    ]

    care_plan = {
        "id": generate_uuid(),
        "data": {
            "resident_id": resident_id,
            "status": "active",
            "title": f"Personalized Care Plan - {datetime.now().year}",
            "author_id": random.choice(staff_ids),
            "created_date": get_random_datetime(datetime(2024, 1, 1), end_date),
            "goals": selected_goals,
            "activities": care_plan_activities_list,
        },
    }
    return [care_plan]
