from pydantic import BaseModel

# Add this class to your existing schemas.py file
class DrugResponse(BaseModel):
    id: int
    drug_number: str
    name: str
    manufacturer: str
    expiry_date: str # <-- NEW FIELD
    is_approved: bool

    class Config:
        from_attributes = True

class DrugCreate(BaseModel):
    drug_number: str
    name: str
    manufacturer: str
    expiry_date: str # <-- NEW FIELD

class ReportCreate(BaseModel):
    drug_name: str
    manufacturer: str
    purchase_location: str
    reporter_phone: str