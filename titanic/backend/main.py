from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
from typing import Literal

app = FastAPI(title="Titanic Survival Predictor API", version="1.0.0")

# CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
model = joblib.load("model/titanic_model.pkl")


class PassengerInput(BaseModel):
    Pclass: int = Field(..., ge=1, le=3, description="Passenger class (1/2/3)")
    Sex: Literal["male", "female"]
    Age: float = Field(..., ge=0, le=120)
    SibSp: int = Field(..., ge=0, le=10)
    Parch: int = Field(..., ge=0, le=10)
    Fare: float = Field(..., ge=0)
    Embarked: Literal["C", "Q", "S"]


class PredictionResponse(BaseModel):
    survived: bool
    confidence: float
    probability_survived: float
    probability_died: float


@app.get("/")
def root():
    return {"status": "ok", "message": "Titanic Prediction API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/predict", response_model=PredictionResponse)
def predict(passenger: PassengerInput):
    try:
        # Feature engineering (same as training)
        family_size = passenger.SibSp + passenger.Parch + 1
        is_alone = 1 if family_size == 1 else 0

        df = pd.DataFrame([{
            "Pclass": passenger.Pclass,
            "Sex": passenger.Sex,
            "Age": passenger.Age,
            "SibSp": passenger.SibSp,
            "Parch": passenger.Parch,
            "Fare": passenger.Fare,
            "Embarked": passenger.Embarked,
            "FamilySize": family_size,
            "IsAlone": is_alone,
        }])

        pred = int(model.predict(df)[0])
        proba = model.predict_proba(df)[0]

        return PredictionResponse(
            survived=bool(pred == 1),
            confidence=float(max(proba) * 100),
            probability_survived=float(proba[1] * 100),
            probability_died=float(proba[0] * 100),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))