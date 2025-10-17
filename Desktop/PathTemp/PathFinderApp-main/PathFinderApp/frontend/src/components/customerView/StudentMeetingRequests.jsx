// src/components/customerView/StudentMeetingRequests.jsx
import React, { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaUserGraduate,
  FaEnvelope,
  FaCopy,
  FaSyncAlt,
  FaFilter,
  FaSort,
  FaCalendarPlus,
} from "react-icons/fa";
import Swal from "sweetalert2";

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

// Email validation (used for cookie fallback)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Read a cookie value by key
const getCookieValue = (key) =>
  document.cookie
    .split("; ")
    .map((row) => row.split("="))
    .find(([k]) => k === key)?.[1] || "";

// Safe student email (from cookie or fallback)
const safeEmailFromCookie = () => {
  const fromCookie = getCookieValue("email");
  return EMAIL_RE.test(fromCookie) ? fromCookie : "student@example.com";
};

// Friendly date/time formatter
const formatDateTime = (value) => {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) return "Not scheduled";
  return d.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

// Build clipboard text for meeting details
const formatMeetingDetailsForClipboard = (details) => {
  if (!details || !details.dateTime) return "Meeting is not scheduled yet.";
  const when = formatDateTime(details.dateTime);
  const title = details.title || "Consultation";
  const tz = details.timeZone || "Local time";
  const link = details.meetLink || "No link provided";
  return `${title}\n${when}\nTime zone: ${tz}\nGoogle Meet\nLink: ${link}`;
};

// Validate status and map to tone chip classes
const isValidStatus = (s) => ["pending", "accepted", "denied"].includes(s);
const statusToneClass = (s) => {
  switch (s) {
    case "accepted":
      return "bg-green-500/20 text-green-200";
    case "denied":
      return "bg-red-500/20 text-red-200";
    case "pending":
    default:
      return "bg-yellow-500/20 text-yellow-200";
  }
};

/* -------------------------------------------------------------------------- */
/*                           StudentMeetingRequests                           */
/* -------------------------------------------------------------------------- */

