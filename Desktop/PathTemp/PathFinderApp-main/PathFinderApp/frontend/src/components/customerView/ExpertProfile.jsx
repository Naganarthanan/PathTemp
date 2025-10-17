import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import {
  Search as IconSearch,
  X as IconX,
  Clock,
  GraduationCap,
  Linkedin,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                  Utilities                                 */
/* -------------------------------------------------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:4000";
const FILE_BASE = API_BASE;

const getCookie = (key) =>
  document.cookie
    .split("; ")
    .map((row) => row.split("="))
    .find(([k]) => k === key)?.[1] || "";

/* -------------------------------------------------------------------------- */
/*                                ExpertProfile                               */
/* -------------------------------------------------------------------------- */

export default function ExpertProfile() {
  const [experts, setExperts] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeExpert, setActiveExpert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  /* --------------------------- Fetch experts on load --------------------------- */
  useEffect(() => {
    const specializationFromUrl = searchParams.get("specialization");
    setSelectedSpecialization(specializationFromUrl || "All");

    const controller = new AbortController();

    (async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const res = await fetch("http://localhost:4000/expertRoute/getDetail", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const normalized = Array.isArray(data)
          ? data.map((e, idx) => ({
              _id: e?._id || e?.email || `exp_${idx}`,
              name: String(e?.name || "Unknown").trim(),
              title: String(e?.title || "").trim(),
              organization: String(e?.organization || "").trim(),
              specialization: String(e?.specialization || "General").trim(),
              qualification: String(e?.qualification || "").trim(),
              experience: Number.isFinite(Number(e?.experience))
                ? Math.max(0, Number(e.experience))
                : 0,
              email: String(e?.email || "").trim(),
              linkedin: String(e?.linkedin || "").trim(),
              bio: String(e?.bio || "").trim(),
              skills: Array.isArray(e?.skills)
                ? e.skills.map((s) => String(s || "").trim()).filter(Boolean)
                : [],
              photo: String(e?.photo || "").trim(),
            }))
          : [];

        setExperts(normalized);
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error(err);
          setLoadError("Failed to load experts. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [searchParams]);

  /* ---------------------------- Build specialization list ---------------------------- */
  const specializationOptions = useMemo(() => {
    const specSet = new Set(
      experts
        .map((e) => e.specialization)
        .filter((s) => typeof s === "string" && s.trim() !== "")
    );
    return ["All", ...Array.from(specSet).sort((a, b) => a.localeCompare(b))];
  }, [experts]);

  /* ---------------------------------- Filters ---------------------------------- */
  const filteredExperts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return experts.filter((e) => {
      const specOk =
        selectedSpecialization === "All" ||
        e.specialization === selectedSpecialization;

      if (!q) return specOk;

      const nameOk = e.name.toLowerCase().includes(q);
      const skillsOk = (e.skills || []).some((s) =>
        String(s).toLowerCase().includes(q)
      );

      return specOk && (nameOk || skillsOk);
    });
  }, [experts, searchQuery, selectedSpecialization]);

  /* --------------------------------- Handlers --------------------------------- */
  const openModal = (expert) => {
    setActiveExpert(expert);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveExpert(null);
    setIsSendingRequest(false);
  };

  const changeSpecialization = (value) => {
    setSelectedSpecialization(value);
    const next = new URLSearchParams(searchParams.toString());
    if (value === "All") next.delete("specialization");
    else next.set("specialization", value);
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSelectedSpecialization("All");
    setSearchQuery("");
    const next = new URLSearchParams(searchParams.toString());
    next.delete("specialization");
    setSearchParams(next);
  };

  /* --------------------------- Meeting request flow --------------------------- */
  const requestMeeting = async () => {
    if (!activeExpert) return;

    const confirm = await Swal.fire({
      title: `Request meeting with ${activeExpert.name}?`,
      text: "Do you want to send a meeting request to this expert?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, request it!",
      cancelButtonText: "Cancel",
      background: "#0b0d14",
      color: "#E5E7EB",
      iconColor: "#2DE2E6",
      customClass: {
        popup: "rounded-2xl p-6 backdrop-blur-md bg-black/60 shadow-xl", // no borders
        confirmButton:
          "cursor-pointer bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 hover:opacity-90 rounded-lg px-4 py-2",
        cancelButton:
          "cursor-pointer bg-white/10 text-white hover:bg-white/20 rounded-lg px-4 py-2 ml-2",
      },
    });

    if (!confirm.isConfirmed) return;

    setIsSendingRequest(true);
    try {
      const cookieEmail = getCookie("email");
      const studentEmail = EMAIL_RE.test(cookieEmail)
        ? cookieEmail
        : "student@example.com";

      const payload = {
        studentEmail,
        expertId: activeExpert._id,
        expertName: activeExpert.name,
        expertEmail: activeExpert.email,
        specialization: activeExpert.specialization,
        status: "pending",
        requestedAt: new Date().toISOString(),
        meetingDateTime: null,
      };

      const res = await fetch(
        "http://localhost:4000/expertRoute/meetingRequests",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to send meeting request");

      toast.success("Meeting request sent successfully!");
      await Swal.fire({
        icon: "success",
        title: "Request Sent",
        text: `Your meeting request to ${activeExpert.name} has been sent!`,
        confirmButtonText: "OK",
        background: "#0b0d14",
        color: "#E5E7EB",
        iconColor: "#2DE2E6",
        customClass: {
          popup: "rounded-2xl p-6 backdrop-blur-md bg-black/60 shadow-xl",
          confirmButton:
            "cursor-pointer bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 hover:opacity-90 rounded-lg px-4 py-2",
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to send meeting request. Please try again.");
    } finally {
      setIsSendingRequest(false);
    }
  };

  /* ---------------------------------- Render ---------------------------------- */
  return (
    <>
      <Toaster position="top-center" />

      {/* Header */}
      <div className="p-8 bg-transparent animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-center text-white neon-glow bg-clip-text bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] drop-shadow">
          Meet Our Experts
        </h1>
        <p className="text-center text-white neon-glow mt-4 text-lg drop-shadow">
          Connect with industry professionals and academic experts to guide your
          academic journey.
        </p>

        {selectedSpecialization !== "All" && (
          <div className="mt-4 w-fit mx-auto inline-flex items-center bg-[#2DE2E6]/15 text-[#2DE2E6] px-4 py-2 rounded-full animate-fade-in-up">
            <span className="text-sm">
              Showing experts in:{" "}
              <strong className="text-[#2DE2E6]">
                {selectedSpecialization}
              </strong>
            </span>
            <button
              onClick={clearAllFilters}
              className="ml-2 text-[#FF6EC7] hover:text-[#2DE2E6] inline-flex cursor-pointer"
              aria-label="Clear specialization filter"
              type="button"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="p-8 space-y-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl p-6 bg-black/60 backdrop-blur shadow-xl">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="w-full md:w-1/2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconSearch className="h-5 w-5 text-gray-300" />
                  </div>
                  <input
                    type="text"
                    inputMode="search"
                    aria-label="Search experts by name or skills"
                    placeholder="Search experts by name or skills..."
                    className="pl-10 pr-4 py-3 w-full rounded-lg bg-white/15 text-white placeholder:text-gray-200 focus:ring-2 focus:ring-[#2DE2E6]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Specialization */}
              <div className="w-full md:w-1/3">
                <select
                  aria-label="Filter by specialization"
                  className="w-full px-4 py-3 rounded-lg bg-white/15 text-white focus:ring-2 focus:ring-[#2DE2E6] cursor-pointer"
                  value={selectedSpecialization}
                  onChange={(e) => changeSpecialization(e.target.value)}
                >
                  {specializationOptions.map((spec) => (
                    <option key={spec} value={spec} className="bg-[#0b0d14]">
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading / Error */}
          {isLoading && (
            <div className="text-center py-12 rounded-2xl bg-black/60 backdrop-blur mt-8 animate-fade-in-up shadow-xl">
              <p className="text-white/90">Loading experts…</p>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="text-center py-12 rounded-2xl bg-black/60 backdrop-blur mt-8 animate-fade-in-up shadow-xl">
              <p className="text-red-300">{loadError}</p>
            </div>
          )}

          {/* Content */}
          {!isLoading && !loadError && (
            <>
              {/* Count + Clear */}
              <div className="mb-6 flex justify-between items-center text-white/90">
                <p>
                  Showing{" "}
                  <span className="font-semibold text-[#2DE2E6]">
                    {filteredExperts.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#2DE2E6]">
                    {experts.length}
                  </span>{" "}
                  experts
                  {selectedSpecialization !== "All" && (
                    <span className="ml-2 text-gray-300">
                      in {selectedSpecialization}
                    </span>
                  )}
                </p>

                {(selectedSpecialization !== "All" || searchQuery) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[#FF6EC7] hover:text-[#2DE2E6] text-sm font-medium flex items-center cursor-pointer"
                    type="button"
                  >
                    Clear filters
                    <IconX className="h-4 w-4 ml-1" />
                  </button>
                )}
              </div>

              {/* Grid / Empty */}
              {filteredExperts.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-black/60 backdrop-blur animate-fade-in-up shadow-xl">
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    No experts found
                  </h3>
                  <p className="mt-1 text-white/80">
                    {selectedSpecialization !== "All"
                      ? `No ${selectedSpecialization} experts found. Try a different specialization.`
                      : "Try adjusting your search or filter criteria."}
                  </p>
                  {(selectedSpecialization !== "All" || searchQuery) && (
                    <button
                      onClick={clearAllFilters}
                      className="mt-4 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 cursor-pointer"
                      type="button"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                  {filteredExperts.map((ex) => {
                    const hasPhoto = Boolean(ex.photo);
                    const photoSrc = hasPhoto
                      ? (ex.photo.startsWith("http")
                          ? ex.photo
                          : `http://localhost:4000/${ex.photo}`
                        ).replace(/([^:]\/)\/+/g, "$1")
                      : "";

                    const hasLinkedIn =
                      ex.linkedin && /^(https?:)\/\//i.test(ex.linkedin.trim());

                    return (
                      <div
                        key={ex._id}
                        className="rounded-2xl overflow-hidden bg-black/60 backdrop-blur transition-all duration-300 hover:ring-2 hover:ring-[#2DE2E6] shadow-xl"
                      >
                        <div className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            {hasPhoto && photoSrc ? (
                              <img
                                src={photoSrc}
                                alt={ex.name}
                                className="h-16 w-16 rounded-full object-cover border-2 border-[#2DE2E6] bg-white/10"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://ui-avatars.com/api/?name=" +
                                    encodeURIComponent(ex.name || "Expert") +
                                    "&background=2DE2E6&color=fff&size=64";
                                }}
                              />
                            ) : (
                              <img
                                src={
                                  "https://ui-avatars.com/api/?name=" +
                                  encodeURIComponent(ex.name || "Expert") +
                                  "&background=2DE2E6&color=fff&size=64"
                                }
                                alt={ex.name}
                                className="h-16 w-16 rounded-full object-cover border-2 border-[#2DE2E6] bg-white/10"
                                loading="lazy"
                              />
                            )}

                            <div className="flex-1">
                              <h2 className="text-lg font-semibold text-white">
                                {ex.name}
                              </h2>
                              <p className="text-sm text-[#2DE2E6] font-medium">
                                {ex.title}
                              </p>
                              <p className="text-sm text-white/90">
                                {ex.organization}
                              </p>
                              <p className="text-xs text-white mt-1 bg-white/10 px-2 py-1 rounded-full inline-block">
                                {ex.specialization}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center text-sm text-white/90">
                              <Clock className="h-4 w-4 mr-2 text-[#2DE2E6]" />
                              <span>{ex.experience} years experience</span>
                            </div>

                            <div className="flex items-center text-sm text-white/90">
                              <GraduationCap className="h-4 w-4 mr-2 text-[#2DE2E6]" />
                              <span>{ex.qualification}</span>
                            </div>
                          </div>

                          {ex.skills.length > 0 && (
                            <div className="mt-4">
                              <h3 className="text-sm font-semibold text-white mb-2">
                                Skills &amp; Expertise
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {ex.skills.slice(0, 4).map((skill, i) => (
                                  <span
                                    key={`${ex._id}_skill_${i}`}
                                    className="bg-white/10 text-[#2DE2E6] px-3 py-1 rounded-full text-xs font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {ex.skills.length > 4 && (
                                  <button
                                    onClick={() => openModal(ex)}
                                    className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-xs font-medium hover:bg-white/20 cursor-pointer"
                                    type="button"
                                  >
                                    +{ex.skills.length - 4} more
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-6 flex justify-between items-center">
                            {hasLinkedIn && (
                              <a
                                href={ex.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-[#2DE2E6] hover:text-[#FF6EC7] font-medium text-sm transition-colors cursor-pointer"
                              >
                                <Linkedin className="h-5 w-5 mr-1" />
                                Connect
                              </a>
                            )}

                            <button
                              onClick={() => openModal(ex)}
                              className="bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-90 hover:shadow-lg hover:shadow-[#FF6EC7]/20 cursor-pointer"
                              type="button"
                              aria-label={`View profile of ${ex.name}`}
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && activeExpert && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-black/70 backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-[#2DE2E6]">
                Expert Profile
              </h2>
              <button
                onClick={closeModal}
                className="text-white hover:text-white/90 text-2xl cursor-pointer transition"
                aria-label="Close"
                type="button"
              >
                <IconX className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: Avatar + Basic */}
              <div className="md:w-1/3">
                <div className="flex flex-col items-center">
                  {(() => {
                    const hasPhoto = Boolean(activeExpert.photo && activeExpert.photo.trim());
                    const photoSrc = hasPhoto
                      ? (activeExpert.photo.startsWith("http")
                          ? activeExpert.photo
                          : `http://localhost:4000/${activeExpert.photo}`
                        ).replace(/([^:]\/)\/+/g, "$1")
                      : "";
                    return hasPhoto && photoSrc ? (
                      <img
                        src={photoSrc}
                        alt={activeExpert.name}
                        className="h-32 w-32 rounded-full object-cover border-2 border-[#2DE2E6] bg-white/10"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://ui-avatars.com/api/?name=" +
                            encodeURIComponent(activeExpert.name || "Expert") +
                            "&background=2DE2E6&color=fff&size=128";
                        }}
                      />
                    ) : (
                      <img
                        src={
                          "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(activeExpert.name || "Expert") +
                          "&background=2DE2E6&color=fff&size=128"
                        }
                        alt={activeExpert.name}
                        className="h-32 w-32 rounded-full object-cover border-2 border-[#2DE2E6] bg-white/10"
                        loading="lazy"
                      />
                    );
                  })()}

                  <h3 className="text-xl font-semibold mt-4 text-white">
                    {activeExpert.name}
                  </h3>
                  <p className="text-[#2DE2E6] font-medium">
                    {activeExpert.title}
                  </p>
                  <p className="text-white/90 text-sm">
                    {activeExpert.organization}
                  </p>

                  {activeExpert.linkedin &&
                    /^(https?:)\/\//i.test(activeExpert.linkedin) && (
                      <a
                        href={activeExpert.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center text-[#2DE2E6] hover:text-[#FF6EC7] font-medium transition-colors cursor-pointer"
                      >
                        <Linkedin className="h-6 w-6 mr-1" />
                        LinkedIn Profile
                      </a>
                    )}
                </div>
              </div>

              {/* Right: Details */}
              <div className="md:w-2/3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-sm text-white/80">Specialization</p>
                    <p className="font-medium text-white">
                      {activeExpert.specialization}
                    </p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-sm text-white/80">Experience</p>
                    <p className="font-medium text-white">
                      {activeExpert.experience} years
                    </p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-sm text-white/80">Qualification</p>
                    <p className="font-medium text-white">
                      {activeExpert.qualification}
                    </p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-sm text-white/80">Email</p>
                    <p className="font-medium text-white">
                      {activeExpert.email}
                    </p>
                  </div>
                </div>

                {activeExpert.bio && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2 text-white">
                      Bio
                    </h4>
                    <p className="text-white/90">{activeExpert.bio}</p>
                  </div>
                )}

                {activeExpert.skills?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-white">
                      Skills &amp; Expertise
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeExpert.skills.map((skill, i) => (
                        <span
                          key={`${activeExpert._id}_mskill_${i}`}
                          className="bg-white/10 text-[#2DE2E6] px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meeting Request */}
                <div className="mt-8 p-4 bg-white/10 rounded-lg">
                  <h4 className="text-lg font-semibold mb-3 text-[#2DE2E6]">
                    Request a Meeting
                  </h4>
                  <p className="text-white/90 text-sm mb-4">
                    Interested in consulting with this expert? Send a meeting
                    request and our admin team will coordinate a session for
                    you.
                  </p>
                  <button
                    onClick={requestMeeting}
                    disabled={isSendingRequest}
                    className="w-full bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 font-bold py-3 px-4 rounded-lg transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    type="button"
                  >
                    {isSendingRequest ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-gray-900"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M10 3a1 1 0 00-1 1v5.586L6.707 7.293a1 1 0 10-1.414 1.414l3.999 3.999a1 1 0 001.416 0l3.999-3.999a1 1 0 10-1.414-1.414L11 9.586V4a1 1 0 00-1-1z" />
                        </svg>
                        Request Meeting with Expert
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-white/10 text-white hover:bg-white/20 transition-colors rounded-lg cursor-pointer"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px) } 100% { opacity: 1; transform: translateY(0) } }
        .animate-fade-in { animation: fade-in .5s ease-out both }
        .animate-fade-in-up { animation: fade-in-up .55s cubic-bezier(.2,.65,.2,1) both }
      `}</style>
    </>
  );
}
