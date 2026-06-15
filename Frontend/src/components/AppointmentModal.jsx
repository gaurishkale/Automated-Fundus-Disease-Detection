import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarCheck, User, Phone, Calendar, Clock } from "lucide-react";

const overlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modal = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 350 } },
  exit: { opacity: 0, scale: 0.92, y: 30, transition: { duration: 0.2 } },
};

function AppointmentModal({ doctor, onClose }) {
  const [form, setForm] = useState({
    patientName: "",
    phone: "",
    date: "",
    time: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (!doctor) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        variants={overlay}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          variants={modal}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            type="button"
            className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>

          {!submitted ? (
            <>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-500 text-white">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Book Appointment
                  </h2>
                  <p className="text-sm text-slate-500">
                    with {doctor.name}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Patient Name
                  </label>
                  <input
                    name="patientName"
                    value={form.patientName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    type="tel"
                    placeholder="+91 9876543210"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Preferred Date
                    </label>
                    <input
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                      type="date"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Preferred Time
                    </label>
                    <input
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      required
                      type="time"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg"
                >
                  Confirm Appointment
                </motion.button>
              </form>
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CalendarCheck className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Appointment Requested!
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Your appointment with <strong>{doctor.name}</strong> has been
                requested for{" "}
                <strong>
                  {form.date} at {form.time}
                </strong>
                .
              </p>
              <p className="mt-1 text-xs text-slate-400">
                The clinic will contact you at {form.phone} to confirm.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="mt-5 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AppointmentModal;
