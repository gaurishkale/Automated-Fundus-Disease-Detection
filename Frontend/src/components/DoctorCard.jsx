import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Clock,
  Navigation,
  CalendarCheck,
  Phone,
  Stethoscope,
} from "lucide-react";

function DoctorCard({ doctor, index, isHighlighted, onBook, onCardClick }) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${doctor.lat},${doctor.lng}`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -4, boxShadow: "0 12px 36px rgba(15,101,131,0.12)" }}
      onClick={() => onCardClick?.(doctor.id)}
      className={`cursor-pointer rounded-xl border bg-white p-5 shadow-md transition-colors duration-200 ${
        isHighlighted
          ? "border-blue-500 ring-2 ring-blue-200"
          : "border-slate-200 hover:border-blue-300"
      }`}
    >
      <div className="flex gap-4">
        {/* Doctor image */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-blue-100 to-teal-50">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=dbeafe&color=2563eb&size=128&font-size=0.35&bold=true`;
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/20 to-transparent py-1" />
        </div>

        {/* Doctor info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-slate-900">
            {doctor.name}
          </h3>

          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-blue-600">
            <Stethoscope className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-medium">{doctor.specialty}</span>
          </div>

          <p className="mt-1 truncate text-xs text-slate-500">
            {doctor.clinic}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-semibold text-slate-800">
                {doctor.rating}
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {doctor.experience}
            </span>
            <span className="inline-flex items-center gap-1 text-blue-500">
              <Navigation className="h-3 w-3" />
              {doctor.distance}
            </span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span>
          {doctor.location}, {doctor.city === "navimumbai" ? "Navi Mumbai" : doctor.city === "bangalore" ? "Bangalore" : doctor.city.charAt(0).toUpperCase() + doctor.city.slice(1)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBook?.(doctor);
          }}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md"
        >
          <CalendarCheck className="h-3.5 w-3.5" />
          Book Appointment
        </motion.button>

        <motion.a
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          href={`tel:${doctor.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100"
        >
          <Phone className="h-3.5 w-3.5" />
          Call
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-blue-300 hover:text-blue-600"
        >
          <Navigation className="h-3.5 w-3.5" />
          Directions
        </motion.a>
      </div>
    </motion.article>
  );
}

export default DoctorCard;
