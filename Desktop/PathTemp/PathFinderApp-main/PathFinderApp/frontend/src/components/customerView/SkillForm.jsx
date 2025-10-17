// src/components/customerView/SkillForm.jsx
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaTimes, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/* -------------------------------------------------------------------------- */
/*                                   CONSTS                                   */
/* -------------------------------------------------------------------------- */

const ALLOWED = {
  years: ["1", "2", "3", "4"],
  semesters: ["1", "2"],
  alStreams: [
    "",
    "Physical Science",
    "Biological Science",
    "Commerce",
    "Arts",
    "Technology",
    "Other",
  ],
  excitement: [
    "",
    "Coding",
    "Analyzing Data",
    "Designing Interfaces & Media",
    "Managing IT Systems",
    "Securing Systems & Networks",
    "Building with Hardware/Embedded",
    "Doing Research",
  ],
  workStyle: ["", "Individual", "Team"],
  tri: ["Low", "Medium", "High"],
  subjects: ["Programming", "Mathematics", "Networking", "Design", "Research"],
  languages: [
    "HTML/CSS",
    "Python",
    "Java",
    "JavaScript/TypeScript",
    "SQL",
    "PHP",
    "MERN",
    "MEAN",
    "Android",
    "React Native",
  ],
  careerGoals: [
    "Software Engineer",
    "Full Stack Developer",
    "Mobile Developer",
    "Data Scientist",
    "Data Engineer",
    "ML/AI Engineer",
    "Network Engineer",
    "DevOps/Cloud Engineer",
    "Cyber Security Analyst",
    "Business Analyst",
    "Systems Analyst",
    "Product Owner",
    "UI/UX Designer",
    "Game Developer",
    "Research/Academia",
  ],
};

const INITIAL_FORM = {
  currentYear: "2",
  currentSemester: "1",
  cgpa: "",
  alStream: "",
  hasPhysicsAndCombinedMaths: false,

  subjects: [],
  excitement: "",
  programmingSkill: 3,
  mathSkill: 3,
  cyberSkill: 3,
  uiuxSkill: 3,
  researchSkill: 3,
  motivation: 3,
  languages: [],
  workStyle: "",
  debugPatience: "",
  hardwareInterest: "Low",
  designCreativity: "Low",
  dataHandlingComfort: "Medium",
  securityMindset: "Medium",
  wantsResearchPath: false,

  careerGoals: [],
  additional: "",
  consentToShareWithExperts: false,
};

