from datetime import time

# --- FHIR-like Configuration Lists ---
OBSERVATION_STATUSES = [
    "registered",
    "preliminary",
    "final",
    "amended",
    "corrected",
    "cancelled",
    "entered-in-error",
    "unknown",
]
ALLERGY_STATUSES = {
    "clinical": ["active", "inactive", "resolved"],
    "verification": [
        "unconfirmed",
        "presumed",
        "confirmed",
        "refuted",
        "entered-in-error",
    ],
}
ALLERGY_TYPES = ["allergy", "intolerance"]
CONDITION_STATUSES = ["active", "recurrence", "remission", "resolved"]
PRESCRIPTION_STATUSES = ["recorded", "entered-in-error", "draft"]
PRESCRIPTION_ADHERENCE_STATUSES = [
    "taking",
    "taking-as-directed",
    "taking-not-as-directed",
    "not-taking",
    "on-hold",
    "on-hold-as-directed",
    "on-hold-not-as-directed",
    "stopped",
    "stopped-as-directed",
    "stopped-not-as-directed",
    "unknown",
]
ADMINISTRATION_STATUSES = [
    "in-progress",
    "not-done",
    "on-hold",
    "completed",
    "entered-in-error",
    "stopped",
    "unknown",
]
FINANCIAL_TYPES = ["CHARGE", "PAYMENT", "ADJUSTMENT"]
EPISODE_STATUSES = ["active", "finished", "cancelled", "waitlist"]

# --- CarePlan Specific Configuration ---
CARE_PLAN_STATUSES = [
    "draft",
    "active",
    "on-hold",
    "completed",
    "revoked",
    "entered-in-error",
    "ended",
    "unknown",
]

CARE_PLAN_GOALS = [
    {
        "lifecycle_status": "active",
        "category": "care-plan",
        "priority": "medium",
        "description": {
            "text": "Maintain independence in bathing and dressing.",
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "284774007",
                    "display": "Able to perform personal care activity",
                }
            ],
        },
    },
    {
        "lifecycle_status": "active",
        "category": "care-plan",
        "priority": "medium",
        "description": {
            "text": "Reduce risk of fall injuries (using mobility aids).",
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "301570003",
                    "display": "Able to mobilize using mobility aids",
                }
            ],
        },
    },
    {
        "lifecycle_status": "active",
        "category": "care-plan",
        "priority": "medium",
        "description": {
            "text": "Improve social engagement and decrease isolation.",
            "coding": [],
        },
    },
    {
        "lifecycle_status": "active",
        "category": "care-plan",
        "priority": "medium",
        "description": {
            "text": "Maintain current nutritional status/weight.",
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "1156958007",
                    "display": "Promotion of food and nutrient intake to support target weight and body mass",
                }
            ],
        },
    },
    {
        "lifecycle_status": "active",
        "category": "care-plan",
        "priority": "medium",
        "description": {
            "text": "Effective management of chronic pain.",
            "coding": [],
        },
    },
]

CARE_PLAN_ACTIVITIES = [
    {
        "coding": {
            "code": "386420003",
            "display": "Self-care assistance: bathing/hygiene",
            "system": "http://snomed.info/sct",
        },
        "timing": {
            "code": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/v3-GTSAbbreviation",
                        "code": "BID",
                        "display": "twice daily"
                    }
                ]
            },
            "repeat": {
                "frequency": 2,
                "period": 1,
                "period_unit": "d",
                "time_of_day": [time(8, 0), time(21, 0)],  # morning and night
            },
        },
    },
    {
        "coding": {
            "code": "1230050000",
            "display": "Assisting with dressing activity",
            "system": "http://snomed.info/sct",
        },
        "timing": {
            "code": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/v3-GTSAbbreviation",
                        "code": "QD",
                        "display": "once daily"
                    }
                ]
            },
            "repeat": {
                "frequency": 1,
                "period": 1,
                "period_unit": "d",
                "time_of_day": [time(8, 30)],  # after morning hygiene
            },
        },
    },
    {
        "coding": {
            "code": None,
            "display": "Daily 15-minute ambulation/walk",
            "system": "http://snomed.info/sct",
        },
        "timing": {
            "code": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/v3-GTSAbbreviation",
                        "code": "BID",
                        "display": "twice daily"
                    }
                ]
            },
            "repeat": {
                "frequency": 2,
                "period": 1,
                "period_unit": "d",
                "time_of_day": [
                    time(10, 0),
                    time(16, 0),
                ],  # morning and afternoon walks
            },
        },
    },
    {
        "coding": {
            "code": "435441000124107",
            "display": "Medication reminder device set-up",
            "system": "http://snomed.info/sct",
        },
        "timing": {
            "code": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/v3-GTSAbbreviation",
                        "code": "ONCE",
                        "display": "once"
                    }
                ]
            },
            "repeat": {
                "frequency": 1,
                "period": 1,
                "period_unit": "wk",  # setup weekly (can adjust)
                "time_of_day": [time(9, 0)],
            },
        },
    },
    {
        "coding": {
            "code": None,
            "display": "Attend Thursday social group",
            "system": "http://snomed.info/sct",
        },
        "timing": {
            "code": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/v3-GTSAbbreviation",
                        "code": "WEEKLY",
                        "display": "weekly"
                    }
                ]
            },
            "repeat": {
                "frequency": 1,
                "period": 1,
                "period_unit": "wk",
                "day_of_week": ["thu"],
                "time_of_day": [time(14, 0)],  # Thursday at 2 PM
            },
        },
    },
    {
        "coding": {
            "code": None,
            "display": "Ensure pureed diet and fluid intake",
            "system": "http://snomed.info/sct",
        },
        "timing": {
            "code": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/v3-GTSAbbreviation",
                        "code": "TID",
                        "display": "three times daily"
                    }
                ]
            },  # three times daily
            "repeat": {
                "frequency": 3,
                "period": 1,
                "period_unit": "d",
                "time_of_day": [
                    time(8, 0),
                    time(12, 0),
                    time(18, 0),
                ],  # meal times
            },
        },
    },
    {
        "coding": {
            "code": None,
            "display": "Check skin integrity (daily)",
            "system": "http://snomed.info/sct",
        },
        "timing": {
            "code": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/v3-GTSAbbreviation",
                        "code": "QD",
                        "display": "once daily"
                    }
                ]
            },
            "repeat": {
                "frequency": 1,
                "period": 1,
                "period_unit": "d",
                "time_of_day": [time(9, 0)],
            },
        },
    },
]

