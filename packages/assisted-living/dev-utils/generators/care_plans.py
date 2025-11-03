import random
from datetime import datetime
from .utils import generate_uuid, get_random_datetime
from .config import CARE_PLAN_GOALS, CARE_PLAN_ACTIVITIES

def generate_care_plans_for_resident(resident_id: str, staff_ids: list, end_date: datetime) -> dict:
    """Generates a denormalized set of care plan data for a resident."""
    care_plans = []
    care_plan_goals = []
    care_plan_activities = []

    # 1. Generate Goals as standalone documents
    selected_goals = random.sample(CARE_PLAN_GOALS, random.randint(2, 3))
    goal_ids = []
    for goal_template in selected_goals:
        goal_id = generate_uuid()
        goal_ids.append(goal_id)
        goal = {
            "id": goal_id,
            "data": goal_template
        }
        care_plan_goals.append(goal)

    # 2. Create the main Care Plan and link to Goal IDs
    care_plan_id = generate_uuid()
    care_plan = {
        "id": care_plan_id,
        "data": {
            "resident_id": resident_id,
            "status": "active",
            "title": f"Personalized Care Plan - {datetime.now().year}",
            "author_id": random.choice(staff_ids),
            "created_date": get_random_datetime(datetime(2024, 1, 1), end_date),
            "goal_ids": goal_ids, # Add the array of goal IDs
        },
    }
    care_plans.append(care_plan)

    # 3. Generate Activities linked to the Care Plan
    selected_activities = random.sample(CARE_PLAN_ACTIVITIES, random.randint(3, 5))
    for act_template in selected_activities:
        activity = {
            "id": generate_uuid(),
            "data": {
                "careplan_id": care_plan_id,
                "code": {
                    "coding": {
                        "system": "http://snomed.info/sct",
                        "code": act_template["coding"]["code"],
                        "display": act_template["coding"]["display"],
                    },
                    "text": act_template["coding"]["display"],
                },
                "status": "scheduled",
                "timing": act_template["timing"],
                "staff_instructions": f"Ensure resident comfort during {act_template['coding']['display'].split('(')[0].strip().lower()}.",
            },
        }
        care_plan_activities.append(activity)

    return {
        "care_plans": care_plans,
        "care_plan_goals": care_plan_goals,
        "care_plan_activities": care_plan_activities,
    }