export default function StudentMeetingRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const studentEmail = safeEmailFromCookie();

  // Initial fetch + on studentEmail change
  useEffect(() => {
    void fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentEmail]);

  /* ------------------------------ Data fetching ----------------------------- */
  const fetchRequests = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const res = await fetch(
        `http://localhost:4000/expertRoute/getRequestsByStudentEmail/${encodeURIComponent(
          studentEmail
        )}`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      const normalized = list.map((r, idx) => ({
        _id:
          r?._id || `${r?.expertEmail || "req"}_${r?.requestedAt || ""}_${idx}`,
        expertName: String(r?.expertName || "Unknown").trim(),
        expertEmail: String(r?.expertEmail || "").trim(),
        specialization: String(r?.specialization || "General").trim(),
        status: isValidStatus(r?.status) ? r.status : "pending",
        requestedAt: r?.requestedAt || null,
        meetingDetails: r?.meetingDetails || null,
      }));

      setRequests(normalized);
    } catch (err) {
      console.error(err);
      setLoadError("Failed to load meeting requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------ Filtering/Sort ---------------------------- */
  const filteredAndSorted = requests
    .filter((r) => (filterStatus === "all" ? true : r.status === filterStatus))
    .sort((a, b) => {
      if (sortBy === "status") return a.status.localeCompare(b.status);
      const da = new Date(a.requestedAt || 0).getTime();
      const db = new Date(b.requestedAt || 0).getTime();
      return sortBy === "oldest" ? da - db : db - da; // default newest
    });

  const totalPending = requests.filter((r) => r.status === "pending").length;
  const totalAccepted = requests.filter((r) => r.status === "accepted").length;

  /* ---------------------------------- UI ---------------------------------- */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <FaUserGraduate className="h-12 w-12 text-[#2DE2E6] mx-auto mb-4" />
          <p className="text-white font-medium">Loading meeting requests...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-300 mb-5 font-medium">{loadError}</p>
          <button
            type="button"
            onClick={fetchRequests}
            className="cursor-pointer bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header — match SkillForm styles */}
      <div className="p-8 bg-transparent animate-fade-in-up mt-16">
        <h1 className="text-4xl font-extrabold text-center text-white bg-clip-text bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] drop-shadow">
          Here Is Your Meetings
        </h1>
        <p className="text-center text-white mt-4 text-lg">
          Find and manage your expert meeting schedules.
        </p>
      </div>

      <div className="px-8 pb-10">
        {/* Controls — styled like SkillForm cards (no borders/outlines) */}
        <div className="rounded-2xl p-6 bg-black/50 backdrop-blur animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Filter + Sort */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <label className="flex items-center p-2 rounded-xl bg-white/10 cursor-pointer">
                <FaFilter className="text-[#FF6EC7] mr-2" />
                <select
                  aria-label="Filter by status"
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(
                      ["all", "pending", "accepted", "denied"].includes(
                        e.target.value
                      )
                        ? e.target.value
                        : "all"
                    )
                  }
                  className="bg-transparent text-white rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#2DE2E6] cursor-pointer"
                >
                  <option value="all" className="bg-[#0b0d14]">
                    All Requests
                  </option>
                  <option value="pending" className="bg-[#0b0d14]">
                    Pending
                  </option>
                  <option value="accepted" className="bg-[#0b0d14]">
                    Accepted
                  </option>
                  <option value="denied" className="bg-[#0b0d14]">
                    Denied
                  </option>
                </select>
              </label>

              <label className="flex items-center p-2 rounded-xl bg-white/10 cursor-pointer">
                <FaSort className="text-[#2DE2E6] mr-2" />
                <select
                  aria-label="Sort requests"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      ["newest", "oldest", "status"].includes(e.target.value)
                        ? e.target.value
                        : "newest"
                    )
                  }
                  className="bg-transparent text-white rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#2DE2E6] cursor-pointer"
                >
                  <option value="newest" className="bg-[#0b0d14]">
                    Newest First
                  </option>
                  <option value="oldest" className="bg-[#0b0d14]">
                    Oldest First
                  </option>
                  <option value="status" className="bg-[#0b0d14]">
                    By Status
                  </option>
                </select>
              </label>
            </div>

            {/* Stats (no borders) */}
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-white/10 px-3 py-1.5 rounded-xl text-gray-200">
                Total:{" "}
                <span className="font-bold text-white">{requests.length}</span>
              </span>
              <span className="bg-yellow-500/20 px-3 py-1.5 rounded-xl text-yellow-200">
                Pending: <span className="font-bold">{totalPending}</span>
              </span>
              <span className="bg-green-500/20 px-3 py-1.5 rounded-xl text-green-200">
                Accepted: <span className="font-bold">{totalAccepted}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-5 mt-8">
          {filteredAndSorted.length === 0 ? (
            <div className="text-center py-16 bg-black/50 backdrop-blur rounded-2xl animate-fade-in-up">
              <FaUserGraduate className="h-16 w-16 mx-auto text-white/40 mb-5" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No meeting requests found
              </h3>
              <p className="text-white/80 max-w-md mx-auto">
                {filterStatus !== "all"
                  ? `No ${filterStatus} requests found. Try changing your filters.`
                  : "You haven't made any meeting requests yet. Schedule a session with an expert to get started!"}
              </p>
            </div>
          ) : (
            filteredAndSorted.map((req) => (
              <div
                key={req._id}
                className="rounded-2xl p-6 bg-black/50 backdrop-blur transition-all duration-300 hover:ring-2 hover:ring-[#2DE2E6] animate-fade-in-up"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  {/* Left: details */}
                  <div className="flex-1">
                    <div className="flex items-start gap-5 mb-5">
                      <div className="bg-gradient-to-br from-[#2DE2E6]/20 to-[#FF6EC7]/20 p-3.5 rounded-xl">
                        <FaUserGraduate className="h-7 w-7 text-[#2DE2E6]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-200 mb-1">
                          {req.expertName}
                        </h3>
                        <h6 className="text-base font-medium text-gray-400 mb-2">
                          {req.expertEmail}
                        </h6>
                        <span className="inline-block bg-white/10 text-gray-200 text-sm px-3 py-1 rounded-lg mb-2">
                          {req.specialization}
                        </span>
                        <p className="text-gray-400 text-sm">
                          Requested on: {formatDateTime(req.requestedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Meeting details */}
                    {req.meetingDetails && (
                      <div className="bg-white/5 rounded-xl p-4 mb-2">
                        <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                          <FaCalendarPlus className="text-[#FF6EC7]" />
                          Meeting Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                          <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-lg">
                              <FaCalendarAlt className="text-[#FF6EC7]" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Title</p>
                              <p>
                                {req.meetingDetails.title || "Consultation"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-lg">
                              <FaClock className="text-[#2DE2E6]" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">
                                Date &amp; Time
                              </p>
                              <p>
                                {formatDateTime(req.meetingDetails.dateTime)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-lg">
                              <FaClock className="text-[#FF6EC7]" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Time Zone</p>
                              <p>
                                {req.meetingDetails.timeZone || "Local time"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-lg">
                              <FaCalendarPlus className="text-[#2DE2E6]" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">
                                Meeting Link
                              </p>
                              <a
                                href={req.meetingDetails.meetLink || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#2DE2E6] hover:text-[#FF6EC7] transition-colors truncate block max-w-xs cursor-pointer"
                              >
                                Join Google Meet
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: status + actions */}
                  <div className="flex flex-col gap-4 min-w-[200px]">
                    <div
                      className={`inline-flex items-center justify-center px-4 py-1.5 rounded-xl font-medium text-sm ${statusToneClass(
                        req.status
                      )}`}
                    >
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </div>

                    <div className="flex flex-col gap-3">
                      <a
                        href={`mailto:${req.expertEmail}`}
                        className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-gray-200 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer"
                      >
                        <FaEnvelope className="h-3.5 w-3.5 text-[#FF6EC7]" />
                        <span>Email Expert</span>
                      </a>

                      {req.meetingDetails && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              formatMeetingDetailsForClipboard(
                                req.meetingDetails
                              )
                            );
                            Swal.fire({
                              title: "Copied!",
                              text: "Meeting details copied to clipboard!",
                              icon: "success",
                              timer: 1400,
                              showConfirmButton: false,
                              background: "#0b0d14",
                              color: "#E5E7EB",
                            });
                          }}
                          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 px-3 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
                        >
                          <FaCopy className="h-3.5 w-3.5" />
                          <span>Copy Details</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Refresh */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={fetchRequests}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-gray-200 px-5 py-2.5 rounded-xl transition-all font-medium cursor-pointer"
          >
            <FaSyncAlt className="h-4 w-4" />
            Refresh Requests
          </button>
        </div>
      </div>

      {/* Animations (same as SkillForm) */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px) } 100% { opacity: 1; transform: translateY(0) } }
        .animate-fade-in { animation: fade-in .5s ease-out both }
        .animate-fade-in-up { animation: fade-in-up .55s cubic-bezier(.2,.65,.2,1) both }
      `}</style>
    </>
  );
}
