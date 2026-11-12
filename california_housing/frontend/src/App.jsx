import React, { useState } from "react";
import "./App.css";

const INITIAL_DATA = {
  longitude: -122.23,
  latitude: 37.88,
  housing_median_age: 41,
  total_rooms: 880,
  total_bedrooms: 129,
  population: 322,
  households: 126,
  median_income: 8.3252,
  ocean_proximity: "<1H OCEAN",
};

const sections = [
  {
    title: "Location Details",
    subtitle: "Where is your property located?",
    icon: "📍",
    fields: [
      {
        name: "longitude",
        label: "Longitude",
        description: "Geographical longitude",
        unit: "°",
        step: "any",
      },
      {
        name: "latitude",
        label: "Latitude",
        description: "Geographical latitude",
        unit: "°",
        step: "any",
      },
    ],
  },
  {
    title: "Property Information",
    subtitle: "Tell us about the property",
    icon: "🏠",
    fields: [
      {
        name: "housing_median_age",
        label: "House Age",
        description: "Median age of houses",
        unit: "years",
      },
      {
        name: "median_income",
        label: "Median Income",
        description: "Median income in the area",
        unit: "× $10,000",
        step: "any",
      },
      {
        name: "total_rooms",
        label: "Total Rooms",
        description: "Total rooms in the block",
        unit: "rooms",
      },
      {
        name: "total_bedrooms",
        label: "Total Bedrooms",
        description: "Total bedrooms in the block",
        unit: "bedrooms",
      },
    ],
  },
  {
    title: "Population Details",
    subtitle: "Understand the neighborhood",
    icon: "👥",
    fields: [
      {
        name: "population",
        label: "Population",
        description: "People living in the block",
        unit: "people",
      },
      {
        name: "households",
        label: "Households",
        description: "Number of households",
        unit: "homes",
      },
    ],
  },
];

