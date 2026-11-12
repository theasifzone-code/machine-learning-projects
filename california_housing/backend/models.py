from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func

from database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    longitude = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)

    housing_median_age = Column(Float, nullable=False)

    total_rooms = Column(Float, nullable=False)
    total_bedrooms = Column(Float, nullable=False)

    population = Column(Float, nullable=False)
    households = Column(Float, nullable=False)

    median_income = Column(Float, nullable=False)

    ocean_proximity = Column(String, nullable=False)

    predicted_house_value = Column(Float, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )