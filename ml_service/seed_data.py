"""
EduVerse ML — Persona-based Synthetic Data Seed Script
=======================================================
Creates 30 synthetic users with realistic enrollment patterns.
Each user belongs to a persona (DevOps, Web, Data, Mobile, Mixed).

Usage:
  py seed_data.py              # Insert synthetic data
  py seed_data.py --dry-run    # Preview without inserting
  py seed_data.py --cleanup    # Remove all synthetic data

Synthetic records are tagged with a marker field for easy cleanup:
  users:       { _synthetic: true }
  students:    { _synthetic: true }
  enrollments: { _synthetic: true }
"""

import argparse
import logging
import random
import unicodedata
from datetime import datetime, timedelta

from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

import db

logging.basicConfig(level=logging.INFO, format="[seed] %(message)s",
                    stream=__import__("sys").stdout)
logger = logging.getLogger("seed")

# ═══════════════════════════════════════════════════════════════════════
# COURSE → INSTRUCTOR MAPPING (from actual DB)
# ═══════════════════════════════════════════════════════════════════════

COURSE_INSTRUCTOR = {
    # DevOps / Cloud
    "694d09a9ddf90206a887c637": "694cf0caddf90206a887c33b",  # Docker Beginners
    "694e8e85ed8f2ec45dc0d4ec": "694cf0caddf90206a887c33b",  # Docker Advanced
    "694e9c99ed8f2ec45dc0e432": "694cf0caddf90206a887c33b",  # AWS Essentials
    "694ea1b5ed8f2ec45dc0e74e": "694cf0caddf90206a887c33b",  # Cloud Computing AWS
    "694ea5f0ed8f2ec45dc0e7fa": "694cf0caddf90206a887c33b",  # Kubernetes Fundamentals
    "694eaadfed8f2ec45dc0ee5e": "694cf0caddf90206a887c33b",  # DevOps Kubernetes
    "694eb029a3f9fb4adc5d8ce7": "694cf0caddf90206a887c33b",  # Azure
    "694eb035a3f9fb4adc5d8d31": "694cf235ddf90206a887c3a6",  # Cloud Computing Explained
    "69501b5ed27dbaf7e24adb7e": "694cf235ddf90206a887c3a6",  # Networking & Security
    "6951600db08e6cc6cab5b3a9": "69515866b08e6cc6cab56ed3",  # Cybersecurity Prep
    # Web / Frontend
    "69513704712d2de88391a0d3": "6951324a712d2de883916686",  # NestJS API
    "69513a22712d2de88391a13d": "6951324a712d2de883916686",  # React JS
    "695144b4b08e6cc6cab4ff7f": "6951324a712d2de883916686",  # Full Stack Dev
    "695146f0b08e6cc6cab4fffa": "6951324a712d2de883916686",  # JS & TypeScript
    "695148e1b08e6cc6cab50062": "6951324a712d2de883916686",  # GraphQL Apollo
    "69514b09b08e6cc6cab50106": "6951324a712d2de883916686",  # Next.js
    "69514c6eb08e6cc6cab5017d": "6951324a712d2de883916686",  # Node.js Tutorial
    "69514fc7b08e6cc6cab5023f": "6951324a712d2de883916686",  # NestJS Enterprise
    # Data / ML
    "694d046addf90206a887c535": "694cf235ddf90206a887c3a6",  # CS Crash Course
    "694e9d90ed8f2ec45dc0e653": "694cf235ddf90206a887c3a6",  # Data Science
    "695162f3b08e6cc6cab5b427": "69515866b08e6cc6cab56ed3",  # Power BI
    "695164d5b08e6cc6cab5b496": "69515866b08e6cc6cab56ed3",  # ML KNN
    "695166b4b08e6cc6cab5b4ff": "69515866b08e6cc6cab56ed3",  # Synthetic Data ML
    "69515a96b08e6cc6cab5b2a8": "69515866b08e6cc6cab56ed3",  # Algorithms
    "69515d3fb08e6cc6cab5b322": "69515866b08e6cc6cab56ed3",  # AI Literacy
    # Mobile
    "69515426b08e6cc6cab54654": "6951515eb08e6cc6cab529bc",  # Flutter
    "695155e7b08e6cc6cab546de": "6951515eb08e6cc6cab529bc",  # Mobile App Game
    "695156ffb08e6cc6cab54731": "6951515eb08e6cc6cab529bc",  # Android
    "69515837b08e6cc6cab54783": "6951515eb08e6cc6cab529bc",  # iOS
    # Misc
    "69513e3f712d2de88391a1e4": "6951324a712d2de883916686",  # Java Programming
    "69513fa93f95cbe46155ff69": "694cf235ddf90206a887c3a6",  # Blockchain
}

