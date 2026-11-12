
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from sqlalchemy import desc

import joblib
import pandas as pd

from database import engine, Base, get_db
from models import Prediction
from schemas import (
    HousingInput,
    PredictionResponse,
    PredictionHistoryResponse
)


app = FastAPI(
    title="California Housing Price Predictor API",
    version="1.0.0"
)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8081"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


# Load ML model
MODEL_PATH = "model/california_housing_perfect_model.pkl"

try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None


# Home endpoint
@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "California Housing Prediction API"
    }


# Health endpoint
@app.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "model": "loaded" if model is not None else "not loaded"
        }
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed"
        )


# Prediction endpoint
@app.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(
    housing_data: HousingInput,
    db: Session = Depends(get_db)
):

    if model is None:
        raise HTTPException(
            status_code=500,
            detail="Machine Learning model not loaded"
        )

    try:

        # Feature engineering
        rooms_per_household = (
            housing_data.total_rooms /
            housing_data.households
        )

        bedrooms_per_room = (
            housing_data.total_bedrooms /
            housing_data.total_rooms
        )

        population_per_household = (
            housing_data.population /
            housing_data.households
        )


        # Create DataFrame
        input_df = pd.DataFrame([{
            "longitude": housing_data.longitude,
            "latitude": housing_data.latitude,
            "housing_median_age": housing_data.housing_median_age,
            "total_rooms": housing_data.total_rooms,
            "total_bedrooms": housing_data.total_bedrooms,
            "population": housing_data.population,
            "households": housing_data.households,
            "median_income": housing_data.median_income,
            "ocean_proximity": housing_data.ocean_proximity,
            "rooms_per_household": rooms_per_household,
            "bedrooms_per_room": bedrooms_per_room,
            "population_per_household": population_per_household
        }])


        # ML prediction
        predicted_value = float(
            model.predict(input_df)[0]
        )

        predicted_value = round(predicted_value, 2)


        # Save prediction in PostgreSQL
        new_prediction = Prediction(

            longitude=housing_data.longitude,
            latitude=housing_data.latitude,

            housing_median_age=housing_data.housing_median_age,

            total_rooms=housing_data.total_rooms,
            total_bedrooms=housing_data.total_bedrooms,

            population=housing_data.population,
            households=housing_data.households,

            median_income=housing_data.median_income,

            ocean_proximity=housing_data.ocean_proximity,

            predicted_house_value=predicted_value
        )


        db.add(new_prediction)

        db.commit()

        db.refresh(new_prediction)


        # Return prediction
        return PredictionResponse(
            id=new_prediction.id,
            predicted_house_value=new_prediction.predicted_house_value,
            created_at=new_prediction.created_at
        )


    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Prediction or database saving failed"
        )


# Get prediction history
@app.get(
    "/predictions",
    response_model=list[PredictionHistoryResponse]
)
def get_predictions(
    db: Session = Depends(get_db),
    limit: int = Query(default=100, ge=1, le=500)
):

    predictions = (
        db.query(Prediction)
        .order_by(desc(Prediction.created_at))
        .limit(limit)
        .all()
    )

    return predictions


# Get a single prediction by ID
@app.get(
    "/predictions/{prediction_id}",
    response_model=PredictionHistoryResponse
)
def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db)
):

    prediction = (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id)
        .first()
    )

    if prediction is None:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found"
        )

    return prediction
