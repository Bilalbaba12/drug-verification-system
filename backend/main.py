from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import jwt
import models, schemas
from database import engine, get_db

# --- Rate Limiting Imports ---
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NAFDAC Verification API")

# --- Initialize the Limiter ---
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "super-secret-nafdac-key-for-final-year-project" 
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

@app.post("/api/login")
@limiter.limit("5/minute") # Allows 5 failed login attempts per minute
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username == "admin" and form_data.password == "nafdac2026":
        token = jwt.encode({"sub": form_data.username, "role": "admin"}, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": token, "token_type": "bearer", "role": "admin"}
    elif form_data.username == "pharmacist" and form_data.password == "pharm2026":
        token = jwt.encode({"sub": form_data.username, "role": "pharmacist"}, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": token, "token_type": "bearer", "role": "pharmacist"}
    
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

@app.get("/")
def read_root():
    return {"message": "Welcome to the NAFDAC API"}

# --- PROTECTED WITH RATE LIMITER ---
@app.get("/api/verify/{drug_number}", response_model=schemas.DrugResponse)
@limiter.limit("5/minute") 
def verify_drug(request: Request, drug_number: str, db: Session = Depends(get_db)):
    drug = db.query(models.Drug).filter(models.Drug.drug_number == drug_number).first()
    # Guard: Drug must exist AND be approved by an Admin
    if not drug or not drug.is_approved:
        raise HTTPException(status_code=404, detail="Drug not found or invalid NAFDAC number.")
    return drug

@app.get("/api/drugs")
def get_all_drugs(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    return db.query(models.Drug).all()

@app.post("/api/drugs", response_model=schemas.DrugResponse)
def register_drug(drug: schemas.DrugCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    role = payload.get("role")

    db_drug = db.query(models.Drug).filter(models.Drug.drug_number == drug.drug_number).first()
    if db_drug:
        raise HTTPException(status_code=400, detail="Drug already registered.")
    
    # If pharmacist, it pends. If admin, it approves instantly.
    is_approved = True if role == "admin" else False

    new_drug = models.Drug(**drug.dict(), is_approved=is_approved)
    db.add(new_drug)
    db.commit()
    db.refresh(new_drug)
    return new_drug

@app.put("/api/drugs/{drug_id}/approve")
def approve_drug(drug_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only Admins can approve drugs.")
    
    drug = db.query(models.Drug).filter(models.Drug.id == drug_id).first()
    drug.is_approved = True
    db.commit()
    return {"message": "Drug Approved"}

@app.post("/api/report")
def create_report(report: schemas.ReportCreate, db: Session = Depends(get_db)):
    db_report = models.Report(**report.dict())
    db.add(db_report)
    db.commit()
    return {"message": "Report submitted successfully."}

@app.get("/api/reports")
def get_reports(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(models.Report).all()

@app.delete("/api/reports/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if report:
        db.delete(report)
        db.commit()
    return {"message": "Report deleted"}