# ═══════════════════════════════════════════════════════════════════════
# PERSONA DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════

PERSONAS = [
    # ── DevOps / Cloud (8 users) ──
    {
        "name": "Nguyễn Minh Hùng", "interests": ["devops", "docker", "cloud"],
        "primary": ["694d09a9ddf90206a887c637", "694e8e85ed8f2ec45dc0d4ec",
                     "694ea5f0ed8f2ec45dc0e7fa", "694eaadfed8f2ec45dc0ee5e"],
        "secondary": ["694e9c99ed8f2ec45dc0e432", "694eb029a3f9fb4adc5d8ce7",
                       "694eb035a3f9fb4adc5d8d31", "69501b5ed27dbaf7e24adb7e"],
    },
    {
        "name": "Trần Thị Hương", "interests": ["aws", "cloud", "devops"],
        "primary": ["694e9c99ed8f2ec45dc0e432", "694ea1b5ed8f2ec45dc0e74e",
                     "694eb029a3f9fb4adc5d8ce7"],
        "secondary": ["694eb035a3f9fb4adc5d8d31", "694d09a9ddf90206a887c637",
                       "6951600db08e6cc6cab5b3a9"],
    },
    {
        "name": "Phạm Văn Đức", "interests": ["kubernetes", "devops", "terraform"],
        "primary": ["694ea5f0ed8f2ec45dc0e7fa", "694eaadfed8f2ec45dc0ee5e",
                     "694d09a9ddf90206a887c637"],
        "secondary": ["694e8e85ed8f2ec45dc0d4ec", "694eb035a3f9fb4adc5d8d31"],
    },
    {
        "name": "Lê Hoàng Nam", "interests": ["cloud", "azure", "aws"],
        "primary": ["694eb029a3f9fb4adc5d8ce7", "694ea1b5ed8f2ec45dc0e74e",
                     "694eb035a3f9fb4adc5d8d31", "694e9c99ed8f2ec45dc0e432"],
        "secondary": ["69501b5ed27dbaf7e24adb7e"],
    },
    {
        "name": "Hoàng Thị Mai", "interests": ["docker", "kubernetes", "cloud"],
        "primary": ["694d09a9ddf90206a887c637", "694e8e85ed8f2ec45dc0d4ec",
                     "694ea5f0ed8f2ec45dc0e7fa"],
        "secondary": ["694eaadfed8f2ec45dc0ee5e", "694e9c99ed8f2ec45dc0e432",
                       "694eb035a3f9fb4adc5d8d31"],
    },
    {
        "name": "Vũ Đình Khoa", "interests": ["devops", "networking", "security"],
        "primary": ["69501b5ed27dbaf7e24adb7e", "6951600db08e6cc6cab5b3a9",
                     "694d09a9ddf90206a887c637"],
        "secondary": ["694eb035a3f9fb4adc5d8d31"],
    },
    {
        "name": "Ngô Thanh Tùng", "interests": ["cloud", "devops"],
        "primary": ["694eb035a3f9fb4adc5d8d31", "694e9c99ed8f2ec45dc0e432",
                     "694ea1b5ed8f2ec45dc0e74e"],
        "secondary": ["694eb029a3f9fb4adc5d8ce7", "694d09a9ddf90206a887c637"],
    },
    {
        "name": "Đặng Quang Vinh", "interests": ["aws", "docker", "terraform"],
        "primary": ["694e9c99ed8f2ec45dc0e432", "694eaadfed8f2ec45dc0ee5e",
                     "694d09a9ddf90206a887c637", "694e8e85ed8f2ec45dc0d4ec"],
        "secondary": ["694ea5f0ed8f2ec45dc0e7fa"],
    },
    # ── Web / Frontend (8 users) ──
    {
        "name": "Bùi Thị Lan", "interests": ["react", "javascript", "frontend"],
        "primary": ["69513a22712d2de88391a13d", "69514b09b08e6cc6cab50106",
                     "695146f0b08e6cc6cab4fffa"],
        "secondary": ["695148e1b08e6cc6cab50062", "695144b4b08e6cc6cab4ff7f"],
    },
    {
        "name": "Đỗ Minh Tuấn", "interests": ["nodejs", "nestjs", "backend"],
        "primary": ["69513704712d2de88391a0d3", "69514fc7b08e6cc6cab5023f",
                     "69514c6eb08e6cc6cab5017d"],
        "secondary": ["695146f0b08e6cc6cab4fffa", "695144b4b08e6cc6cab4ff7f"],
    },
    {
        "name": "Phan Thị Ngọc", "interests": ["react", "graphql", "fullstack"],
        "primary": ["695148e1b08e6cc6cab50062", "69513a22712d2de88391a13d",
                     "695144b4b08e6cc6cab4ff7f"],
        "secondary": ["69514b09b08e6cc6cab50106"],
    },
    {
        "name": "Lý Văn Hải", "interests": ["javascript", "typescript", "nodejs"],
        "primary": ["695146f0b08e6cc6cab4fffa", "69514c6eb08e6cc6cab5017d",
                     "695144b4b08e6cc6cab4ff7f"],
        "secondary": ["69513704712d2de88391a0d3", "69514fc7b08e6cc6cab5023f"],
    },
    {
        "name": "Mai Thị Thu", "interests": ["react", "nextjs", "hooks"],
        "primary": ["69513a22712d2de88391a13d", "69514b09b08e6cc6cab50106",
                     "695148e1b08e6cc6cab50062"],
        "secondary": ["695146f0b08e6cc6cab4fffa"],
    },
    {
        "name": "Tạ Đình Phong", "interests": ["nestjs", "api", "mongodb"],
        "primary": ["69513704712d2de88391a0d3", "69514fc7b08e6cc6cab5023f"],
        "secondary": ["69514c6eb08e6cc6cab5017d", "695144b4b08e6cc6cab4ff7f"],
    },
    {
        "name": "Châu Minh Đạt", "interests": ["fullstack", "mern", "javascript"],
        "primary": ["695144b4b08e6cc6cab4ff7f", "695146f0b08e6cc6cab4fffa",
                     "69513a22712d2de88391a13d", "69514c6eb08e6cc6cab5017d"],
        "secondary": ["695148e1b08e6cc6cab50062"],
    },
    {
        "name": "Trịnh Thị Hạnh", "interests": ["react", "nodejs", "frontend"],
        "primary": ["69513a22712d2de88391a13d", "69514c6eb08e6cc6cab5017d",
                     "69514b09b08e6cc6cab50106"],
        "secondary": ["695144b4b08e6cc6cab4ff7f"],
    },
    # ── Data / ML (7 users) ──
    {
        "name": "Nguyễn Thị Ánh", "interests": ["data science", "python", "ml"],
        "primary": ["694e9d90ed8f2ec45dc0e653", "695164d5b08e6cc6cab5b496",
                     "695166b4b08e6cc6cab5b4ff"],
        "secondary": ["695162f3b08e6cc6cab5b427", "69515a96b08e6cc6cab5b2a8"],
    },
    {
        "name": "Trần Quốc Bảo", "interests": ["ai", "machinelearning", "data"],
        "primary": ["695164d5b08e6cc6cab5b496", "69515d3fb08e6cc6cab5b322",
                     "695166b4b08e6cc6cab5b4ff"],
        "secondary": ["694e9d90ed8f2ec45dc0e653"],
    },
    {
        "name": "Lê Thị Diễm", "interests": ["data", "powerbi", "analytics"],
        "primary": ["695162f3b08e6cc6cab5b427", "694e9d90ed8f2ec45dc0e653",
                     "694d046addf90206a887c535"],
        "secondary": ["69515a96b08e6cc6cab5b2a8"],
    },
    {
        "name": "Phạm Anh Kiệt", "interests": ["algorithms", "data science", "cs"],
        "primary": ["69515a96b08e6cc6cab5b2a8", "694d046addf90206a887c535",
                     "694e9d90ed8f2ec45dc0e653"],
        "secondary": ["695164d5b08e6cc6cab5b496", "69513e3f712d2de88391a1e4"],
    },
    {
        "name": "Hoàng Minh Quân", "interests": ["ml", "ai", "python"],
        "primary": ["695166b4b08e6cc6cab5b4ff", "695164d5b08e6cc6cab5b496",
                     "69515d3fb08e6cc6cab5b322", "694e9d90ed8f2ec45dc0e653"],
        "secondary": ["69515a96b08e6cc6cab5b2a8"],
    },
    {
        "name": "Vương Thị Ngân", "interests": ["data", "analytics", "excel"],
        "primary": ["695162f3b08e6cc6cab5b427", "694d046addf90206a887c535"],
        "secondary": ["694e9d90ed8f2ec45dc0e653", "69515a96b08e6cc6cab5b2a8"],
    },
    {
        "name": "Cao Đức Thành", "interests": ["ai", "data science"],
        "primary": ["69515d3fb08e6cc6cab5b322", "694e9d90ed8f2ec45dc0e653",
                     "695166b4b08e6cc6cab5b4ff"],
        "secondary": ["695164d5b08e6cc6cab5b496"],
    },
    # ── Mobile (7 users) ──
    {
        "name": "Nguyễn Hoàng Anh", "interests": ["mobile", "android", "java"],
        "primary": ["695156ffb08e6cc6cab54731", "695155e7b08e6cc6cab546de",
                     "69513e3f712d2de88391a1e4"],
        "secondary": ["69515837b08e6cc6cab54783"],
    },
    {
        "name": "Trần Thị Bích", "interests": ["flutter", "mobile", "dart"],
        "primary": ["69515426b08e6cc6cab54654", "695155e7b08e6cc6cab546de",
                     "695156ffb08e6cc6cab54731"],
        "secondary": ["69515837b08e6cc6cab54783"],
    },
    {
        "name": "Lê Văn Cường", "interests": ["ios", "swift", "mobile"],
        "primary": ["69515837b08e6cc6cab54783", "695155e7b08e6cc6cab546de"],
        "secondary": ["695156ffb08e6cc6cab54731", "69515426b08e6cc6cab54654"],
    },
    {
        "name": "Phạm Thị Dung", "interests": ["android", "mobile", "flutter"],
        "primary": ["695156ffb08e6cc6cab54731", "69515426b08e6cc6cab54654",
                     "695155e7b08e6cc6cab546de"],
        "secondary": ["69513e3f712d2de88391a1e4"],
    },
    {
        "name": "Hoàng Văn Giang", "interests": ["mobile", "android"],
        "primary": ["695156ffb08e6cc6cab54731", "695155e7b08e6cc6cab546de"],
        "secondary": ["69515426b08e6cc6cab54654"],
    },
    {
        "name": "Vũ Thị Hiền", "interests": ["flutter", "ios", "mobile"],
        "primary": ["69515426b08e6cc6cab54654", "69515837b08e6cc6cab54783",
                     "695155e7b08e6cc6cab546de"],
        "secondary": ["695156ffb08e6cc6cab54731"],
    },
    {
        "name": "Đỗ Văn Long", "interests": ["mobile", "java", "android"],
        "primary": ["695156ffb08e6cc6cab54731", "69513e3f712d2de88391a1e4",
                     "695155e7b08e6cc6cab546de"],
        "secondary": ["69515426b08e6cc6cab54654", "69515837b08e6cc6cab54783"],
    },
]

