from fastapi import FastAPI, HTTPException, Body, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from enum import Enum
from datetime import datetime
from bson import ObjectId
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="He-Ara API")

# --- Error Handling ---
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom handler to provide clear error messages for validation failures.
    """
    errors = [f"{err['loc'][-1]}: {err['msg']}" for err in exc.errors()]
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation Error", "errors": errors}
    )

# --- CORS Configuration ---
# Allows the frontend to communicate with this backend
origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=".*",  # Allow all origins for development with credentials
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Connection ---
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.heara_db

# --- Models ---

class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    CONVERTED = "converted"
    CLOSED = "closed"

class LeadModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=9)
    email: EmailStr
    message: Optional[str] = None
    source: str = "website"
    productInterest: Optional[str] = None
    status: LeadStatus = LeadStatus.NEW
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "name": "Israel Israeli",
                "phone": "050-1234567",
                "email": "israel@example.com",
                "message": "Interested in Mark 3",
                "source": "website",
                "productInterest": "mark-3",
                "status": "new"
            }
        }

class LeadUpdateModel(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    message: Optional[str] = None
    source: Optional[str] = None
    productInterest: Optional[str] = None
    status: Optional[LeadStatus] = None

class ProductModel(BaseModel):
    id: str
    name: str
    model: str
    positions: int
    color: str
    price: float
    features: List[str]
    imageUrl: str
    inStock: bool

# --- Routes ---

@app.get("/")
async def read_root():
    return {"message": "He-Ara API is running"}

# Leads Endpoints

@app.post("/api/leads", response_model=LeadModel, status_code=201)
async def create_lead(lead: LeadModel = Body(...)):
    new_lead = lead.dict()
    if "id" in new_lead:
        del new_lead["id"]
    
    new_lead["createdAt"] = datetime.utcnow()
    new_lead["updatedAt"] = datetime.utcnow()
    
    result = await db.leads.insert_one(new_lead)
    created_lead = await db.leads.find_one({"_id": result.inserted_id})
    # Map _id to id for response
    created_lead["id"] = str(created_lead["_id"])
    created_lead["_id"] = str(created_lead["_id"])
    return created_lead

@app.get("/api/leads", response_model=List[LeadModel])
async def get_leads(
    status: Optional[LeadStatus] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    query = {}
    if status:
        query["status"] = status.value
    
    if start_date or end_date:
        query["createdAt"] = {}
        if start_date: query["createdAt"]["$gte"] = start_date
        if end_date: query["createdAt"]["$lte"] = end_date
    
    leads = await db.leads.find(query).to_list(1000)
    # Convert ObjectId to string for Pydantic
    for lead in leads:
        lead["id"] = str(lead["_id"])
        lead["_id"] = str(lead["_id"])
    return leads

@app.get("/api/leads/{id}", response_model=LeadModel)
async def get_lead(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    lead = await db.leads.find_one({"_id": ObjectId(id)})
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead["id"] = str(lead["_id"])
    lead["_id"] = str(lead["_id"])
    return lead

@app.patch("/api/leads/{id}", response_model=LeadModel)
async def update_lead(id: str, lead_update: LeadUpdateModel = Body(...)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    update_data = lead_update.dict(exclude_unset=True)
    
    if len(update_data) >= 1:
        update_data["updatedAt"] = datetime.utcnow()
        update_result = await db.leads.update_one(
            {"_id": ObjectId(id)}, 
            {"$set": update_data}
        )
        
        if update_result.modified_count == 0:
             # Check if lead exists if nothing was modified
             if (await db.leads.count_documents({"_id": ObjectId(id)})) == 0:
                raise HTTPException(status_code=404, detail="Lead not found")

    updated_lead = await db.leads.find_one({"_id": ObjectId(id)})
    updated_lead["id"] = str(updated_lead["_id"])
    updated_lead["_id"] = str(updated_lead["_id"])
    return updated_lead

# Products Endpoints

@app.get("/api/products", response_model=List[ProductModel])
async def get_products():
    products = await db.products.find().to_list(100)
    return products

@app.get("/api/products/{id}", response_model=ProductModel)
async def get_product(id: str):
    product = await db.products.find_one({"id": id})
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product