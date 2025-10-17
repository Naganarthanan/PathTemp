// src/pages/ContactPage.jsx
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaArrowRight,
} from "react-icons/fa";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!EMAIL_RE.test(form.email)) e.email = "Valid email is required.";
    if (!form.subject.trim()) e.subject = "Subject is required.";
    if (!form.message.trim() || form.message.trim().length < 10)
      e.message = "Message must be at least 10 characters.";
    if (form.message.length > 1000)
      e.message = "Message must be under 1000 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Simulate success (replace with API call)
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="text-white min-h-screen w-full overflow-hidden bg-[#1D1E2C]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1D1E2C] via-[#2a2b3d] to-[#1D1E2C] pt-28 pb-14 lg:pt-32 lg:pb-18 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-[#2DE2E6]/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-[#FF6EC7]/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold animate-fade-in-up">
            Contact Us
          </h1>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto animate-fade-in">
            Have questions about your path or partnership opportunities? We’d
            love to hear from you.
          </p>
        </div>
      </section>

      {/* Info + Form */}
      <section className="py-14 lg:py-20 bg-[#1D1E2C] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-10">
            {[
              {
                icon: <FaEnvelope />,
                title: "Email",
                text: "infopathfinder@gmail.com",
                sub: "We reply within 24 hours",
              },
              {
                icon: <FaPhoneAlt />,
                title: "Phone",
                text: "+94 76 12 34 567",
                sub: "Mon–Fri, 9:00–17:00",
              },
              {
                icon: <FaMapMarkerAlt />,
                title: "Location",
                text: "123 Central Road,",
                sub: "Orr's Hill, Trincomalee",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="bg-[#2a2b3d]/50 backdrop-blur-md rounded-2xl p-6 border border-[#2a2b3d] hover:border-[#2DE2E6]/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#2DE2E6] text-xl mb-4">
                  {c.icon}
                </div>
                <h3 className="text-lg font-semibold mb-1">{c.title}</h3>
                <p className="text-white/90">{c.text}</p>
                <p className="text-gray-400 text-sm mt-1">{c.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <form
              onSubmit={onSubmit}
              noValidate
              className="lg:col-span-2 bg-[#2a2b3d]/50 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-[#2a2b3d] animate-fade-in-up"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className={`w-full px-4 py-3 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-[#2DE2E6] ${
                      errors.name ? "ring-2 ring-red-500" : ""
                    }`}
                    placeholder="Alex Johnson"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    className={`w-full px-4 py-3 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-[#2DE2E6] ${
                      errors.email ? "ring-2 ring-red-500" : ""
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={onChange}
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-[#2DE2E6] ${
                    errors.subject ? "ring-2 ring-red-500" : ""
                  }`}
                  placeholder="How can we help?"
                />
                {errors.subject && (
                  <p className="mt-1 text-xs text-red-400">{errors.subject}</p>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={onChange}
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-[#2DE2E6] ${
                    errors.message ? "ring-2 ring-red-500" : ""
                  }`}
                  placeholder="Share a few details so we can assist you better..."
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-400">{errors.message}</p>
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-[#1D1E2C] px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  Send Message <FaArrowRight className="text-sm" />
                </button>
                <NavLink
                  to="/about"
                  className="flex-1 border-2 border-[#2DE2E6]/30 text-[#2DE2E6] px-6 py-3 rounded-xl font-semibold hover:bg-[#2DE2E6]/10 transition-all cursor-pointer inline-flex items-center justify-center"
                >
                  Learn About Us
                </NavLink>
              </div>

              {sent && (
                <div className="mt-4 text-sm rounded-lg px-4 py-3 bg-[#2DE2E6]/10 text-[#2DE2E6] animate-fade-in">
                  Thanks! Your message has been sent. We’ll get back to you
                  soon.
                </div>
              )}
            </form>

            {/* Sidebar */}
            <div className="bg-[#2a2b3d]/50 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-[#2a2b3d] animate-fade-in-up">
              <h3 className="text-lg font-semibold mb-4">Support Hours</h3>
              <div className="flex items-center gap-3 text-gray-300">
                <FaClock className="text-[#2DE2E6]" />
                <p>Mon–Fri: 9:00–17:00 (PT)</p>
              </div>

              <h3 className="text-lg font-semibold mt-8 mb-4">Follow Us</h3>
              <div className="flex items-center gap-3">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  aria-label="Twitter"
                >
                  <FaTwitter />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  aria-label="GitHub"
                >
                  <FaGithub />
                </a>
              </div>

              <h3 className="text-lg font-semibold mt-8 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <NavLink
                  to="/skillform"
                  className="block px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Take AI Assessment
                </NavLink>
                <NavLink
                  to="/expertProfiles"
                  className="block px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Meet Experts
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animations */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px) } 100% { opacity: 1; transform: translateY(0) } }
        .animate-fade-in { animation: fade-in .5s ease-out both }
        .animate-fade-in-up { animation: fade-in-up .55s cubic-bezier(.2,.65,.2,1) both }
        .animate-pulse-slow { animation: pulse 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ContactPage;
