"""
D1 GATE CHECK — quantify real interaction data to decide offline-eval feasibility.
Reuses db.py loaders. Read-only.
"""
from collections import Counter, defaultdict
from db import get_db, load_courses, load_interactions


def main():
    db = get_db()

    # Raw collection counts
    print("=" * 60)
    print("RAW COLLECTION COUNTS")
    print("=" * 60)
    for col in ["users", "students", "courses", "enrollments", "wishlists", "reviews"]:
        try:
            print(f"  {col:14s}: {db[col].count_documents({}):>7d}")
        except Exception as e:
            print(f"  {col:14s}: ERR {e}")

    courses = load_courses()
    print(f"\n  live/public courses (eval catalog): {len(courses)}")

    interactions = load_interactions()
    print(f"  total interactions (enroll+wishlist+review): {len(interactions)}")

    by_action = Counter(i["action"] for i in interactions)
    print("\n  interactions by action:")
    for a, c in by_action.most_common():
        print(f"    {a:12s}: {c}")

    # Per-user interaction distribution
    per_user = defaultdict(set)
    for i in interactions:
        per_user[i["userId"]].add(i["courseId"])

    counts = sorted((len(v) for v in per_user.values()), reverse=True)
    n_users = len(counts)

    print("\n" + "=" * 60)
    print("PER-USER DISTINCT-COURSE INTERACTION DISTRIBUTION")
    print("=" * 60)
    print(f"  users with >=1 interaction : {n_users}")

    def bucket(lo, hi=None):
        if hi is None:
            return sum(1 for c in counts if c >= lo)
        return sum(1 for c in counts if lo <= c <= hi)

    print(f"    exactly 1            : {bucket(1,1)}")
    print(f"    2-3 (cold)           : {bucket(2,3)}")
    print(f"    4-9 (warm)           : {bucket(4,9)}")
    print(f"    10+ (power)          : {bucket(10)}")
    print(f"  users >=2 (usable LOO) : {bucket(2)}")
    print(f"  users >=5              : {bucket(5)}")

    if counts:
        print(f"\n  max interactions/user  : {counts[0]}")
        print(f"  median                 : {counts[len(counts)//2]}")
        print(f"  mean                   : {sum(counts)/len(counts):.2f}")

    # Verdict for offline LOO eval
    usable = bucket(2)
    print("\n" + "=" * 60)
    print("VERDICT")
    print("=" * 60)
    print(f"  Leave-one-out needs users with >=2 interactions: {usable}")
    if usable >= 100 and len(courses) >= 30:
        print("  [OK] ENOUGH real data - run offline eval as-is.")
    elif usable >= 30:
        print("  [THIN] eval possible but report sparsity; consider augmenting.")
    else:
        print("  [SPARSE] seed simulated data (seed_data.py) + state in Limitations.")


if __name__ == "__main__":
    main()