const SKILL_LABELS = {
  1: "Beginner",
  2: "Basic",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

const specializationRoutes = {
  "Software Engineering": "/specializations/software-engineering",
  "Data Science": "/specializations/data-science",
  "Cyber Security": "/specializations/cyber-security",
  "Information Technology": "/specializations/information-technology",
  "Computer Systems & Network Engineering":
    "/specializations/network-engineering",
  "Information Systems Engineering": "/specializations/information-systems",
  "Interactive Media": "/specializations/interactive-media",
  "Computer Science": "/specializations/computer-science",
  "Computer Systems Engineering": "/specializations/computer-systems",
};

/* -------------------------------------------------------------------------- */
/*                                UTIL COMPONENTS                             */
/* -------------------------------------------------------------------------- */

const ErrorText = ({ msg }) => (
  <p className="mt-1 text-xs text-red-400" role="alert">
    {msg}
  </p>
);

/* -------------------------------------------------------------------------- */
/*                                  COMPONENT                                  */
/* -------------------------------------------------------------------------- */

const SkillForm = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverResult, setServerResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  /* -------------------------------- Handlers -------------------------------- */

  const onFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onGroupCheck = (e, field) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const set = new Set(prev[field] || []);
      checked ? set.add(value) : set.delete(value);
      return { ...prev, [field]: Array.from(set) };
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onRangeChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onRadioChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /* ------------------------------- Validation ------------------------------- */

  const validate = (data) => {
    const e = {};

    if (!ALLOWED.years.includes(data.currentYear))
      e.currentYear = "Please select Year 1–4.";
    if (!ALLOWED.semesters.includes(data.currentSemester))
      e.currentSemester = "Please select Semester 1 or 2.";

    if (
      data.cgpa !== "" &&
      (Number.isNaN(parseFloat(data.cgpa)) ||
        parseFloat(data.cgpa) < 0 ||
        parseFloat(data.cgpa) > 4)
    ) {
      e.cgpa = "CGPA must be a number between 0.00 and 4.00.";
    }

    if (!ALLOWED.alStreams.includes(data.alStream))
      e.alStream = "Please choose a valid A/L stream.";

    if (!Array.isArray(data.subjects) || data.subjects.length < 1) {
      e.subjects = "Pick at least one subject.";
    } else if (data.subjects.some((s) => !ALLOWED.subjects.includes(s))) {
      e.subjects = "One or more selected subjects are invalid.";
    }

    if (
      !ALLOWED.excitement.includes(data.excitement) ||
      data.excitement === ""
    ) {
      e.excitement = "Tell us what excites you.";
    }

    if (!ALLOWED.workStyle.includes(data.workStyle) || data.workStyle === "") {
      e.workStyle = "Work style is required.";
    }

    if (
      !ALLOWED.tri.includes(data.debugPatience) ||
      data.debugPatience === ""
    ) {
      e.debugPatience = "Select your patience level.";
    }

    [
      "programmingSkill",
      "mathSkill",
      "cyberSkill",
      "uiuxSkill",
      "researchSkill",
      "motivation",
    ].forEach((k) => {
      const v = Number(data[k]);
      if (!(v >= 1 && v <= 5)) e[k] = "Please rate between 1 and 5.";
    });

    [
      "hardwareInterest",
      "designCreativity",
      "dataHandlingComfort",
      "securityMindset",
    ].forEach((k) => {
      if (!ALLOWED.tri.includes(data[k]))
        e[k] = "Please select Low, Medium, or High.";
    });

    if (data.languages.some((l) => !ALLOWED.languages.includes(l))) {
      e.languages = "One or more selected technologies are invalid.";
    }

    if (!Array.isArray(data.careerGoals) || data.careerGoals.length < 1) {
      e.careerGoals = "Pick at least one career goal.";
    } else if (data.careerGoals.some((g) => !ALLOWED.careerGoals.includes(g))) {
      e.careerGoals = "One or more selected career goals are invalid.";
    }

    if (data.additional && data.additional.length > 1000) {
      e.additional = "Please keep additional details under 1000 characters.";
    }

    return e;
  };

  /* -------------------------- Recommendation Helpers ------------------------- */

  const topRecommendation = () => {
    const list = serverResult?.recommendations || [];
    if (!list.length) return null;
    return list.reduce((best, curr) =>
      curr.percentage > best.percentage ? curr : best
    );
  };

  const handleNavigateToExperts = () => {
    const top = topRecommendation();
    if (top && specializationRoutes[top.track]) {
      toast.success(`Navigating to ${top.track} specialization`);
      setShowModal(false);
      setTimeout(() => {
        navigate(
          `/expertProfiles?specialization=${encodeURIComponent(top.track)}`
        );
      }, 800);
    } else {
      toast.error("No valid specialization found for navigation");
    }
  };

  /* --------------------------------- Submit --------------------------------- */

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerResult(null);

    const issues = validate(form);
    if (Object.keys(issues).length) {
      setErrors(issues);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      const res = await fetch("http://localhost:4000/aiRoute/preferDetails", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        let msg = "Submission failed.";
        try {
          const body = await res.json();
          if (body?.errors && typeof body.errors === "object") {
            setErrors(body.errors);
            msg = "Please fix the highlighted fields.";
          } else if (body?.message) {
            msg = body.message;
          }
        } catch {
          /* ignore non-JSON */
        }
        toast.error(msg);
        return;
      }

      const data = await res.json();
      setServerResult(data);
      setShowModal(true);
      toast.success("Submitted successfully!");
    } catch (err) {
      toast.error("Network error. Please try again.", err);
    } finally {
      setSubmitting(false);
    }
  };

  const invalid = (name) => Boolean(errors[name]);

  /* ---------------------------------- UI ---------------------------------- */

  return (
    <>
      <Toaster position="top-center" />

      {/* Modal: Specialization Recommendations */}
      {showModal && serverResult && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-black/60 backdrop-blur-md">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-[#2DE2E6]">
                Specialization Recommendations
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/70 hover:text-white text-2xl cursor-pointer transition"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            {serverResult?.summary && (
              <div className="mb-6 p-4 rounded-lg bg-black/40 text-gray-100 whitespace-pre-line animate-fade-in-up">
                {serverResult.summary}
              </div>
            )}

            <h3 className="text-xl font-bold mb-4 text-[#2DE2E6]">
              Top Specialization Matches
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {serverResult?.recommendations?.map((r, i) => (
                <div
                  key={r.track}
                  className={`p-4 rounded-xl bg-black/40 backdrop-blur border border-transparent cursor-pointer animate-fade-in-up ${
                    i === 0 ? "ring-2 ring-[#2DE2E6]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-[#FF6EC7]">{r.track}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/80">
                      {r.percentage}% match
                    </span>
                  </div>
                  {r.reason && (
                    <p className="text-sm text-gray-300 mb-3">{r.reason}</p>
                  )}
                  {Array.isArray(r.roles) && r.roles.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-400 mb-1">
                        Potential Roles:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {r.roles.slice(0, 3).map((role) => (
                          <span
                            key={role}
                            className="text-xs px-2 py-1 rounded bg-white/10 text-gray-200"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {r.learningEase && (
                    <p className="text-xs text-gray-300">
                      Learning:{" "}
                      <span className="text-white">{r.learningEase}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>

            {serverResult?.expertTypes?.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-[#2DE2E6] mb-2">
                  Suggested Expert Types
                </h4>
                <div className="flex flex-wrap gap-2">
                  {serverResult.expertTypes.map((et) => (
                    <span
                      key={et}
                      className="px-3 py-1 rounded-full text-sm bg-[#2DE2E6]/20 text-[#2DE2E6]"
                    >
                      {et}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 rounded-lg text-white bg-white/10 hover:bg-white/20 transition cursor-pointer animate-fade-in-up"
              >
                Close
              </button>
              <button
                onClick={handleNavigateToExperts}
                className="flex-1 px-4 py-3 rounded-lg font-bold text-gray-900 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] hover:opacity-90 transition-all cursor-pointer animate-fade-in-up flex items-center justify-center gap-2"
              >
                <FaArrowRight />
                Navigate to {topRecommendation()?.track || "Specialization"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header (transparent, so global BG is visible) */}
      <div className="p-8 border-b border-white/10 bg-transparent animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-center text-white bg-clip-text bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] drop-shadow">
          Path Finder — Student Profile
        </h1>
        <p className="text-center text-white neon-glow mt-4 text-lg">
          Fill your details to get the best-fit SLIIT specialization(s) and
          suggested experts to contact.
        </p>
      </div>

      {/* Form */}
      <form
        className="p-8 space-y-10 animate-fade-in"
        onSubmit={onSubmit}
        noValidate
      >
        {/* Academic Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-black/50 backdrop-blur">
            <label className="block text-sm font-semibold text-[#2DE2E6] mb-2">
              Current Year
            </label>
            <select
              name="currentYear"
              value={form.currentYear}
              onChange={onFieldChange}
              className={`w-full px-3 py-2 rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-[#2DE2E6] outline-none cursor-pointer ${
                invalid("currentYear") ? "ring-2 ring-red-500" : ""
              }`}
              aria-invalid={invalid("currentYear")}
            >
              {ALLOWED.years.map((y) => (
                <option key={y} value={y} className="bg-[#0b0d14]">
                  {y}
                </option>
              ))}
            </select>
            {errors.currentYear && <ErrorText msg={errors.currentYear} />}
          </div>

          <div className="p-5 rounded-xl bg-black/50 backdrop-blur">
            <label className="block text-sm font-semibold text-[#2DE2E6] mb-2">
              Semester
            </label>
            <select
              name="currentSemester"
              value={form.currentSemester}
              onChange={onFieldChange}
              className={`w-full px-3 py-2 rounded-lg bg.white/10 bg-white/10 text-white focus:ring-2 focus:ring-[#2DE2E6] outline-none cursor-pointer ${
                invalid("currentSemester") ? "ring-2 ring-red-500" : ""
              }`}
              aria-invalid={invalid("currentSemester")}
            >
              {ALLOWED.semesters.map((s) => (
                <option key={s} value={s} className="bg-[#0b0d14]">
                  {s}
                </option>
              ))}
            </select>
            {errors.currentSemester && (
              <ErrorText msg={errors.currentSemester} />
            )}
          </div>

          <div className="p-5 rounded-xl bg-black/50 backdrop-blur">
            <label className="block text-sm font-semibold text-[#2DE2E6] mb-2">
              CGPA (optional)
            </label>
            <input
              type="number"
              name="cgpa"
              step="0.01"
              min="0"
              max="4"
              value={form.cgpa}
              onChange={onFieldChange}
              className={`w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-[#2DE2E6] outline-none ${
                invalid("cgpa") ? "ring-2 ring-red-500" : ""
              }`}
              aria-invalid={invalid("cgpa")}
              placeholder="e.g., 3.10"
            />
            {errors.cgpa && <ErrorText msg={errors.cgpa} />}
          </div>

          <div className="p-5 rounded-xl bg-black/50 backdrop-blur">
            <label className="block text-sm font-semibold text-[#2DE2E6] mb-2">
              A/L Stream
            </label>
            <select
              name="alStream"
              value={form.alStream}
              onChange={onFieldChange}
              className={`w-full px-3 py-2 rounded-lg bg-white/10 text-white focus:ring-2 focus:ring-[#2DE2E6] outline-none cursor-pointer ${
                invalid("alStream") ? "ring-2 ring-red-500" : ""
              }`}
              aria-invalid={invalid("alStream")}
            >
              {ALLOWED.alStreams.map((s) => (
                <option key={s || "select"} value={s} className="bg-[#0b0d14]">
                  {s || "Select"}
                </option>
              ))}
            </select>
            {errors.alStream && <ErrorText msg={errors.alStream} />}

            <label className="mt-3 flex items-center gap-2 text-sm text-white/90 cursor-pointer">
              <input
                type="checkbox"
                name="hasPhysicsAndCombinedMaths"
                checked={form.hasPhysicsAndCombinedMaths}
                onChange={onFieldChange}
                className="h-4 w-4 text-[#FF6EC7] bg-white/10 rounded cursor-pointer"
              />
              I did Physics + Combined Maths
            </label>
          </div>
        </div>

        {/* Subjects */}
        <div className="p-6 rounded-xl bg-black/50 backdrop-blur">
          <label className="block text-sm font-semibold text-[#2DE2E6] mb-3">
            Subjects you enjoy most
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {ALLOWED.subjects.map((s) => (
              <label
                key={s}
                className="flex items-center p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={s}
                  checked={form.subjects.includes(s)}
                  onChange={(e) => onGroupCheck(e, "subjects")}
                  className="h-4 w-4 text-[#FF6EC7] bg-white/10 rounded cursor-pointer"
                />
                <span className="ml-2 text-white/90">{s}</span>
              </label>
            ))}
          </div>
          {errors.subjects && <ErrorText msg={errors.subjects} />}
        </div>

        {/* Excitement */}
        <div className="p-6 rounded-xl bg-black/50 backdrop-blur">
          <label className="block text-sm font-semibold text-[#2DE2E6] mb-3">
            What excites you the most?
          </label>
          <select
            name="excitement"
            value={form.excitement}
            onChange={onFieldChange}
            className={`w-full px-4 py-3 rounded-lg bg-white/10 text-white outline-none focus:ring-2 focus:ring-[#2DE2E6] cursor-pointer ${
              invalid("excitement") ? "ring-2 ring-red-500" : ""
            }`}
            aria-invalid={invalid("excitement")}
          >
            {ALLOWED.excitement.map((opt) => (
              <option
                key={opt || "select"}
                value={opt}
                className="bg-[#0b0d14]"
              >
                {opt || "Select"}
              </option>
            ))}
          </select>
          {errors.excitement && <ErrorText msg={errors.excitement} />}
        </div>

        {/* Skill Sliders */}
        <div className="p-6 rounded-xl bg-black/50 backdrop-blur">
          <h2 className="text-xl font-semibold text-[#2DE2E6] mb-5">
            Rate Your Skills
          </h2>
          <div className="space-y-6">
            {[
              ["programmingSkill", "Programming"],
              ["mathSkill", "Math & Statistics"],
              ["cyberSkill", "Security Knowledge"],
              ["uiuxSkill", "UI/UX & Media"],
              ["researchSkill", "Research & Learning"],
              ["motivation", "Learning Motivation"],
            ].map(([name, label]) => (
              <div key={name}>
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-white/90">
                    {label}
                  </label>
                  <span className="text-xs font-semibold text-[#FF6EC7] bg-white/10 px-3 py-1 rounded-full">
                    {SKILL_LABELS[form[name]]}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  name={name}
                  value={form[name]}
                  onChange={onRangeChange}
                  className={`w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-[#2DE2E6] focus:outline-none ${
                      invalid(name) ? "ring-2 ring-red-500" : ""
                    }`}
                  aria-invalid={invalid(name)}
                />
                {errors[name] && <ErrorText msg={errors[name]} />}
                <div className="flex justify-between text-[10px] text-white/70 mt-1">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Expert</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-black/50 backdrop-blur">
            <label className="block text-sm font-semibold text-[#2DE2E6] mb-3">
              Work Style
            </label>
            {ALLOWED.workStyle.filter(Boolean).map((opt) => (
              <label
                key={opt}
                className={`flex items-center p-3 rounded-lg hover:bg-white/10 cursor-pointer mb-2 transition-colors ${
                  invalid("workStyle") ? "ring-2 ring-red-500" : ""
                }`}
              >
                <input
                  type="radio"
                  name="workStyle"
                  value={opt}
                  checked={form.workStyle === opt}
                  onChange={onRadioChange}
                  className="h-4 w-4 text-[#FF6EC7] bg-white/10 cursor-pointer"
                  aria-invalid={invalid("workStyle")}
                />
                <span className="ml-2 text-white/90">{opt}</span>
              </label>
            ))}
            {errors.workStyle && <ErrorText msg={errors.workStyle} />}
            <label className="flex items-center gap-2 text-sm text-white/90 mt-4 cursor-pointer">
              <input
                type="checkbox"
                name="wantsResearchPath"
                checked={form.wantsResearchPath}
                onChange={onFieldChange}
                className="h-4 w-4 text-[#FF6EC7] bg-white/10 rounded cursor-pointer"
              />
              I'm open to a research/academic path
            </label>
          </div>

          <div className="p-6 rounded-xl bg-black/50 backdrop-blur">
            <label className="block text-sm font-semibold text-[#2DE2E6] mb-3">
              Patience for Debugging
            </label>
            {ALLOWED.tri.map((opt) => (
              <label
                key={opt}
                className={`flex items-center p-3 rounded-lg hover:bg-white/10 cursor-pointer mb-2 transition-colors ${
                  invalid("debugPatience") ? "ring-2 ring-red-500" : ""
                }`}
              >
                <input
                  type="radio"
                  name="debugPatience"
                  value={opt}
                  checked={form.debugPatience === opt}
                  onChange={onRadioChange}
                  className="h-4 w-4 text-[#FF6EC7] bg-white/10 cursor-pointer"
                  aria-invalid={invalid("debugPatience")}
                />
                <span className="ml-2 text-white/90">{opt}</span>
              </label>
            ))}
            {errors.debugPatience && <ErrorText msg={errors.debugPatience} />}
          </div>

          <div className="p-6 rounded-xl bg-black/50 backdrop-blur">
            <label className="block text-sm font-semibold text-[#2DE2E6] mb-3">
              Other Preferences
            </label>
            {[
              ["hardwareInterest", "Hardware / Embedded"],
              ["designCreativity", "Design / Creativity"],
              ["dataHandlingComfort", "Data Handling Comfort"],
              ["securityMindset", "Security Mindset"],
            ].map(([name, label]) => (
              <div
                key={name}
                className="flex items-center justify-between mb-4"
              >
                <span className="text-sm text-white/90">{label}</span>
                <select
                  name={name}
                  value={form[name]}
                  onChange={onFieldChange}
                  className={`px-3 py-1 rounded bg.white/10 bg-white/10 text-white focus:ring-2 focus:ring-[#2DE2E6] outline-none cursor-pointer ${
                    invalid(name) ? "ring-2 ring-red-500" : ""
                  }`}
                  aria-invalid={invalid(name)}
                >
                  {ALLOWED.tri.map((v) => (
                    <option key={v} value={v} className="bg-[#0b0d14]">
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {errors.hardwareInterest && (
              <ErrorText msg={errors.hardwareInterest} />
            )}
            {errors.designCreativity && (
              <ErrorText msg={errors.designCreativity} />
            )}
            {errors.dataHandlingComfort && (
              <ErrorText msg={errors.dataHandlingComfort} />
            )}
            {errors.securityMindset && (
              <ErrorText msg={errors.securityMindset} />
            )}
          </div>
        </div>

        {/* Career Goals */}
        <div className="p-6 rounded-xl bg-black/50 backdrop-blur">
          <label className="block text-sm font-semibold text-[#2DE2E6] mb-3">
            Career Goals (pick a few)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALLOWED.careerGoals.map((role) => (
              <label
                key={role}
                className="flex items-center p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={role}
                  checked={form.careerGoals.includes(role)}
                  onChange={(e) => onGroupCheck(e, "careerGoals")}
                  className="h-4 w-4 text-[#FF6EC7] bg-white/10 rounded cursor-pointer"
                />
                <span className="ml-2 text-white/90">{role}</span>
              </label>
            ))}
          </div>
          {errors.careerGoals && <ErrorText msg={errors.careerGoals} />}
        </div>

        {/* Programming Tech */}
        <div className="p-6 rounded-xl bg-black/50 backdrop-blur">
          <label className="block text-sm font-semibold text-[#2DE2E6] mb-3">
            Strong Programming Technologies
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {ALLOWED.languages.map((lang) => (
              <label
                key={lang}
                className="flex items-center p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={lang}
                  checked={form.languages.includes(lang)}
                  onChange={(e) => onGroupCheck(e, "languages")}
                  className="h-4 w-4 text-[#FF6EC7] bg-white/10 rounded cursor-pointer"
                />
                <span className="ml-2 text-white/90">{lang}</span>
              </label>
            ))}
          </div>
          {errors.languages && <ErrorText msg={errors.languages} />}
        </div>

        {/* Additional & Consent */}
        <div className="p-6 rounded-xl bg-black/50 backdrop-blur">
          <label className="block text-sm font-semibold text-[#2DE2E6] mb-3">
            Additional Details
          </label>
          <textarea
            name="additional"
            value={form.additional}
            onChange={onFieldChange}
            rows="4"
            className={`w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder:text-gray-300 focus:ring-2 focus:ring-[#2DE2E6] outline-none ${
              invalid("additional") ? "ring-2 ring-red-500" : ""
            }`}
            placeholder="Anything else you'd like to add..."
            aria-invalid={invalid("additional")}
          />
          {errors.additional && <ErrorText msg={errors.additional} />}
          <label className="mt-4 flex items-center gap-2 text-sm text-white/90 cursor-pointer">
            <input
              type="checkbox"
              name="consentToShareWithExperts"
              checked={form.consentToShareWithExperts}
              onChange={onFieldChange}
              className="h-4 w-4 text-[#FF6EC7] bg-white/10 rounded cursor-pointer"
            />
            I consent to share my profile with relevant Path Finder experts.
          </label>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl font-bold text-gray-900 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer animate-fade-in-up"
          >
            {submitting
              ? "Finding your best matches..."
              : "Get Specialization Recommendations"}
          </button>
        </div>
      </form>

      {/* Animations */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px) } 100% { opacity: 1; transform: translateY(0) } }
        .animate-fade-in { animation: fade-in .5s ease-out both }
        .animate-fade-in-up { animation: fade-in-up .55s cubic-bezier(.2,.65,.2,1) both }
      `}</style>
    </>
  );
};

export default SkillForm;
