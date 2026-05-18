"""
EduVerse ML Service — Database connection & data loading utilities.
Connects to the same MongoDB as the Node.js backend.
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

_client = None
_db = None


def get_db():
    """Lazy-initialize and return the MongoDB database handle."""
    global _client, _db
    if _db is not None:
        return _db

    uri = os.getenv("MONGODB_URI")
    if not uri:
        raise RuntimeError("MONGODB_URI is not set")

    _client = MongoClient(uri)
    # Extract DB name from URI, default to "test"
    db_name = uri.rsplit("/", 1)[-1].split("?")[0] or "test"
    _db = _client[db_name]
    return _db


def load_courses():
    """Load all published, non-deleted courses with their category names."""
    db = get_db()
    pipeline = [
        {"$match": {"status": "live", "isDeleted": False, "isPrivate": False}},
        {
            "$lookup": {
                "from": "categories",
                "localField": "category",
                "foreignField": "_id",
                "as": "categoryDoc",
            }
        },
        {
            "$project": {
                "_id": 1,
                "title": 1,
                "subtitle": 1,
                "description": 1,
                "tags": 1,
                "level": 1,
                "language": 1,
                "studentsEnrolled": 1,
                "rating": 1,
                "categoryName": {"$arrayElemAt": ["$categoryDoc.name", 0]},
            }
        },
    ]
    return list(db.courses.aggregate(pipeline))


def load_interactions():
    """
    Load all user-course interactions: enrollments, wishlist, reviews.
    Returns list of dicts: { userId, courseId, action, rating? }
    """
    db = get_db()

    interactions = []

    # Enrollments (exclude refunded/inactive)
    for e in db.enrollments.find(
        {"status": {"$nin": ["refunded", "inactive"]}},
        {"student": 1, "course": 1, "status": 1},
    ):
        interactions.append(
            {
                "userId": str(e["student"]),
                "courseId": str(e["course"]),
                "action": e.get("status", "active"),
            }
        )

    # Wishlist
    for w in db.wishlists.find({}, {"user": 1, "course": 1}):
        interactions.append(
            {
                "userId": str(w["user"]),
                "courseId": str(w["course"]),
                "action": "wishlist",
            }
        )

    # Reviews (non-deleted)
    for r in db.reviews.find({"isDeleted": False}, {"user": 1, "course": 1, "rating": 1}):
        interactions.append(
            {
                "userId": str(r["user"]),
                "courseId": str(r["course"]),
                "action": "review",
                "rating": r.get("rating", 0),
            }
        )

    return interactions


def load_user_signals(user_id: str):
    """
    Load all signals for a specific user.
    Returns: { enrollments, wishlist, reviews, interests }
    """
    db = get_db()
    from bson import ObjectId

    uid = ObjectId(user_id)

    enrollments = list(
        db.enrollments.find(
            {"student": uid, "status": {"$nin": ["refunded", "inactive"]}},
            {"course": 1, "status": 1},
        )
    )

    wishlist = list(db.wishlists.find({"user": uid}, {"course": 1}))

    reviews = list(
        db.reviews.find(
            {"user": uid, "isDeleted": False}, {"course": 1, "rating": 1}
        )
    )

    # interests are in the "students" collection (Student model)
    student = db.students.find_one({"user": uid}, {"interests": 1})
    interests = student.get("interests", []) if student else []

    return {
        "enrollments": enrollments,
        "wishlist": wishlist,
        "reviews": reviews,
        "interests": [i for i in interests if i],
    }
