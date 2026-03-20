from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import os

router = APIRouter()
SETTINGS_FILE = "data/settings.json"

class SettingsUpdate(BaseModel):
    business_name: str = "Apex Retail"
    email: str = "admin@apexretail.com"
    notifications_low_stock: bool = True
    notifications_daily_reports: bool = True

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.get("/settings")
async def get_settings():
    if not os.path.exists(SETTINGS_FILE):
        return {
            "business_name": "Apex Retail",
            "email": "admin@apexretail.com",
            "notifications_low_stock": True,
            "notifications_daily_reports": True
        }
    with open(SETTINGS_FILE, "r") as f:
        return json.load(f)

@router.post("/settings")
async def update_settings(settings: SettingsUpdate):
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings.dict(), f)
    return {"status": "success", "message": "Settings updated"}

@router.post("/settings/change-password")
async def change_password(passwords: PasswordChange):
    # Dummy implementation for now
    if passwords.current_password == "admin123": # Mock current password
        return {"status": "success", "message": "Password changed successfully"}
    else:
        raise HTTPException(status_code=400, detail="Incorrect current password")
