import { useEffect, useRef, useState } from "react";
import { UserRound, X } from "lucide-react";

const PATIENT_INFO_KEY = "patient_info";

const INITIAL_FORM = {
  fullName: "",
  age: "",
  gender: "",
  location: "",
  phone: "",
  email: "",
  medicalCondition: "",
  diabetes: "",
  smoking: "",
};

const INITIAL_ERRORS = {};

function validate(form) {
  const errors = {};

  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!form.age) {
    errors.age = "Age is required.";
  } else {
    const n = Number(form.age);
    if (!Number.isInteger(n) || n < 1 || n > 120)
      errors.age = "Age must be 1–120.";
  }
  if (!form.location.trim()) errors.location = "Location is required.";
  if (!form.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (form.phone.replace(/\D/g, "").length < 10) {
    errors.phone = "Minimum 10 digits required.";
  }
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Invalid email format.";
  }

  return errors;
}

function getStoredPatientInfo() {
  try {
    const raw = sessionStorage.getItem(PATIENT_INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storePatientInfo(info) {
  sessionStorage.setItem(PATIENT_INFO_KEY, JSON.stringify(info));
}

function InputField({ label, id, required, type = "text", placeholder, value, onChange, error }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        inputMode={type === "number" ? "numeric" : undefined}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-200"
            : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
        }`}
      />
      {error && (
        <p className="mt-1 text-xs font-medium text-red-500" style={{ animation: "slideDown 200ms ease-out" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({ label, id, options, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function PatientInfoModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [touched, setTouched] = useState(false);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM);
      setErrors(INITIAL_ERRORS);
      setTouched(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (touched) {
      const updated = { ...form, [field]: val };
      setErrors(validate(updated));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    storePatientInfo(form);
    onSave(form);
  };

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  const isValid = touched ? Object.keys(errors).length === 0 : false;

  return (
    <>
      <style>
        {`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
          @keyframes backdropIn { from { opacity:0; } to { opacity:1; } }
          @keyframes slideDown { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }`}
      </style>

      <div
        ref={backdropRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
        style={{ animation: "backdropIn 200ms ease-out" }}
      >
        <div
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          style={{ animation: "modalIn 300ms ease-out" }}
        >
          <div className="h-1 bg-gradient-to-r from-blue-500 to-teal-400" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="px-6 pt-6 text-center">
            <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Patient Information</h2>
            <p className="mt-1 text-sm text-slate-500">
              Please provide basic details before AI screening.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 px-6 pb-6 pt-5">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <InputField
                label="Full Name"
                id="fullName"
                required
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange("fullName")}
                error={errors.fullName}
              />
              <InputField
                label="Age"
                id="age"
                required
                type="number"
                placeholder="25"
                value={form.age}
                onChange={handleChange("age")}
                error={errors.age}
              />
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <SelectField
                label="Gender"
                id="gender"
                value={form.gender}
                onChange={handleChange("gender")}
                options={[
                  { value: "", label: "Select" },
                  { value: "Male", label: "Male" },
                  { value: "Female", label: "Female" },
                  { value: "Other", label: "Other" },
                ]}
              />
              <InputField
                label="Location"
                id="location"
                required
                placeholder="Mumbai"
                value={form.location}
                onChange={handleChange("location")}
                error={errors.location}
              />
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <InputField
                label="Phone Number"
                id="phone"
                required
                placeholder="+91 9XXXXXXXXX"
                value={form.phone}
                onChange={handleChange("phone")}
                error={errors.phone}
              />
              <InputField
                label="Email ID"
                id="email"
                required
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange("email")}
                error={errors.email}
              />
            </div>

            <InputField
              label="Existing Medical Condition"
              id="medicalCondition"
              placeholder="e.g. Hypertension, None"
              value={form.medicalCondition}
              onChange={handleChange("medicalCondition")}
            />

            <div className="grid gap-3.5 sm:grid-cols-2">
              <SelectField
                label="Diabetes"
                id="diabetes"
                value={form.diabetes}
                onChange={handleChange("diabetes")}
                options={[
                  { value: "", label: "Select" },
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
              />
              <SelectField
                label="Smoking"
                id="smoking"
                value={form.smoking}
                onChange={handleChange("smoking")}
                options={[
                  { value: "", label: "Select" },
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={touched && !isValid}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save &amp; Continue
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export { getStoredPatientInfo };
export default PatientInfoModal;