const currency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export default function App() {
  const [formData, setFormData] = useState({ ...INITIAL_DATA });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const completedFields = Object.keys(formData).filter(
    (key) =>
      formData[key] !== "" &&
      formData[key] !== null &&
      formData[key] !== undefined
  ).length;

  const progress = Math.round(
    (completedFields / Object.keys(formData).length) * 100
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "ocean_proximity"
          ? value
          : value === ""
            ? ""
            : Number(value),
    }));

    setPrediction(null);
    setError("");
  };

  const resetForm = () => {
    setFormData({ ...INITIAL_DATA });
    setPrediction(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(formData).some((value) => value === "")) {
      setError("Please complete all property fields.");
      return;
    }

    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const response = await fetch(
        "http://localhost:8000/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server returned error ${response.status}. Please check your API.`
        );
      }

      const data = await response.json();

      if (
        typeof data.predicted_house_value !== "number" ||
        !Number.isFinite(data.predicted_house_value)
      ) {
        throw new Error("The API returned an invalid prediction.");
      }

      setPrediction(data.predicted_house_value);
    } catch (err) {
      setError(
        err.message || "Unable to connect to the prediction server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      {/* Navigation */}
      <header className="navbar">
        <div className="nav-inner">

          <div className="brand">
            <div className="brand-icon">⌂</div>

            <div>
              <h1>
                Estate<span>AI</span>
              </h1>
              <p>SMART PROPERTY ANALYTICS</p>
            </div>
          </div>

          <div className="api-status">
            <span className="status-dot"></span>
            <span>Prediction System</span>
          </div>

        </div>
      </header>

      <main className="container">

        {/* Hero */}
        <section className="hero">

          <div className="hero-content">
            <div className="eyebrow">
              <span>✦</span>
              MACHINE LEARNING POWERED
            </div>

            <h2>
              Find the value of your
              <span> dream property.</span>
            </h2>

            <p>
              Enter your property details and let our machine
              learning model estimate the median house value
              using California housing data.
            </p>

            <div className="hero-tags">
              <span>✦ Smart prediction</span>
              <span>⌁ Real estate analytics</span>
              <span>◈ AI powered</span>
            </div>
          </div>

          <div className="hero-illustration">
            <div className="illustration-circle">
              <div className="house-illustration">🏡</div>
            </div>
            <div className="floating-card">
              <span>📈</span>
              <div>
                <strong>Property insights</strong>
                <small>Data-driven estimates</small>
              </div>
            </div>
          </div>

        </section>

        {/* Dashboard */}
        <section className="dashboard">

          {/* Form */}
          <div className="form-card">

            <div className="card-heading">
              <div>
                <div className="section-label">PROPERTY CONFIGURATION</div>
                <h3>Property Details</h3>
                <p>Fill in the information below to get started.</p>
              </div>

              <button
                type="button"
                className="reset-btn"
                onClick={resetForm}
                disabled={loading}
              >
                ↻ Reset
              </button>
            </div>

            {/* Progress */}
            <div className="progress-container">
              <div className="progress-info">
                <span>Form completion</span>
                <strong>{progress}%</strong>
              </div>

              <div
                className="progress-track"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              {sections.map((section, index) => (
                <div className="input-section" key={section.title}>

                  <div className="section-heading">
                    <div className="section-icon">
                      {section.icon}
                    </div>

                    <div>
                      <h4>
                        <span className="section-number">
                          0{index + 1}
                        </span>
                        {section.title}
                      </h4>
                      <p>{section.subtitle}</p>
                    </div>
                  </div>

                  <div className="input-grid">
                    {section.fields.map((field) => (
                      <div className="field" key={field.name}>
                        <label htmlFor={field.name}>
                          {field.label}
                        </label>

                        <div className="input-wrapper">
                          <input
                            id={field.name}
                            type="number"
                            name={field.name}
                            step={field.step || "1"}
                            value={formData[field.name]}
                            onChange={handleChange}
                            required
                            disabled={loading}
                          />

                          <span className="input-unit">
                            {field.unit}
                          </span>
                        </div>

                        <small>{field.description}</small>
                      </div>
                    ))}
                  </div>

                </div>
              ))}

              {/* Ocean */}
              <div className="input-section ocean-section">

                <div className="section-heading">
                  <div className="section-icon ocean-icon">
                    🌊
                  </div>

                  <div>
                    <h4>
                      <span className="section-number">04</span>
                      Ocean Proximity
                    </h4>
                    <p>How close is the property to the ocean?</p>
                  </div>
                </div>

                <select
                  name="ocean_proximity"
                  value={formData.ocean_proximity}
                  onChange={handleChange}
                  disabled={loading}
                  className="ocean-select"
                >
                  <option value="<1H OCEAN">
                    Less than 1 hour from ocean
                  </option>
                  <option value="INLAND">Inland</option>
                  <option value="NEAR OCEAN">Near Ocean</option>
                  <option value="NEAR BAY">Near Bay</option>
                  <option value="ISLAND">Island</option>
                </select>

              </div>

              {/* Error */}
              {error && (
                <div className="error-message" role="alert">
                  <span>⚠️</span>
                  <div>
                    <strong>Something went wrong</strong>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="predict-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing property...
                  </>
                ) : (
                  <>
                    ✦ Predict Property Value
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>

              <p className="form-note">
                🔒 Your information is processed by your prediction API.
              </p>

            </form>
          </div>

          {/* Results */}
          <aside className="results-column">

            <div className="result-card">

              <div className="result-top">
                <div className="result-icon">✧</div>
                <span className="result-badge">AI PREDICTION</span>
              </div>

              <p className="result-label">
                ESTIMATED PROPERTY VALUE
              </p>

              <div className="result-value">
                {prediction !== null
                  ? currency(prediction)
                  : "$ — — —"}
              </div>

              <p className="result-description">
                {loading
                  ? "Our model is analyzing your property..."
                  : prediction !== null
                    ? "Your estimated median house value is ready!"
                    : "Your prediction will appear here after submitting the property details."}
              </p>

              {loading && (
                <div className="result-loader">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}

              {prediction !== null && (
                <div className="success-message">
                  <span>✓</span>
                  Prediction generated successfully
                </div>
              )}

              <div className="result-divider"></div>

              <div className="result-footer">
                <span>📍 California, USA</span>
                <span>Regression Model</span>
              </div>

            </div>

            {/* Statistics */}
            <div className="stats-grid">

              <div className="stat-card">
                <div className="stat-icon purple">🤖</div>
                <small>MODEL TYPE</small>
                <strong>Regression</strong>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">📊</div>
                <small>OUTPUT</small>
                <strong>House Value</strong>
              </div>

            </div>

            {/* Guide */}
            <div className="guide-card">
              <div className="guide-title">
                <span>💡</span>
                <h4>How it works</h4>
              </div>

              <p>
                Our machine learning model analyzes property
                characteristics, location, income, and neighborhood
                statistics to estimate the median house value.
              </p>

              <div className="guide-steps">
                <div>
                  <span>01</span>
                  <p>Enter property details</p>
                </div>
                <div>
                  <span>02</span>
                  <p>Run the prediction</p>
                </div>
                <div>
                  <span>03</span>
                  <p>View estimated value</p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="disclaimer">
              <span>ⓘ</span>
              <p>
                This is an estimated machine learning output,
                not an official property valuation.
              </p>
            </div>

          </aside>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-brand">
            Estate<span>AI</span>
          </div>

          <p>
            Built with React, CSS & FastAPI
          </p>

          <p>© 2026 EstateAI</p>
        </footer>

      </main>
    </div>
  );
}