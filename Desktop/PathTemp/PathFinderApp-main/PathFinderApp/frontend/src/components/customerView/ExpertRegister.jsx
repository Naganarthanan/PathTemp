import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import auth, { db } from "../../services/firebaseAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * ExpertRegister
 * - Registers an expert with Firebase Auth (role saved to Firestore)
 * - Sends richer expert profile to your Node/Mongo backend (multipart form)
 * - Strong client-side validation incl. LinkedIn URL and photo constraints
 * - Minimal borders/outlines, cursor-pointer on interactive elements
 * - Includes simple fade-in animations
 */
export default function ExpertRegister() {
  const navigate = useNavigate();

  // -------------------- Form State --------------------
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    organization: "",
    specialization: "",
    qualification: "",
    experience: "",
    bio: "",
    skills: [],
    email: "",
    password: "",
    confirmPassword: "",
    linkedin: "",
    photo: null,
  });

  const [currentSkill, setCurrentSkill] = useState("");
  const [errors, setErrors] = useState({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -------------------- Validation Rules --------------------
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
  // Allow only: (optional http/https) + www.linkedin.com/in/<handle> (e.g., www.linkedin.com/in/msarvi19)
  const LINKEDIN_RE =
    /^(https?:\/\/)?www\.linkedin\.com\/in\/[A-Za-z0-9\-._%]{3,100}\/?$/;

  const notify = (message, type = "error") =>
    toast[type](message, {
      position: "top-center",
      autoClose: 4000,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });

  // -------------------- Handlers --------------------
  const onFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((p) => ({ ...p, photo: file }));
    if (errors.photo) setErrors((p) => ({ ...p, photo: "" }));
  };

  const addSkill = () => {
    const skill = currentSkill.trim();
    if (!skill) return;

    // Basic skill validation: 2–30 chars, unique (case-insensitive)
    if (skill.length < 2)
      return setErrors((p) => ({ ...p, skills: "Skill is too short." }));
    if (skill.length > 30)
      return setErrors((p) => ({ ...p, skills: "Skill is too long." }));
    if (formData.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      return setErrors((p) => ({ ...p, skills: "Skill already added." }));
    }

    setFormData((p) => ({ ...p, skills: [...p.skills, skill] }));
    setCurrentSkill("");
    if (errors.skills) setErrors((p) => ({ ...p, skills: "" }));
  };

  const onSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (index) => {
    setFormData((p) => ({
      ...p,
      skills: p.skills.filter((_, i) => i !== index),
    }));
  };

  // -------------------- Validation --------------------
  const validate = () => {
    const v = {};

    // Required fields
    if (!formData.name.trim()) v.name = "Full name is required.";
    if (!formData.specialization)
      v.specialization = "Please select a specialization.";
    if (!formData.qualification)
      v.qualification = "Please select your highest qualification.";
    if (!formData.experience)
      v.experience = "Please select your years of experience.";
    if (!formData.email.trim()) v.email = "Email is required.";
    if (!formData.password) v.password = "Password is required.";
    if (!formData.confirmPassword)
      v.confirmPassword = "Please confirm your password.";
    if (formData.skills.length === 0) v.skills = "Add at least one skill.";

    // Formats & lengths
    if (formData.name && formData.name.trim().length < 3)
      v.name = "Name must be at least 3 characters.";
    if (formData.title && formData.title.length > 80)
      v.title = "Title is too long.";
    if (formData.organization && formData.organization.length > 120)
      v.organization = "Organization is too long.";

    if (formData.email && !EMAIL_RE.test(formData.email))
      v.email = "Please enter a valid email address.";

    if (formData.password && !PASSWORD_RE.test(formData.password))
      v.password =
        "Password must include uppercase, lowercase, number & special character (min 8).";

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    )
      v.confirmPassword = "Passwords do not match.";

    if (formData.linkedin && !LINKEDIN_RE.test(formData.linkedin))
      v.linkedin = "LinkedIn must look like: www.linkedin.com/in/your-handle";

    if (formData.bio && formData.bio.trim().length < 20)
      v.bio = "Bio should be at least 20 characters.";

    // Photo constraints (type & <= 5MB)
    if (formData.photo) {
      const okTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!okTypes.includes(formData.photo.type))
        v.photo = "Photo must be JPG, PNG, or WEBP.";
      const maxMB = 5;
      if (formData.photo.size > maxMB * 1024 * 1024)
        v.photo = `Photo must be ≤ ${maxMB}MB.`;
    }

    setErrors(v);
    return Object.keys(v).length === 0;
  };

  // -------------------- Submit --------------------
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // 1) Create account in Firebase Auth
      const cred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = cred.user;

      // 2) Save minimal role to Firestore
      try {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "expert",
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        throw new Error(
          `FIRESTORE_${err?.code || "WRITE_FAILED"}: Could not save role.`
        );
      }

      // 3) Send full profile to Mongo backend (omit password fields)
      const payload = new FormData();
      payload.append("firebaseUid", user.uid);
      payload.append("name", formData.name);
      payload.append("title", formData.title);
      payload.append("organization", formData.organization);
      payload.append("specialization", formData.specialization);
      payload.append("qualification", formData.qualification);
      payload.append("experience", formData.experience);
      payload.append("bio", formData.bio);
      payload.append("email", formData.email);
      if (formData.linkedin) payload.append("linkedin", formData.linkedin);
      if (formData.photo) payload.append("photo", formData.photo);
      formData.skills.forEach((s) => payload.append("skills", s));

      const res = await fetch(
        "http://localhost:4000/expertRoute/uploadDetail",
        {
          method: "POST",
          body: payload,
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data?.message ||
            "Profile save failed. Your account was created — please try saving your profile again."
        );
      }

      // 4) Session helpers + redirect
      document.cookie = `email=${user.email}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem("userEmail", user.email);

      notify(
        "Registration successful! Waiting for admin approval...",
        "success"
      );
      setTimeout(() => navigate("/login"), 1600);
    } catch (err) {
      const fbMap = {
        "auth/email-already-in-use": "This email is already in use.",
        "auth/weak-password":
          "Password must include uppercase, lowercase, number & special character (min 8).",
        "auth/invalid-email": "Email address is invalid.",
        "auth/network-request-failed":
          "Network issue. Check your connection and try again.",
      };
      const message =
        fbMap[err?.code] ||
        (typeof err?.message === "string" &&
        err.message.startsWith("FIRESTORE_")
          ? "Could not save your role/profile in Firestore. Please try again."
          : err?.message || "Registration failed. Please try again.");
      notify(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------- UI Helpers --------------------
  const ErrorText = ({ msg }) =>
    msg ? <p className="mt-1 text-sm text-red-400">{msg}</p> : null;

  // -------------------- UI --------------------
  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex flex-col animate-fade-in">
        <main className="flex-grow flex items-center justify-center py-8 px-4">
          {/* Card */}
          <div className="w-full max-w-4xl bg-[#1D1E2C]/95 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="p-6 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-[#2DE2E6] tracking-tight">
                Expert Registration
              </h1>
              <p className="text-[#2DE2E6]/80 text-sm md:text-base mt-2">
                Join our network and share your expertise
              </p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-8">
              {/* Basic Information */}
              <section className="bg-[#151622]/70 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-[#2DE2E6] mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#cdeff0] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={onFieldChange}
                      className={`w-full px-4 py-2 rounded-lg bg-[#24263a] text-white focus:outline-none focus:ring-0 ${
                        errors.name ? "ring-2 ring-red-500" : ""
                      }`}
                      required
                      autoComplete="name"
                    />
                    <ErrorText msg={errors.name} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#cdeff0] mb-1">
                      Current Role / Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={onFieldChange}
                      className="w-full px-4 py-2 rounded-lg bg-[#24263a] text-white focus:outline-none focus:ring-0"
                      autoComplete="organization-title"
                    />
                    <ErrorText msg={errors.title} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#cdeff0] mb-1">
                      Organization / University
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={onFieldChange}
                      className="w-full px-4 py-2 rounded-lg bg-[#24263a] text-white focus:outline-none focus:ring-0"
                      autoComplete="organization"
                    />
                    <ErrorText msg={errors.organization} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#cdeff0] mb-1">
                      Field of Specialization *
                    </label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={onFieldChange}
                      className={`w-full px-4 py-2 rounded-lg bg-[#24263a] text-white focus:outline-none focus:ring-0 ${
                        errors.specialization ? "ring-2 ring-red-500" : ""
                      }`}
                      required
                    >
                      <option value="">Select Specialization</option>
                      <option value="Software Engineering">
                        Software Engineering
                      </option>
                      <option value="Data Science">Data Science</option>
                      <option value="Information Technology">
                        Information Technology
                      </option>
                      <option value="Interactive Media">
                        Interactive Media
                      </option>
                      <option value="Cyber Security">Cyber Security</option>
                    </select>
                    <ErrorText msg={errors.specialization} />
                  </div>
                </div>
              </section>

              {/* Academic & Professional */}
              <section className="bg-[#151622]/70 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-[#2DE2E6] mb-4">
                  Academic & Professional Background
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#cdeff0] mb-1">
                      Highest Qualification *
                    </label>
                    <select
                      name="qualification"
                      value={formData.qualification}
                      onChange={onFieldChange}
                      className={`w-full px-4 py-2 rounded-lg bg-[#24263a] text-white focus:outline-none focus:ring-0 ${
                        errors.qualification ? "ring-2 ring-red-500" : ""
                      }`}
                      required
                    >
                      <option value="">Select Qualification</option>
                      <option value="Diploma">Diploma</option>
                      <option value="BSc">BSc</option>
                      <option value="MSc">MSc</option>
                      <option value="PhD">PhD</option>
                      <option value="Other">Other</option>
                    </select>
                    <ErrorText msg={errors.qualification} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#cdeff0] mb-1">
                      Years of Experience *
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={onFieldChange}
                      className={`w-full px-4 py-2 rounded-lg bg-[#24263a] text-white focus:outline-none focus:ring-0 ${
                        errors.experience ? "ring-2 ring-red-500" : ""
                      }`}
                      required
                    >
                      <option value="">Select Years of Experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                    <ErrorText msg={errors.experience} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#cdeff0] mb-1">
                    Short Bio {formData.bio ? "" : "(min 20 chars)"}
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={onFieldChange}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg bg-[#24263a] text-white focus:outline-none focus:ring-0 ${
                      errors.bio ? "ring-2 ring-red-500" : ""
                    }`}
                    placeholder="Tell us about your professional journey..."
                  />
                  <ErrorText msg={errors.bio} />
                </div>
              </section>

              {/* Skills */}
              <section className="bg-[#151622]/70 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-[#2DE2E6] mb-4">
                  Skills *
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyDown={onSkillKeyDown}
                    placeholder="Add a skill and press Enter"
                    className={`flex-1 px-4 py-2 rounded-lg bg-[#24263a] text-white focus:outline-none focus:ring-0 ${
                      errors.skills ? "ring-2 ring-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="bg-[#2DE2E6] text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <ErrorText msg={errors.skills} />
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.map((skill, i) => (
                    <span
                      key={`${skill}-${i}`}
                      className="bg-[#24263a] text-gray-200 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(i)}
                        className="text-[#FF6EC7] hover:text-[#2DE2E6] cursor-pointer"
                        aria-label={`Remove ${skill}`}
                        title="Remove"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </section>

              {/* Contact Info */}
              <section className="bg-[#151622]/70 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-[#2DE2E6] mb-4">
                  Contact Info
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#cdeff0] mb-1">
                      Professional Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={onFieldChange}
                      className={`w-full px-4 py-2 rounded-lg bg-[#24263a] text-white focus:outline-none focus:ring-0 ${
                        errors.email ? "ring-2 ring-red-500" : ""
                      }`}
                      required
                      autoComplete="email"
                    />
                    <ErrorText msg={errors.email} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#cdeff0] mb-1">
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={onFieldChange}
                      className={`w-full px-4 py-2 rounded-lg bg-[#24263a] text-white focus:outline-none focus:ring-0 ${
                        errors.linkedin ? "ring-2 ring-red-500" : ""
                      }`}
                      placeholder="www.linkedin.com/in/your-handle"
                      autoComplete="url"
                    />
                    <ErrorText msg={errors.linkedin} />
                  </div>
                </div>
              </section>

              {/* Account Security */}
              <section className="bg-[#151622]/70 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-[#2DE2E6] mb-4">
                  Account Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#cdeff0] mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={onFieldChange}
                        className={`w-full px-4 py-2 rounded-lg bg-[#24263a] text-white pr-10 focus:outline-none focus:ring-0 ${
                          errors.password ? "ring-2 ring-red-500" : ""
                        }`}
                        required
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible((s) => !s)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        aria-label="Toggle password visibility"
                        title="Toggle password visibility"
                      >
                        {isPasswordVisible ? (
                          <svg
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                              clipRule="evenodd"
                            />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-[#86f3f5] mt-2">
                      Must include uppercase, lowercase, number & special
                      character (min 8 chars)
                    </p>
                    <ErrorText msg={errors.password} />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#cdeff0] mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={isConfirmVisible ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={onFieldChange}
                        className={`w-full px-4 py-2 rounded-lg bg-[#24263a] text-white pr-10 focus:outline-none focus:ring-0 ${
                          errors.confirmPassword ? "ring-2 ring-red-500" : ""
                        }`}
                        required
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setIsConfirmVisible((s) => !s)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        aria-label="Toggle confirm password visibility"
                        title="Toggle confirm password visibility"
                      >
                        {isConfirmVisible ? (
                          <svg
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                              clipRule="evenodd"
                            />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <ErrorText msg={errors.confirmPassword} />
                  </div>
                </div>
              </section>

              {/* Profile Picture */}
              <section className="bg-[#151622]/70 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-[#2DE2E6] mb-4">
                  Profile Picture
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {formData.photo ? (
                      <img
                        src={URL.createObjectURL(formData.photo)}
                        alt="Preview"
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-[#24263a] flex items-center justify-center">
                        <svg
                          className="h-8 w-8 text-gray-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="sr-only">Choose profile photo</span>
                    <input
                      type="file"
                      onChange={onFileChange}
                      accept="image/png,image/jpeg,image/webp"
                      className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#24263a] file:text-[#2DE2E6] hover:file:bg-[#30324a] cursor-pointer"
                    />
                    <ErrorText msg={errors.photo} />
                  </label>
                </div>
              </section>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 shadow-lg ${
                    isSubmitting
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] hover:from-[#25c8cc] hover:to-[#e55db2] cursor-pointer"
                  }`}
                >
                  {isSubmitting ? "Processing..." : "Register as Expert"}
                </button>

                {/* Divider & Login */}
                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-[#2DE2E6]/30" />
                  </div>
                  <div className="relative flex flex-col items-center gap-2 text-sm">
                    <span className="px-2 text-[#2DE2E6]">
                      Already have an account?
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-[#FF6EC7] font-medium hover:text-[#e55ab0] hover:underline focus:outline-none cursor-pointer"
                    >
                      Sign in to your account
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#86f3f5] text-center pb-2">
                  By registering, you agree to our{" "}
                  <a
                    href="#"
                    className="text-[#FF6EC7] hover:underline cursor-pointer"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-[#FF6EC7] hover:underline cursor-pointer"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Minimal animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px) }
          100% { opacity: 1; transform: translateY(0) }
        }
        .animate-fade-in { animation: fade-in .5s ease-out both }
        .animate-fade-in-up { animation: fade-in-up .55s cubic-bezier(.2,.65,.2,1) both }
      `}</style>
    </>
  );
}
