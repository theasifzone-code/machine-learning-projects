"use client";

import { useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type PassengerForm = {
  Pclass: number;
  Sex: string;
  Age: number;
  SibSp: number;
  Parch: number;
  Fare: number;
  Embarked: string;
};

type PredictionResult = {
  survived: boolean;
  confidence: number;
  probability_survived: number;
  probability_died: number;
};

const initialForm: PassengerForm = {
  Pclass: 3,
  Sex: "male",
  Age: 30,
  SibSp: 0,
  Parch: 0,
  Fare: 15,
  Embarked: "S",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700";

export default function Home() {
  const [form, setForm] = useState<PassengerForm>(initialForm);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateForm = <K extends keyof PassengerForm>(
    key: K,
    value: PassengerForm[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setResult(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const { data } = await axios.post<PredictionResult>(
        `${API_URL}/predict`,
        form
      );
      setResult(data);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err)
          ? err.response?.data?.detail || err.message
          : "Something went wrong. Please try again.";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setResult(null);
    setError("");
  };

  const ports = [
    { value: "S", name: "Southampton", description: "England" },
    { value: "C", name: "Cherbourg", description: "France" },
    { value: "Q", name: "Queenstown", description: "Ireland" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f7fb] text-slate-900">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute -bottom-48 -left-40 h-[32rem] w-[32rem] rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(#0f172a_1px,transparent_1px),linear-gradient(90deg,#0f172a_1px,transparent_1px)] [background-size:36px_36px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Top navigation */}
        <header className="mb-8 flex items-center justify-between sm:mb-12">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-xl text-white shadow-lg shadow-slate-900/15">
              ⚓
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900">
                ALIF<span className="text-sky-600">.AI</span>
              </p>
              <p className="text-xs text-slate-500">Passenger analytics</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Prediction system
          </div>
        </header>

        {/* Page introduction */}
        <section className="mb-8 max-w-3xl sm:mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sky-700">
            Historical machine learning
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Titanic survival
            <span className="block text-sky-600">predictor.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            Explore how passenger details influence a model&apos;s survival
            prediction. Enter the passenger information below to generate an
            instant estimate.
          </p>
        </section>

        {/* Main content */}
        <div className="grid flex-1 items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.75fr)] lg:gap-8">
          {/* Form card */}
          <section className="rounded-3xl border border-white bg-white p-5 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.25)] sm:p-8">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
        
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Passenger details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Fill in the information to get a prediction.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                Reset
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Passenger class */}
              <fieldset>
                <legend className={labelClass}>Passenger class</legend>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[1, 2, 3].map((cls) => {
                    const active = form.Pclass === cls;
                    return (
                      <button
                        key={cls}
                        type="button"
                        aria-pressed={active}
                        onClick={() => updateForm("Pclass", cls)}
                        className={`rounded-xl border px-2 py-3 text-center transition focus:outline-none focus:ring-4 focus:ring-sky-500/10 sm:py-4 ${
                          active
                            ? "border-sky-600 bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                            : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50/50"
                        }`}
                      >
                        <span className="block text-lg font-bold">{cls}</span>
                        <span className={`mt-0.5 block text-xs ${active ? "text-sky-100" : "text-slate-500"}`}>
                          {cls === 1 ? "First" : cls === 2 ? "Second" : "Third"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Sex */}
              <fieldset>
                <legend className={labelClass}>Sex</legend>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "male", label: "Male", symbol: "♂" },
                    { value: "female", label: "Female", symbol: "♀" },
                  ].map((item) => {
                    const active = form.Sex === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => updateForm("Sex", item.value)}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-sky-500/10 ${
                          active
                            ? "border-sky-600 bg-sky-50 text-sky-800 ring-1 ring-sky-600"
                            : "border-slate-200 bg-white text-slate-600 hover:border-sky-300"
                        }`}
                      >
                        <span className="text-lg">{item.symbol}</span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Age and fare */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="age">Age</label>
                  <div className="relative">
                    <input
                      id="age"
                      type="number"
                      value={form.Age}
                      onChange={(e) => updateForm("Age", Number(e.target.value))}
                      className={`${inputClass} pr-14`}
                      min={0}
                      max={120}
                      step="1"
                      required
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                      years
                    </span>
                  </div>
                </div>
                <div>
                  <label className={labelClass} htmlFor="fare">Ticket fare</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      £
                    </span>
                    <input
                      id="fare"
                      type="number"
                      value={form.Fare}
                      onChange={(e) => updateForm("Fare", Number(e.target.value))}
                      className={`${inputClass} pl-9`}
                      min={0}
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Family */}
              <div>
                <div className="mb-3">
                  <h3 className={labelClass}>Family aboard</h3>
                  <p className="-mt-1 text-xs text-slate-500">
                    Enter the number of relatives travelling with the passenger.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600" htmlFor="sibsp">
                      Siblings / spouse
                    </label>
                    <input
                      id="sibsp"
                      type="number"
                      value={form.SibSp}
                      onChange={(e) => updateForm("SibSp", Number(e.target.value))}
                      className={inputClass}
                      min={0}
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600" htmlFor="parch">
                      Parents / children
                    </label>
                    <input
                      id="parch"
                      type="number"
                      value={form.Parch}
                      onChange={(e) => updateForm("Parch", Number(e.target.value))}
                      className={inputClass}
                      min={0}
                      step="1"
                    />
                  </div>
                </div>
              </div>

              {/* Embarkation */}
              <fieldset>
                <legend className={labelClass}>Port of embarkation</legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {ports.map((port) => {
                    const active = form.Embarked === port.value;
                    return (
                      <button
                        key={port.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => updateForm("Embarked", port.value)}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition focus:outline-none focus:ring-4 focus:ring-sky-500/10 sm:block sm:text-center ${
                          active
                            ? "border-sky-600 bg-sky-50 ring-1 ring-sky-600"
                            : "border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold sm:mx-auto sm:mb-2 ${
                          active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          {port.value}
                        </span>
                        <span>
                          <span className={`block text-xs font-semibold ${active ? "text-sky-800" : "text-slate-700"}`}>
                            {port.name}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-slate-400">
                            {port.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                  <span className="font-semibold">Prediction failed:</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-sky-700/20 focus:outline-none focus:ring-4 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Analyzing passenger...
                  </>
                ) : (
                  <>
                    Generate prediction
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Results / information panel */}
          <aside className="space-y-5">
            <section className="overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-[0_20px_70px_-35px_rgba(15,23,42,0.55)] sm:p-7">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
                  Analysis overview
                </span>
            
              </div>

              {result ? (
                <div aria-live="polite">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                    {result.survived ? "✓" : "!"}
                  </div>
                  <p className="text-sm text-slate-400">Prediction result</p>
                  <h2 className={`mt-1 text-3xl font-extrabold tracking-tight ${result.survived ? "text-emerald-300" : "text-rose-300"}`}>
                    {result.survived ? "Survived" : "Did not survive"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Model confidence{" "}
                    <span className="font-bold text-white">
                      {Number(result.confidence).toFixed(2)}%
                    </span>
                  </p>

                  <div className="mt-8 space-y-5">
                    <ProbabilityBar
                      label="Survival probability"
                      value={result.probability_survived}
                      color="bg-emerald-400"
                    />
                    <ProbabilityBar
                      label="Non-survival probability"
                      value={result.probability_died}
                      color="bg-rose-400"
                    />
                  </div>
                </div>
              ) : (
                <div className="pb-2">
         
                  <h2 className="text-2xl font-bold tracking-tight">
                    Your results<br />will appear here.
                  </h2>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
                    Complete the passenger form and run the model to see its
                    prediction and probability breakdown.
                  </p>
                  <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-300">
                      <span className="h-2 w-2 rounded-full bg-sky-400" />
                      Ready for analysis
                    </div>
                    <p className="text-xs leading-5 text-slate-500">
                      Your passenger details are sent to the prediction API
                      when you submit the form.
                    </p>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">
                  💡
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Did you know?</h3>
                  <p className="text-xs text-slate-500">About the Titanic dataset</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                The model uses passenger characteristics such as class, age,
                family aboard, fare, sex, and embarkation port to estimate an
                outcome based on patterns in its training data.
              </p>
            </section>

            <p className="px-2 text-center text-xs leading-5 text-slate-400">
              This is a machine-learning estimate, not a definitive historical
              conclusion.
            </p>
          </aside>
        </div>

        <footer className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-slate-200/80 pt-5 text-xs text-slate-400 sm:flex-row">
  <p>
    © 2026 ALIF AI - Titanic passenger analytics
  </p>
  <p>Powered by Next.js - FastAPI - Random Forest</p>
</footer>
      </div>
    </main>
  );
}

function ProbabilityBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="font-bold tabular-nums text-white">
          {safeValue.toFixed(1)}%
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label={label}
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
