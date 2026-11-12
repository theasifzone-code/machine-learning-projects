from pydantic import BaseModel, Field, ConfigDict
from typing import Literal
from datetime import datetime


class HousingInput(BaseModel):

    longitude: float
    latitude: float

    housing_median_age: float = Field(..., ge=0)

    total_rooms: float = Field(..., ge=1)
    total_bedrooms: float = Field(..., ge=1)

    population: float = Field(..., ge=0)
    households: float = Field(..., ge=1)

    median_income: float

    ocean_proximity: Literal[
        "<1H OCEAN",
        "INLAND",
        "NEAR OCEAN",
        "NEAR BAY",
        "ISLAND"
    ]


class PredictionResponse(BaseModel):

    id: int
    predicted_house_value: float
    created_at: datetime


class PredictionHistoryResponse(BaseModel):

    id: int

    longitude: float
    latitude: float

    housing_median_age: float

    total_rooms: float
    total_bedrooms: float

    population: float
    households: float

    median_income: float

    ocean_proximity: str

    predicted_house_value: float

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)