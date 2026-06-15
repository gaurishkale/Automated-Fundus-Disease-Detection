import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJsApiLoader } from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  Stethoscope,
  Eye,
  Users,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MapContainer from "./MapContainer";
import DoctorCard from "./DoctorCard";
import AppointmentModal from "./AppointmentModal";
import { doctors as allDoctors, CITY_COORDS } from "../data/eyeDoctorsIndia";

const LIBRARIES = ["places"];
const DEFAULT_ZOOM = 13;

const CITY_KEYS = Object.keys(CITY_COORDS);

function FindDoctors() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState("mumbai");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [highlightedId, setHighlightedId] = useState(null);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const debounceRef = useRef(null);
  const cardRefs = useRef({});

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setShowBanner(true), 40);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }, []);

  const filteredDoctors = useMemo(() => {
    let list = allDoctors.filter((d) => d.city === selectedCity);
    if (debouncedSearch.trim()) {
      const term = debouncedSearch.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.clinic.toLowerCase().includes(term) ||
          d.specialty.toLowerCase().includes(term),
      );
    }
    return list;
  }, [selectedCity, debouncedSearch]);

  const handleCityChange = useCallback((cityKey) => {
    setSelectedCity(cityKey);
    setHighlightedId(null);
    setSearchTerm("");
    setDebouncedSearch("");
  }, []);

  const handleMarkerClick = useCallback((id) => {
    setHighlightedId(id);
    const el = cardRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleCardClick = useCallback((id) => {
    setHighlightedId((prev) => (prev === id ? null : id));
  }, []);

  const city = CITY_COORDS[selectedCity];

  return (
    <div className="min-h-screen bg-slate-50/40">
      <Navbar onStartAnalysis={() => navigate("/analyze")} />

      {/* ── Hero Banner ── */}
      <section
        className={`relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-teal-500 px-4 py-16 text-white transition-all duration-700 ${
          showBanner ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />

        <div className="relative mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm"
          >
            <Eye className="h-4 w-4" />
            EyeDetect Doctor Discovery
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Find Eye Specialists Near You
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-blue-100/90 sm:text-lg"
          >
            Connect with experienced ophthalmologists for diagnosis and
            treatment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-6 inline-flex flex-wrap items-center justify-center gap-2"
          >
            {CITY_KEYS.map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm"
              >
                <MapPin className="h-3 w-3" />
                {CITY_COORDS[key].label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* City filter + Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {CITY_KEYS.map((key) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => handleCityChange(key)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                  selectedCity === key
                    ? "bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg shadow-blue-200"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {CITY_COORDS[key].label}
              </motion.button>
            ))}
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search doctor or clinic..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Map */}
        {!isLoaded ? (
          <div className="flex h-[280px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              Loading Google Maps...
            </div>
          </div>
        ) : (
          <MapContainer
            center={{ lat: city.lat, lng: city.lng }}
            zoom={DEFAULT_ZOOM}
            doctors={filteredDoctors}
            highlightedId={highlightedId}
            onMarkerClick={handleMarkerClick}
          />
        )}

        {/* Doctor count header */}
        <div className="mt-8 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
              <Stethoscope className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Eye Specialists
              </h2>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Users className="h-3 w-3" />
                Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""} in{" "}
                {CITY_COORDS[selectedCity].label}
              </p>
            </div>
          </div>
        </div>

        {/* Doctor grid */}
        {filteredDoctors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm"
          >
            <Search className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              No specialists found. Try a different search or city.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredDoctors.map((doctor, index) => (
                <div
                  key={doctor.id}
                  ref={(el) => {
                    cardRefs.current[doctor.id] = el;
                  }}
                >
                  <DoctorCard
                    doctor={doctor}
                    index={index}
                    isHighlighted={highlightedId === doctor.id}
                    onBook={setBookingDoctor}
                    onCardClick={handleCardClick}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Appointment Modal */}
      {bookingDoctor && (
        <AppointmentModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
        />
      )}

      <Footer />
    </div>
  );
}

export default FindDoctors;
