from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base
import datetime

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    drug_name = Column(String)
    manufacturer = Column(String)
    purchase_location = Column(String)
    reporter_phone = Column(String)
    date_reported = Column(DateTime, default=datetime.datetime.utcnow)

class Drug(Base):
    __tablename__ = "drugs"

    id = Column(Integer, primary_key=True, index=True)
    drug_number = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    manufacturer = Column(String)
    expiry_date = Column(String) # <-- NEW FIELD
    date_registered = Column(DateTime, default=datetime.datetime.utcnow)
    is_approved = Column(Boolean, default=True)