VITAL_RANGES = {
    "8480-6": {  # Systolic Blood Pressure
        "coding": [
            {
                "system": "http://loinc.org",
                "code": "8480-6",
                "display": "Systolic Blood Pressure",
            }
        ],
        "unit": {
            "system": "http://unitsofmeasure.org",
            "code": "mm[Hg]",
            "display": "mmHg",
        },
        "min": 100,
        "max": 140,
        "type": "int",
        "body_site": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "40983000",
                    "display": "upper arm",
                }
            ]
        },
        "method": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "371911009",
                    "display": "Measurement of blood pressure using cuff method",
                }
            ]
        },
        "device": {
            "coding": [
                {
                    "system": "http://hl7.org/fhir/NamingSystem/gudid",
                    "code": "00616784710716",
                    "display": "Aneroid manual sphygmomanometer",
                }
            ]
        },
    },
    "8462-4": {  # Diastolic Blood Pressure
        "coding": [
            {
                "system": "http://loinc.org",
                "code": "8462-4",
                "display": "Diastolic Blood Pressure",
            }
        ],
        "unit": {
            "system": "http://unitsofmeasure.org",
            "code": "mm[Hg]",
            "display": "mmHg",
        },
        "min": 60,
        "max": 90,
        "type": "int",
        "body_site": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "40983000",
                    "display": "upper arm",
                }
            ]
        },
        "method": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "371911009",
                    "display": "Measurement of blood pressure using cuff method",
                }
            ]
        },
        "device": {
            "coding": [
                {
                    "system": "http://hl7.org/fhir/NamingSystem/gudid",
                    "code": "00616784710716",
                    "display": "Aneroid manual sphygmomanometer",
                }
            ]
        },
    },
    "8867-4": {  # Heart Rate
        "coding": [
            {"system": "http://loinc.org", "code": "8867-4", "display": "Heart Rate"}
        ],
        "unit": {
            "system": "http://unitsofmeasure.org",
            "code": "/min",
            "display": "beats/minute",
        },
        "min": 60,
        "max": 100,
        "type": "int",
        "body_site": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "182266005",
                    "display": "Structure of tip of index finger",
                }
            ]
        },
        "method": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "252465000",
                    "display": "Pulse oximetry",
                }
            ]
        },
        "device": {
            "coding": [
                {
                    "system": "http://hl7.org/fhir/NamingSystem/gudid",
                    "code": "06924054300456",
                    "display": "Pulse Oximeter",
                }
            ]
        },
    },
    "2708-6": {  # Oxygen Saturation
        "coding": [
            {
                "system": "http://loinc.org",
                "code": "2708-6",
                "display": "Oxygen Saturation in Arterial Blood",
            }
        ],
        "unit": {
            "system": "http://unitsofmeasure.org",
            "code": "%%",
            "display": "percent",
        },
        "min": 94,
        "max": 100,
        "type": "int",
        "body_site": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "182266005",
                    "display": "Structure of tip of index finger",
                }
            ]
        },
        "method": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "252465000",
                    "display": "Pulse oximetry",
                }
            ]
        },
        "device": {
            "coding": [
                {
                    "system": "http://hl7.org/fhir/NamingSystem/gudid",
                    "code": "06924054300456",
                    "display": "Pulse Oximeter",
                }
            ]
        },
    },
    "8310-5": {  # Temperature
        "coding": [
            {
                "system": "http://loinc.org",
                "code": "8310-5",
                "display": "Body Temperature",
            }
        ],
        "unit": {"system": "http://unitsofmeasure.org", "code": "Cel", "display": "°C"},
        "min": 36.4,
        "max": 37.5,
        "type": "float",
        "body_site": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "25342003",
                    "display": "Middle ear structure",
                }
            ]
        },
        "method": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "448093005",
                    "display": "Measurement of temperature using tympanic thermometer",
                }
            ]
        },
        "device": {
            "coding": [
                {
                    "system": "http://hl7.org/fhir/NamingSystem/gudid",
                    "code": "06947468554666",
                    "display": "Thermometer",
                }
            ]
        },
    },
    "29463-7": {  # Body Weight
        "coding": [
            {"system": "http://loinc.org", "code": "29463-7", "display": "Body Weight"}
        ],
        "unit": {
            "system": "http://unitsofmeasure.org",
            "code": "kg",
            "display": "kilogram",
        },
        "min": 54.4,
        "max": 113.4,
        "type": "float",
        "body_site": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "38266002",
                    "display": "Entire body as a whole",
                }
            ]
        },
        "method": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "39857003",
                    "display": "Weighing patient",
                }
            ]
        },
        "device": {
            "coding": [
                {
                    "system": "http://hl7.org/fhir/NamingSystem/gudid",
                    "code": "00809161310108",
                    "display": "DIG MEDICAL SCALE W/HEIGHT ROD",
                }
            ]
        },
    },
}