# Deterministic seed for reproducibility
random.seed(42)


def _random_email(name: str, idx: int) -> str:
    """Generate a unique email from name (strip all Vietnamese diacritics)."""
    # NFD decompose → strip combining marks → NFC recompose
    nfkd = unicodedata.normalize("NFD", name.lower())
    ascii_name = "".join(c for c in nfkd if not unicodedata.combining(c))
    ascii_name = ascii_name.replace("đ", "d").replace(" ", "")
    return f"synthetic.{ascii_name}{idx}@eduverse.test"


def _random_date(days_ago_max=90, days_ago_min=1):
    """Random datetime within range."""
    delta = random.randint(days_ago_min, days_ago_max)
    return datetime.utcnow() - timedelta(days=delta)


def seed(dry_run=False):
    """Insert synthetic users, students, and enrollments."""
    database = db.get_db()

    users_to_insert = []
    students_to_insert = []
    enrollments_to_insert = []

    for idx, persona in enumerate(PERSONAS):
        user_id = ObjectId()

        # ── User document ──
        users_to_insert.append({
            "_id": user_id,
            "name": persona["name"],
            "email": _random_email(persona["name"], idx),
            "bio": "",
            "website": "",
            "socials": {"facebook": "", "instagram": "", "linkedin": "", "youtube": ""},
            "pfpImg": "",
            "isVerified": True,
            "isActivated": True,
            "role": "student",
            "verifyOtp": "",
            "verifyOtpExpireAt": 0,
            "_synthetic": True,  # marker for cleanup
            "createdAt": _random_date(120, 60),
            "updatedAt": datetime.utcnow(),
        })

        # ── Decide which courses to enroll ──
        # Primary courses: always enroll (core interest)
        enrolled_courses = list(persona["primary"])

        # Secondary courses: enroll 50-80% randomly (adds variance)
        n_secondary = max(1, int(len(persona["secondary"]) * random.uniform(0.5, 0.8)))
        secondary_sample = random.sample(persona["secondary"], n_secondary)
        enrolled_courses.extend(secondary_sample)

        # ── Student document ──
        students_to_insert.append({
            "_id": ObjectId(),
            "user": user_id,
            "interests": persona["interests"],
            "stats": {
                "totalCourses": len(enrolled_courses),
                "completedCourses": random.randint(0, max(1, len(enrolled_courses) // 3)),
                "totalLectures": 0,
                "completedLectures": 0,
            },
            "_synthetic": True,
            "createdAt": _random_date(120, 60),
            "updatedAt": datetime.utcnow(),
        })

        # ── Enrollment documents ──
        for course_id in enrolled_courses:
            instructor_id = COURSE_INSTRUCTOR.get(course_id)
            if not instructor_id:
                continue

            status = random.choices(
                ["active", "completed"],
                weights=[0.7, 0.3],
                k=1
            )[0]

            enrollments_to_insert.append({
                "_id": ObjectId(),
                "student": user_id,
                "course": ObjectId(course_id),
                "instructor": ObjectId(instructor_id),
                "status": status,
                "enrolledAt": _random_date(90, 1),
                "_synthetic": True,
                "createdAt": _random_date(90, 1),
                "updatedAt": datetime.utcnow(),
            })

    # ── Summary ──
    logger.info(f"Personas: {len(PERSONAS)}")
    logger.info(f"Users to create: {len(users_to_insert)}")
    logger.info(f"Students to create: {len(students_to_insert)}")
    logger.info(f"Enrollments to create: {len(enrollments_to_insert)}")
    logger.info(f"Avg enrollments/user: {len(enrollments_to_insert) / len(users_to_insert):.1f}")

    # Group stats
    persona_groups = {
        "DevOps/Cloud": PERSONAS[0:8],
        "Web/Frontend": PERSONAS[8:16],
        "Data/ML": PERSONAS[16:23],
        "Mobile": PERSONAS[23:30],
    }
    for group_name, group in persona_groups.items():
        logger.info(f"  {group_name}: {len(group)} users")

    if dry_run:
        logger.info("\n[DRY RUN] No data inserted.")
        for u in users_to_insert:
            logger.info(f"  User: {u['name']} ({u['email']})")
        return

    # ── Insert ──
    # Auto-cleanup existing synthetic data first (idempotent)
    existing = database.users.count_documents({"_synthetic": True})
    if existing > 0:
        logger.info(f"Found {existing} existing synthetic users, cleaning up first...")
        cleanup()

    logger.info("\nInserting into MongoDB...")

    result_users = database.users.insert_many(users_to_insert)
    logger.info(f"  Users inserted: {len(result_users.inserted_ids)}")

    result_students = database.students.insert_many(students_to_insert)
    logger.info(f"  Students inserted: {len(result_students.inserted_ids)}")

    result_enrollments = database.enrollments.insert_many(enrollments_to_insert)
    logger.info(f"  Enrollments inserted: {len(result_enrollments.inserted_ids)}")

    # ── Update studentsEnrolled count on courses ──
    course_enroll_count = {}
    for e in enrollments_to_insert:
        cid = str(e["course"])
        course_enroll_count[cid] = course_enroll_count.get(cid, 0) + 1

    for cid, count in course_enroll_count.items():
        database.courses.update_one(
            {"_id": ObjectId(cid)},
            {"$inc": {"studentsEnrolled": count}}
        )
    logger.info(f"  Updated studentsEnrolled for {len(course_enroll_count)} courses")

    logger.info("\nDone! Run 'py seed_data.py --cleanup' to remove synthetic data.")


def cleanup():
    """Remove all synthetic data (tagged with _synthetic: True)."""
    database = db.get_db()

    # Reverse studentsEnrolled increments
    synthetic_enrollments = list(database.enrollments.find(
        {"_synthetic": True}, {"course": 1}
    ))
    course_enroll_count = {}
    for e in synthetic_enrollments:
        cid = str(e["course"])
        course_enroll_count[cid] = course_enroll_count.get(cid, 0) + 1

    for cid, count in course_enroll_count.items():
        database.courses.update_one(
            {"_id": ObjectId(cid)},
            {"$inc": {"studentsEnrolled": -count}}
        )

    r1 = database.enrollments.delete_many({"_synthetic": True})
    r2 = database.students.delete_many({"_synthetic": True})
    r3 = database.users.delete_many({"_synthetic": True})

    logger.info(f"Cleaned up:")
    logger.info(f"  Enrollments deleted: {r1.deleted_count}")
    logger.info(f"  Students deleted: {r2.deleted_count}")
    logger.info(f"  Users deleted: {r3.deleted_count}")
    logger.info(f"  Reverted studentsEnrolled for {len(course_enroll_count)} courses")


def main():
    parser = argparse.ArgumentParser(description="Seed synthetic data for ML evaluation")
    parser.add_argument("--dry-run", action="store_true", help="Preview without inserting")
    parser.add_argument("--cleanup", action="store_true", help="Remove all synthetic data")
    args = parser.parse_args()

    if args.cleanup:
        cleanup()
    else:
        seed(dry_run=args.dry_run)


if __name__ == "__main__":
    main()
