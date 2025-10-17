// src/components/customerView/ExpertProfilePage.jsx
import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaTimes,
  FaSave,
  FaEdit,
  FaLinkedin,
  FaGraduationCap,
  FaBriefcase,
  FaEnvelope,
  FaStar,
  FaSpinner,
  FaInfoCircle,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* -------------------------------------------------------------------------- */
/*                              CONFIG / CONSTANTS                             */
/* -------------------------------------------------------------------------- */

// API bases
const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:4000";
const FILE_BASE = API_BASE;

// Allowed select options
const ALLOWED = {
  qualification: ["Diploma", "BSc", "MSc", "PhD", "Other"],
  experience: ["0-1", "2-5", "6-10", "10+"],
  specialization: [
    "Software Engineering",
    "Data Science",
    "Information Technology",
    "Interactive Media",
    "Cyber Security",
  ],
};

// Regex
const LINKEDIN_RE =
  /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub|company)\/[A-Za-z0-9-._~%]+\/?$/i;

// Helpers
const formatDateTime = (d) => (d ? new Date(d).toLocaleString() : "-");
const statusPillTone = (s) =>
  s === "approved"
    ? "bg-emerald-600"
    : s === "denied"
    ? "bg-rose-600"
    : "bg-amber-500";
const safeCookie = (name) => {
  try {
    const v = `; ${document.cookie}`;
    const p = v.split(`; ${name}=`);
    return p.length === 2 ? p.pop().split(";").shift() : null;
  } catch {
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/*                                STATUS BANNER                                */
/* -------------------------------------------------------------------------- */

const StatusBanner = ({ approval }) => {
  if (!approval?.status) return null;
  const { status, requestedAt, decidedAt, reason } = approval;

  const base =
    "rounded-xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in";
  const tones = {
    pending: "bg-amber-500/10 text-amber-200",
    approved: "bg-emerald-600/10 text-emerald-200",
    denied: "bg-rose-600/10 text-rose-200",
  };

  return (
    <div className={`${base} ${tones[status] || tones.pending}`}>
      <div className="flex items-start sm:items-center gap-3">
        <FaInfoCircle className="shrink-0 mt-1 sm:mt-0 text-lg" />
        <div>
          <div className="font-bold capitalize text-lg">{status}</div>
          <div className="text-base font-bold opacity-90">
            <strong>Requested:</strong> {formatDateTime(requestedAt)}{" "}
            {decidedAt ? (
              <>
                • <strong>Decided:</strong> {formatDateTime(decidedAt)}
              </>
            ) : (
              ""
            )}
          </div>
          {status === "denied" && reason && (
            <div className="text-base font-bold mt-1">
              <strong>Reason:</strong>{" "}
              <span className="italic font-bold">{reason}</span>
            </div>
          )}
        </div>
      </div>
      {status !== "approved" && (
        <div className="text-base font-bold opacity-90 mt-2">
          Your expert features will unlock after approval.
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                              MAIN PAGE COMPONENT                            */
/* -------------------------------------------------------------------------- */

const ExpertProfilePage = () => {
  // Data
  const [expert, setExpert] = useState(null);
  const [approval, setApproval] = useState(null);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    title: "",
    organization: "",
    specialization: "",
    qualification: "",
    experience: "",
    bio: "",
    skills: [],
    linkedin: "",
    photo: null,
  });
  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState("");

  // Identity
  const expertEmail = safeCookie("email") || "expert@example.com";

  /* --------------------------------- Effects -------------------------------- */

  useEffect(() => {
    (async () => {
      await Promise.all([loadProfile(), loadApproval()]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------ Data Fetching ----------------------------- */

  const loadApproval = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/expertRoute/experts/${encodeURIComponent(
          expertEmail
        )}/status`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setApproval(data.approval || { status: "pending" });
    } catch (e) {
      console.error("Status fetch error:", e);
      toast.warn("Couldn’t load approval status.", {
        position: "top-center",
        autoClose: 2500,
        theme: "colored",
      });
    }
  };

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${API_BASE}/expertRoute/experts/${encodeURIComponent(expertEmail)}`
      );
      if (!res.ok)
        throw new Error(`HTTP ${res.status}: Failed to fetch profile`);
      const data = await res.json();

      setExpert(data);
      setForm({
        name: data.name || "",
        title: data.title || "",
        organization: data.organization || "",
        specialization: data.specialization || "",
        qualification: data.qualification || "",
        experience: data.experience || "",
        bio: data.bio || "",
        skills: Array.isArray(data.skills) ? data.skills : [],
        linkedin: data.linkedin || "",
        photo: null,
      });
      setErrors({});
    } catch (err) {
      console.error("Profile fetch error:", err);
      toast.error(err.message || "Failed to load profile.", {
        position: "top-center",
        autoClose: 4000,
        theme: "colored",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------- Handlers -------------------------------- */

  const onFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const onPhotoChange = (e) => {
    const f = e.target.files?.[0] || null;
    setForm((p) => ({ ...p, photo: f }));
    if (errors.photo) setErrors((p) => ({ ...p, photo: "" }));
  };

  const addSkill = () => {
    const s = (skillInput || "").trim();
    if (!s) return;

    if (s.length > 40) {
      toast.error("Skill must be 40 characters or fewer.");
      return;
    }
    if (form.skills.some((k) => k.toLowerCase() === s.toLowerCase())) {
      toast.error("Skill already added.");
      return;
    }
    setForm((p) => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput("");
    if (errors.skills) setErrors((p) => ({ ...p, skills: "" }));
  };

  const skillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (idx) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((_, i) => i !== idx) }));

  /* -------------------------------- Validation ------------------------------- */

  const validate = () => {
    const e = {};

    if (!form.name?.trim() || form.name.trim().length < 2)
      e.name = "Full name is required (min 2 characters).";

    if (
      !form.specialization ||
      !ALLOWED.specialization.includes(form.specialization)
    )
      e.specialization = "Please select a valid specialization.";

    if (
      !form.qualification ||
      !ALLOWED.qualification.includes(form.qualification)
    )
      e.qualification = "Please select a valid qualification.";

    if (!form.experience || !ALLOWED.experience.includes(form.experience))
      e.experience = "Please select valid years of experience.";

    if (!Array.isArray(form.skills) || form.skills.length < 1)
      e.skills = "Add at least one skill.";

    if (form.linkedin && !LINKEDIN_RE.test(form.linkedin))
      e.linkedin = "Please enter a valid LinkedIn URL.";

    if (form.bio && form.bio.trim().length < 20)
      e.bio = "Bio should be at least 20 characters.";

    if (form.bio && form.bio.length > 1000)
      e.bio = "Bio must be under 1000 characters.";

    if (form.photo) {
      const ok = ["image/jpeg", "image/png", "image/webp"];
      if (!ok.includes(form.photo.type))
        e.photo = "Photo must be JPG, PNG, or WEBP.";
      const maxMB = 5;
      if (form.photo.size > maxMB * 1024 * 1024)
        e.photo = `Photo must be ≤ ${maxMB}MB.`;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* --------------------------------- Submit --------------------------------- */

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("title", form.title);
      payload.append("organization", form.organization);
      payload.append("specialization", form.specialization);
      payload.append("qualification", form.qualification);
      payload.append("experience", form.experience);
      payload.append("bio", form.bio);
      if (form.linkedin) payload.append("linkedin", form.linkedin);
      if (form.photo) payload.append("photo", form.photo);
      form.skills.forEach((s) => payload.append("skills", s));

      const res = await fetch(
        `${API_BASE}/expertRoute/experts/${encodeURIComponent(expertEmail)}`,
        { method: "PUT", body: payload }
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `HTTP ${res.status}: Update failed`);
      }

      const updated = await res.json();
      setExpert(updated.expert);
      setIsEditing(false);
      toast.success("Profile updated successfully!", {
        position: "top-center",
        autoClose: 4000,
        theme: "colored",
      });
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message || "Failed to update profile.", {
        position: "top-center",
        autoClose: 4000,
        theme: "colored",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------------------------- UI ---------------------------------- */

  if (isLoading && !expert) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <FaSpinner className="animate-spin h-12 w-12 text-[#2DE2E6] mx-auto mb-4" />
          <p className="text-white/90">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center rounded-2xl p-6 bg-black/50 backdrop-blur animate-fade-in">
          <p className="text-red-400 mb-4">Failed to load profile</p>
          <button
            onClick={loadProfile}
            className="bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />

      {/* Header (transparent; rely on global background) */}
      <div className="p-8 bg-transparent animate-fade-in-up m-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] rounded-full mb-4 shadow-lg">
            <FaUser className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-center text-white bg-clip-text bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] drop-shadow">
            Expert Profile
          </h1>
          <p className="text-white/90 mt-4 text-lg">
            Manage your professional presence and connect with students.
          </p>
        </div>
      </div>

      {/* Content container (transparent page; subtle glass cards) */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        {/* Status */}
        <div className="mb-6 text-white">
          <StatusBanner approval={approval} />
        </div>

        {/* View mode */}
        {!isEditing ? (
          <div className="rounded-2xl shadow-2xl overflow-hidden bg-black/50 backdrop-blur animate-fade-in">
            {/* Profile Header */}
            <div className="p-8 border-b border-white/10">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="relative">
                  {expert.photo ? (
                    <img
                      src={`${FILE_BASE}${
                        expert.photo.startsWith("/") ? "" : "/"
                      }${expert.photo}`}
                      alt="Profile"
                      className="h-28 w-28 rounded-full object-cover shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='h-16 w-16 text-[#2DE2E6]' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clip-rule='evenodd'/%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="h-28 w-28 rounded-full bg-white/10 flex items-center justify-center shadow-lg">
                      <FaUser className="h-12 w-12 text-[#2DE2E6]" />
                    </div>
                  )}
                  {approval?.status && (
                    <span
                      className={`absolute -bottom-2 -right-2 text-xs text-white px-2 py-1 rounded-full ${statusPillTone(
                        approval.status
                      )}`}
                      title={`Status: ${approval.status}`}
                    >
                      {approval.status}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {expert.name || "N/A"}
                  </h2>
                  <p className="text-[#86f3f5] text-xl font-medium mb-4">
                    {expert.title || "No title provided"}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {expert.specialization && (
                      <span className="bg-[#2DE2E6]/15 text-[#2DE2E6] px-4 py-1.5 rounded-full text-sm font-medium">
                        {expert.specialization}
                      </span>
                    )}
                    {expert.qualification && (
                      <span className="bg-[#FF6EC7]/15 text-[#FF6EC7] px-4 py-1.5 rounded-full text-sm font-medium">
                        {expert.qualification}
                      </span>
                    )}
                    {expert.experience && (
                      <span className="bg-white/10 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                        {expert.experience} years experience
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="p-6 rounded-2xl bg-white/5 shadow-lg animate-fade-in-up">
                  <h4 className="text-[#2DE2E6] font-semibold mb-4 flex items-center gap-2 text-lg">
                    <FaEnvelope /> Contact Information
                  </h4>
                  <div className="space-y-3 text-gray-200">
                    <p>
                      <span className="text-[#86f3f5] font-medium">Email:</span>{" "}
                      {expert.email || "N/A"}
                    </p>
                    <p>
                      <span className="text-[#86f3f5] font-medium">
                        Organization:
                      </span>{" "}
                      {expert.organization || "Not specified"}
                    </p>
                    {expert.linkedin && (
                      <div className="mt-3">
                        <a
                          href={expert.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#FF6EC7] hover:text-[#e55db2] hover:underline transition-colors cursor-pointer"
                        >
                          <FaLinkedin className="h-5 w-5" />
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Details */}
                <div className="p-6 rounded-2xl bg-white/5 shadow-lg animate-fade-in-up">
                  <h4 className="text-[#2DE2E6] font-semibold mb-4 flex items-center gap-2 text-lg">
                    <FaBriefcase /> Professional Details
                  </h4>
                  <div className="space-y-3 text-gray-200">
                    <p>
                      <span className="text-[#86f3f5] font-medium">
                        Qualification:
                      </span>{" "}
                      {expert.qualification || "Not specified"}
                    </p>
                    <p>
                      <span className="text-[#86f3f5] font-medium">
                        Experience:
                      </span>{" "}
                      {expert.experience || "Not specified"} years
                    </p>
                    <p>
                      <span className="text-[#86f3f5] font-medium">
                        Specialization:
                      </span>{" "}
                      {expert.specialization || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {expert.bio && (
                <div className="p-6 rounded-2xl bg-white/5 shadow-lg animate-fade-in-up">
                  <h4 className="text-[#2DE2E6] font-semibold mb-4 flex items-center gap-2 text-lg">
                    <FaGraduationCap /> Professional Bio
                  </h4>
                  <p className="text-gray-200 italic">"{expert.bio}"</p>
                </div>
              )}

              {/* Skills */}
              {expert.skills?.length > 0 && (
                <div className="p-6 rounded-2xl bg-white/5 shadow-lg animate-fade-in-up">
                  <h4 className="text-[#2DE2E6] font-semibold mb-4 flex items-center gap-2 text-lg">
                    <FaStar /> Skills &amp; Expertise
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {expert.skills.map((skill, idx) => (
                      <span
                        key={`${skill}-${idx}`}
                        className="bg-gradient-to-r from-[#2DE2E6]/20 to-[#FF6EC7]/20 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 py-3 px-6 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] shadow-lg cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <FaEdit className="h-5 w-5" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Edit form */
          <form
            onSubmit={onSubmit}
            className="rounded-2xl shadow-2xl overflow-hidden p-8 bg-black/50 backdrop-blur animate-fade-in"
            noValidate
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="p-6 rounded-2xl bg-white/5 shadow-lg">
                  <h3 className="text-xl font-semibold text-[#2DE2E6] mb-4 flex items-center gap-2">
                    <FaUser /> Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={onFieldChange}
                        className={`w-full px-4 py-3 rounded-xl bg-white/10 text-white focus:ring-2 focus:ring-[#2DE2E6] outline-none ${
                          errors.name ? "ring-2 ring-red-500" : ""
                        }`}
                        required
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-400">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Role / Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={onFieldChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 text-white focus:ring-2 focus:ring-[#2DE2E6] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Organization
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={form.organization}
                        onChange={onFieldChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 text-white focus:ring-2 focus:ring-[#2DE2E6] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic & Professional */}
                <div className="p-6 rounded-2xl bg-white/5 shadow-lg">
                  <h3 className="text-xl font-semibold text-[#2DE2E6] mb-4 flex items-center gap-2">
                    <FaGraduationCap /> Academic &amp; Professional Background
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Highest Qualification *
                      </label>
                      <select
                        name="qualification"
                        value={form.qualification}
                        onChange={onFieldChange}
                        className={`w-full px-4 py-3 rounded-xl bg-white/10 text-white focus:ring-2 focus:ring-[#2DE2E6] outline-none ${
                          errors.qualification ? "ring-2 ring-red-500" : ""
                        }`}
                        required
                      >
                        <option value="">Select Qualification</option>
                        {ALLOWED.qualification.map((q) => (
                          <option key={q} value={q} className="bg-[#0b0d14]">
                            {q}
                          </option>
                        ))}
                      </select>
                      {errors.qualification && (
                        <p className="mt-2 text-sm text-red-400">
                          {errors.qualification}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Years of Experience *
                      </label>
                      <select
                        name="experience"
                        value={form.experience}
                        onChange={onFieldChange}
                        className={`w-full px-4 py-3 rounded-xl bg-white/10 text-white focus:ring-2 focus:ring-[#2DE2E6] outline-none ${
                          errors.experience ? "ring-2 ring-red-500" : ""
                        }`}
                        required
                      >
                        <option value="">Select Years of Experience</option>
                        {ALLOWED.experience.map((x) => (
                          <option key={x} value={x} className="bg-[#0b0d14]">
                            {x}
                          </option>
                        ))}
                      </select>
                      {errors.experience && (
                        <p className="mt-2 text-sm text-red-400">
                          {errors.experience}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Field of Specialization *
                      </label>
                      <select
                        name="specialization"
                        value={form.specialization}
                        onChange={onFieldChange}
                        className={`w-full px-4 py-3 rounded-xl bg-white/10 text-white focus:ring-2 focus:ring-[#2DE2E6] outline-none ${
                          errors.specialization ? "ring-2 ring-red-500" : ""
                        }`}
                        required
                      >
                        <option value="">Select Specialization</option>
                        {ALLOWED.specialization.map((s) => (
                          <option key={s} value={s} className="bg-[#0b0d14]">
                            {s}
                          </option>
                        ))}
                      </select>
                      {errors.specialization && (
                        <p className="mt-2 text-sm text-red-400">
                          {errors.specialization}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Short Bio {form.bio ? "" : "(min 20 chars)"}
                      </label>
                      <textarea
                        name="bio"
                        value={form.bio}
                        onChange={onFieldChange}
                        rows={3}
                        className={`w-full px-4 py-3 rounded-xl bg-white/10 text-white focus:ring-2 focus:ring-[#2DE2E6] outline-none ${
                          errors.bio ? "ring-2 ring-red-500" : ""
                        }`}
                        placeholder="Tell us about your professional journey..."
                      />
                      {errors.bio && (
                        <p className="mt-2 text-sm text-red-400">
                          {errors.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Skills */}
                <div className="p-6 rounded-2xl bg-white/5 shadow-lg">
                  <h3 className="text-xl font-semibold text-[#2DE2E6] mb-4 flex items-center gap-2">
                    <FaStar /> Skills *
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={skillKeyDown}
                        placeholder="Add a skill and press Enter"
                        className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white focus:ring-2 focus:ring-[#2DE2E6] outline-none"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 px-4 py-3 rounded-xl hover:opacity-90 transition-all font-medium cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                    {errors.skills && (
                      <p className="mt-2 text-sm text-red-400">
                        {errors.skills}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {form.skills.map((skill, i) => (
                        <span
                          key={`${skill}-${i}`}
                          className="bg-gradient-to-r from-[#2DE2E6]/20 to-[#FF6EC7]/20 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(i)}
                            className="text-[#FF6EC7] hover:text-[#2DE2E6] transition-colors cursor-pointer"
                            aria-label={`Remove ${skill}`}
                          >
                            <FaTimes className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-6 rounded-2xl bg-white/5 shadow-lg">
                  <h3 className="text-xl font-semibold text-[#2DE2E6] mb-4 flex items-center gap-2">
                    <FaEnvelope /> Contact Info
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Professional Email
                      </label>
                      <input
                        type="email"
                        value={expert.email || ""}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 text-gray-400 cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        value={form.linkedin}
                        onChange={onFieldChange}
                        className={`w-full px-4 py-3 rounded-xl bg-white/10 text-white focus:ring-2 focus:ring-[#2DE2E6] outline-none ${
                          errors.linkedin ? "ring-2 ring-red-500" : ""
                        }`}
                        placeholder="https://linkedin.com/in/username"
                      />
                      {errors.linkedin && (
                        <p className="mt-2 text-sm text-red-400">
                          {errors.linkedin}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Picture */}
                <div className="p-6 rounded-2xl bg-white/5 shadow-lg">
                  <h3 className="text-xl font-semibold text-[#2DE2E6] mb-4 flex items-center gap-2">
                    <FaUser /> Profile Picture
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {form.photo ? (
                        <img
                          src={URL.createObjectURL(form.photo)}
                          alt="Preview"
                          className="h-20 w-20 rounded-full object-cover shadow-md"
                        />
                      ) : expert.photo ? (
                        <img
                          src={`${FILE_BASE}${
                            expert.photo.startsWith("/") ? "" : "/"
                          }${expert.photo}`}
                          alt="Profile"
                          className="h-20 w-20 rounded-full object-cover shadow-md"
                          onError={(e) => {
                            e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='h-16 w-16 text-[#2DE2E6]' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clip-rule='evenodd'/%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center shadow-md">
                          <FaUser className="h-10 w-10 text-[#2DE2E6]" />
                        </div>
                      )}
                    </div>
                    <label className="block flex-1 cursor-pointer">
                      <span className="sr-only">Choose profile photo</span>
                      <input
                        type="file"
                        onChange={onPhotoChange}
                        accept="image/png,image/jpeg,image/webp"
                        className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-[#2DE2E6] hover:file:bg-white/20 transition-colors cursor-pointer"
                      />
                      {errors.photo && (
                        <p className="mt-2 text-sm text-red-400">
                          {errors.photo}
                        </p>
                      )}
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex gap-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-gray-900 transition duration-200 shadow-lg inline-flex items-center justify-center gap-2 cursor-pointer ${
                      isSaving
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] hover:opacity-90"
                    }`}
                  >
                    {isSaving ? (
                      <FaSpinner className="animate-spin h-5 w-5" />
                    ) : (
                      <FaSave className="h-5 w-5" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Animations (from SkillForm) */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px) } 100% { opacity: 1; transform: translateY(0) } }
        .animate-fade-in { animation: fade-in .5s ease-out both }
        .animate-fade-in-up { animation: fade-in-up .55s cubic-bezier(.2,.65,.2,1) both }
      `}</style>
    </>
  );
};

export default ExpertProfilePage;
