import asyncio
import os
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database Connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.heara_db

async def seed_db():
    print("🌱 Seeding database...")

    # --- 1. Seed Products ---
    # Note: Ensure your API is updated to fetch products from DB if you want to see these.
    products = [
        {
            "id": "mark-3-white",
            "name": "He-Ara Mark 3",
            "model": "mark3",
            "positions": 3,
            "color": "white",
            "price": 299.00,
            "features": ["Smart Control", "Triple Circuit", "Temperature Adjustment", "App Integration"],
            "imageUrl": "https://images.unsplash.com/photo-1513694203232-719a280e022f",
            "inStock": True
        },
        {
            "id": "mark-3-black",
            "name": "He-Ara Mark 3 Black Edition",
            "model": "mark3",
            "positions": 3,
            "color": "black",
            "price": 349.00,
            "features": ["Smart Control", "Triple Circuit", "Temperature Adjustment", "App Integration", "Matte Finish"],
            "imageUrl": "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d",
            "inStock": True
        }
    ]

    # Clear existing products
    await db.products.delete_many({})
    # Insert new products
    if products:
        await db.products.insert_many(products)
    print(f"✅ Inserted {len(products)} products")

    # --- 2. Seed Leads ---
    leads = [
        {
            "name": "Yossi Cohen",
            "phone": "050-1234567",
            "email": "yossi@example.com",
            "message": "Interested in bulk order for a hotel project.",
            "source": "website",
            "productInterest": "mark-3-white",
            "status": "new",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "name": "Dana Levi",
            "phone": "052-9876543",
            "email": "dana@example.com",
            "message": "Do you ship to Eilat?",
            "source": "facebook",
            "productInterest": "mark-3-black",
            "status": "contacted",
            "createdAt": datetime.utcnow() - timedelta(days=2),
            "updatedAt": datetime.utcnow() - timedelta(days=1)
        },
        {
            "name": "Ronit Avraham",
            "phone": "054-5555555",
            "email": "ronit@example.com",
            "message": "",
            "source": "referral",
            "productInterest": None,
            "status": "converted",
            "createdAt": datetime.utcnow() - timedelta(days=5),
            "updatedAt": datetime.utcnow() - timedelta(days=5)
        },
        {
            "name": "David Biton",
            "phone": "055-4444444",
            "email": "david@example.com",
            "message": "Price is too high for my budget.",
            "source": "website",
            "productInterest": "mark-3-white",
            "status": "closed",
            "createdAt": datetime.utcnow() - timedelta(days=10),
            "updatedAt": datetime.utcnow() - timedelta(days=10)
        }
    ]

    # Clear existing leads
    await db.leads.delete_many({})
    # Insert new leads
    if leads:
        await db.leads.insert_many(leads)
    print(f"✅ Inserted {len(leads)} leads")

    print("🚀 Seeding complete!")

if __name__ == "__main__":
    # Run the async function
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(seed_db())
    finally:
        loop.close()