# /ai/app/routers/vehicle.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import random
from typing import Dict, Any
from ..auth import get_current_user

# Initialize router
router = APIRouter()

# Response model for vehicle status
class VehicleStatusResponse(BaseModel):
    engine_temp: float  # in Celsius
    tire_pressure: Dict[str, float]  # in PSI for each tire
    battery_level: float  # percentage

# Remove the Depends(get_current_user) to disable authentication
@router.get("/status", response_model=VehicleStatusResponse)
async def get_vehicle_status():
    """
    Get the current status of the vehicle including engine temperature,
    tire pressure, and battery level.
    
    Note: This endpoint currently returns mock values.
    Authentication temporarily disabled.
    """
    # Generate mock values for demonstration purposes
    engine_temp = round(random.uniform(75.0, 105.0), 1)  # Normal range: 80-100°C
    
    # Mock tire pressure for all four tires (FR, FL, RR, RL)
    tire_pressure = {
        "front_right": round(random.uniform(30.0, 36.0), 1),  # Normal range: 32-35 PSI
        "front_left": round(random.uniform(30.0, 36.0), 1),
        "rear_right": round(random.uniform(30.0, 36.0), 1),
        "rear_left": round(random.uniform(30.0, 36.0), 1)
    }
    
    # Mock battery level percentage
    battery_level = round(random.uniform(20.0, 100.0), 1)  # Normal range: 60-100%
    
    return VehicleStatusResponse(
        engine_temp=engine_temp,
        tire_pressure=tire_pressure,
        battery_level=battery_level
    )