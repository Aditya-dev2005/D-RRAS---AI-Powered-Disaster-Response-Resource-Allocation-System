"""
Seed script - populates a fresh database with realistic demo data across
all 6 tables. Safe to re-run: it checks for existing data and skips seeding
if the `users` table is already populated.

Usage:
    python seed.py
"""
from app.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.disaster import Disaster, DisasterType, DisasterStatus
from app.models.emergency_request import EmergencyRequest, RequestStatus
from app.models.resource import Resource, ResourceType
from app.models.volunteer import Volunteer, SkillType
from app.models.road_block import RoadBlock
from app.core.security import hash_password


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(User).first():
            print("Database already contains data. Skipping seed.")
            return

        # --- Users ---
        admin = User(
            username="admin",
            email="admin@drras.com",
            hashed_password=hash_password("Admin@123"),
            role=UserRole.ADMIN,
        )
        normal_user = User(
            username="aditya",
            email="aditya@drras.com",
            hashed_password=hash_password("User@123"),
            role=UserRole.USER,
        )
        db.add_all([admin, normal_user])
        db.commit()

        # --- Road network (graph edges + dynamic block control) ---
        road_segments = [
            ("Delhi", "Mumbai", 1400, 3, False),
            ("Delhi", "Bangalore", 2150, 2, False),
            ("Mumbai", "Bangalore", 980, 4, False),
            ("Mumbai", "Kolkata", 1650, 2, False),
            ("Bangalore", "Chennai", 350, 5, False),
            ("Chennai", "Kolkata", 1660, 2, False),
            ("Delhi", "Noida", 50, 7, False),
            ("Delhi", "Jaipur", 280, 3, False),
            ("Jaipur", "Ahmedabad", 660, 2, False),
            ("Ahmedabad", "Mumbai", 530, 3, False),
            ("Mumbai", "Pune", 150, 6, False),
            ("Pune", "Bangalore", 840, 3, False),
            ("Delhi", "Lucknow", 555, 4, True),   # blocked - demonstrates dynamic rerouting
            ("Lucknow", "Patna", 530, 2, False),
            ("Delhi", "Patna", 1000, 3, False),
            ("Hyderabad", "Bangalore", 570, 3, False),
            ("Hyderabad", "Chennai", 630, 4, False),
            ("Hyderabad", "Mumbai", 710, 3, False),
        ]
        for city_from, city_to, dist, traffic, blocked in road_segments:
            db.add(RoadBlock(
                city_from=city_from, city_to=city_to, distance_km=dist,
                traffic_level=traffic, is_blocked=blocked,
            ))
        db.commit()

        # --- Disasters ---
        flood = Disaster(
            name="Yamuna Floodplain Inundation", type=DisasterType.FLOOD, severity=8,
            city="Noida", status=DisasterStatus.ACTIVE,
            description="Heavy monsoon rainfall has caused the Yamuna to overflow, "
                         "cutting off Sector 62 and surrounding residential blocks.",
        )
        earthquake = Disaster(
            name="Himalayan Foothill Tremor", type=DisasterType.EARTHQUAKE, severity=9,
            city="Lucknow", status=DisasterStatus.ACTIVE,
            description="6.1 magnitude tremor with aftershocks; multiple structures "
                         "reported damaged in the old city area.",
        )
        fire = Disaster(
            name="Industrial Area Fire", type=DisasterType.FIRE, severity=6,
            city="Mumbai", status=DisasterStatus.CONTAINED,
            description="Warehouse fire in an industrial estate; contained by local "
                         "fire services but smoke affected nearby residential zones.",
        )
        cyclone = Disaster(
            name="Coastal Cyclone Landfall", type=DisasterType.HURRICANE, severity=7,
            city="Chennai", status=DisasterStatus.ACTIVE,
            description="Cyclonic storm made landfall overnight; coastal fishing "
                         "settlements report structural damage and flooding.",
        )
        db.add_all([flood, earthquake, fire, cyclone])
        db.commit()

        # --- Resources ---
        resource_rows = [
            (ResourceType.FOOD, "Noida", 800, "meal packets"),
            (ResourceType.WATER, "Noida", 1200, "liters"),
            (ResourceType.MEDICINE, "Noida", 150, "kits"),
            (ResourceType.AMBULANCE, "Noida", 6, "vehicles"),
            (ResourceType.FOOD, "Lucknow", 500, "meal packets"),
            (ResourceType.WATER, "Lucknow", 900, "liters"),
            (ResourceType.MEDICINE, "Lucknow", 300, "kits"),
            (ResourceType.AMBULANCE, "Lucknow", 10, "vehicles"),
            (ResourceType.FOOD, "Chennai", 650, "meal packets"),
            (ResourceType.WATER, "Chennai", 1000, "liters"),
            (ResourceType.MEDICINE, "Chennai", 200, "kits"),
            (ResourceType.AMBULANCE, "Chennai", 8, "vehicles"),
        ]
        for r_type, city, qty, unit in resource_rows:
            db.add(Resource(type=r_type, city=city, quantity_available=qty, unit=unit))
        db.commit()

        # --- Volunteers ---
        volunteer_rows = [
            ("Dr. Ritu Sharma", "9810000001", "ritu.sharma@vol.org", SkillType.DOCTOR, "Noida"),
            ("Dr. Karan Mehta", "9810000002", "karan.mehta@vol.org", SkillType.DOCTOR, "Lucknow"),
            ("Suresh Yadav", "9810000003", "suresh.yadav@vol.org", SkillType.DRIVER, "Noida"),
            ("Imran Khan", "9810000004", "imran.khan@vol.org", SkillType.DRIVER, "Lucknow"),
            ("Priya Nair", "9810000005", "priya.nair@vol.org", SkillType.ENGINEER, "Noida"),
            ("Arvind Iyer", "9810000006", "arvind.iyer@vol.org", SkillType.ENGINEER, "Chennai"),
            ("Manoj Das", "9810000007", "manoj.das@vol.org", SkillType.RESCUE_WORKER, "Noida"),
            ("Lakshmi Pillai", "9810000008", "lakshmi.pillai@vol.org", SkillType.RESCUE_WORKER, "Chennai"),
            ("Dr. Fatima Sheikh", "9810000009", "fatima.sheikh@vol.org", SkillType.DOCTOR, "Chennai"),
            ("Rohit Verma", "9810000010", "rohit.verma@vol.org", SkillType.RESCUE_WORKER, "Lucknow"),
        ]
        for name, phone, email, skill, city in volunteer_rows:
            db.add(Volunteer(name=name, phone=phone, email=email, skill_type=skill, city=city))
        db.commit()

        # --- Emergency Requests ---
        request_rows = [
            (flood.id, "Aman Tiwari", "9911111111", "Noida", "Sector 62, Block C",
             1200, 300, 500, 60, 3),
            (flood.id, "Sunita Devi", "9911111112", "Noida", "Sector 62, Block A",
             400, 100, 150, 20, 1),
            (earthquake.id, "Vikram Singh", "9911111113", "Lucknow", "Old City, Chowk",
             2500, 600, 800, 120, 5),
            (earthquake.id, "Ayesha Khan", "9911111114", "Lucknow", "Hazratganj",
             900, 200, 300, 45, 2),
            (cyclone.id, "Karthik Raja", "9911111115", "Chennai", "Marina Beach Settlement",
             1800, 400, 700, 90, 4),
            (cyclone.id, "Divya Suresh", "9911111116", "Chennai", "Besant Nagar",
             300, 80, 120, 15, 0),
        ]
        for disaster_id, name, phone, city, location, pop, food, water, med, amb in request_rows:
            disaster = db.get(Disaster, disaster_id)
            priority = min(disaster.severity * 7 + min(pop // 20, 30), 100)
            db.add(EmergencyRequest(
                disaster_id=disaster_id, requester_name=name, phone=phone, city=city,
                location=location, population_affected=pop, food_needed=food,
                water_needed=water, medicine_needed=med, ambulances_needed=amb,
                priority_score=priority, status=RequestStatus.PENDING,
            ))
        db.commit()

        print("Seed data inserted successfully.")
        print("Admin login -> username: admin   password: Admin@123")
        print("User  login -> username: aditya  password: User@123")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
