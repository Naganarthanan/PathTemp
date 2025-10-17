// src/components/customerView/ExpertMeetingRequests.jsx
import React, { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaUserGraduate,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaFilter,
  FaSync,
  FaExclamationTriangle,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

// Email validation + cookie read
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const getCookieValue = (key) =>
  document.cookie
    .split("; ")
    .map((row) => row.split("="))
    .find(([k]) => k === key)?.[1] || "";

const safeEmailFromCookie = (fallback) => {
  const v = getCookieValue("email");
  return EMAIL_RE.test(v) ? v : fallback;
};

// Friendly date/time
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

// Status chip tone classes (no borders)
const statusTone = (s) => {
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

// Validate meeting details; returns { ok, msg }
const validateMeetingDetails = ({ title, dateTime, meetLink }) => {
  if (!title || title.trim().length < 3) {
    return {
      ok: false,
      msg: "Please enter a meeting title (min 3 characters).",
    };
  }
  const dt = new Date(dateTime);
  if (!dateTime || Number.isNaN(dt.getTime())) {
    return { ok: false, msg: "Please choose a valid date & time." };
  }
  if (dt.getTime() <= Date.now()) {
    return { ok: false, msg: "Meeting time must be in the future." };
  }
  try {
    const u = new URL(meetLink);
    if (
      !/^https?:$/.test(u.protocol) ||
      !/(^|\.)meet\.google\.com$/i.test(u.hostname)
    ) {
      return {
        ok: false,
        msg: "Enter a valid Google Meet link (meet.google.com).",
      };
    }
  } catch {
    return { ok: false, msg: "Enter a valid Google Meet URL." };
  }
  return { ok: true, msg: "" };
};

/* -------------------------------------------------------------------------- */
/*                           ExpertMeetingRequests                            */
/* -------------------------------------------------------------------------- */

export default function ExpertMeetingRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const [schedulingId, setSchedulingId] = useState(null);
  const [denyId, setDenyId] = useState(null);

  const [meetingForm, setMeetingForm] = useState({
    title: "",
    dateTime: "",
    meetLink: "",
  });

  const expertEmail = safeEmailFromCookie("expert@example.com");

  /* ------------------------------- Fetch data -------------------------------- */
  useEffect(() => {
    void fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expertEmail]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:4000/expertRoute/getRequestMeeting/${encodeURIComponent(
          expertEmail
        )}`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const normalized = list.map((r, i) => ({
        _id:
          r?._id || `${r?.studentEmail || "req"}_${r?.requestedAt || ""}_${i}`,
        studentEmail: String(r?.studentEmail || "unknown@student").trim(),
        expertEmail: String(r?.expertEmail || expertEmail).trim(),
        specialization: String(r?.specialization || "General").trim(),
        status: ["pending", "accepted", "denied"].includes(r?.status)
          ? r.status
          : "pending",
        requestedAt: r?.requestedAt || null,
        meetingDetails: r?.meetingDetails || null,
      }));
      setRequests(normalized);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load meeting requests.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------ Status update ----------------------------- */
  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:4000/expertRoute/meetingRequests/${requestId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: newStatus } : r))
      );
      toast.success(`Request ${newStatus}.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update request.");
    }
  };

  /* --------------------------------- Accept --------------------------------- */
  const beginSchedule = (id) => {
    setSchedulingId(id);
    setMeetingForm({ title: "", dateTime: "", meetLink: "" });
  };
  const cancelSchedule = () => {
    setSchedulingId(null);
    setMeetingForm({ title: "", dateTime: "", meetLink: "" });
  };
  const confirmSchedule = async () => {
    const check = validateMeetingDetails(meetingForm);
    if (!check.ok) {
      toast.error(check.msg);
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:4000/expertRoute/meetingRequests/${schedulingId}/schedule`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meetingDetails: {
              ...meetingForm,
              timeZone: "UTC",
            },
          }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setRequests((prev) =>
        prev.map((r) =>
          r._id === schedulingId
            ? {
                ...r,
                status: "accepted",
                meetingDetails: { ...meetingForm, timeZone: "UTC" },
              }
            : r
        )
      );
      cancelSchedule();
      toast.success("Meeting scheduled successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule meeting.");
    }
  };

  /* ---------------------------------- Deny ---------------------------------- */
  const beginDeny = (id) => setDenyId(id);
  const cancelDeny = () => setDenyId(null);
  const confirmDeny = () => {
    void updateRequestStatus(denyId, "denied");
    setDenyId(null);
  };

  /* ------------------------------ Filtered list ----------------------------- */
  const filteredRequests = requests
    .filter((r) => (filterStatus === "all" ? true : r.status === filterStatus))
    .sort((a, b) => {
      const da = new Date(a.requestedAt || 0).getTime();
      const db = new Date(b.requestedAt || 0).getTime();
      return db - da;
    });

  const totalAccepted = requests.filter((r) => r.status === "accepted").length;
  const totalPending = requests.filter((r) => r.status === "pending").length;

  /* ---------------------------------- UI ---------------------------------- */
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <FaSpinner className="animate-spin h-10 w-10 text-[#2DE2E6] mx-auto mb-4" />
          <p className="text-white">Loading meeting requests...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" theme="colored" />

      {/* Header — match SkillForm styles (no page bg, rely on global bg) */}
      <div className="p-8 bg-transparent animate-fade-in m-16">
        <h1 className="text-4xl font-extrabold text-center text-white bg-clip-text bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] drop-shadow">
          Expert Meeting Requests
        </h1>
        <p className="text-center text-white mt-4 text-lg">
          Review and manage student meeting requests for your expertise.
        </p>
      </div>

      {/* Controls + Stats */}
      <div className="px-8">
        <div className="rounded-2xl p-6 bg-black/50 backdrop-blur animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Filter */}
            <label className="flex items-center p-2 rounded-xl bg-white/10 cursor-pointer">
              <FaFilter className="text-[#2DE2E6] mr-2" />
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
                  All
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

            {/* Stats (no borders) */}
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-white/10 px-3 py-1.5 rounded-xl text-gray-200">
                Total:{" "}
                <span className="font-bold text-white">{requests.length}</span>
              </span>
              <span className="bg-green-500/20 px-3 py-1.5 rounded-xl text-green-200">
                Accepted: <span className="font-bold">{totalAccepted}</span>
              </span>
              <span className="bg-yellow-500/20 px-3 py-1.5 rounded-xl text-yellow-200">
                Pending: <span className="font-bold">{totalPending}</span>
              </span>

              <button
                type="button"
                onClick={fetchRequests}
                className="ml-2 inline-flex items-center gap-2 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-all cursor-pointer"
                title="Refresh"
              >
                <FaSync className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6 mt-8">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-16 bg-black/50 backdrop-blur rounded-2xl animate-fade-in-up">
              <FaUserGraduate className="h-16 w-16 mx-auto text-white/40 mb-5" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No requests found
              </h3>
              <p className="text-white/80 max-w-md mx-auto">
                {filterStatus !== "all"
                  ? `You don't have any ${filterStatus} meeting requests at the moment.`
                  : "You haven't received any meeting requests yet."}
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req._id}
                className="rounded-2xl p-6 bg-black/50 backdrop-blur transition-all duration-300 hover:ring-2 hover:ring-[#2DE2E6] animate-fade-in-up"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-gradient-to-br from-[#2DE2E6]/20 to-[#FF6EC7]/20 p-3 rounded-xl">
                        <FaUserGraduate className="h-6 w-6 text-[#2DE2E6]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {req.studentEmail}
                        </h3>
                        <p className="text-gray-300 text-sm mb-2">
                          {req.specialization}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Requested on {formatDateTime(req.requestedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Meeting details (if any) */}
                    {req.meetingDetails && (
                      <div className="bg-white/5 rounded-xl p-4 mb-2">
                        <div className="flex items-center gap-2 mb-3">
                          <FaCalendarAlt className="text-[#2DE2E6]" />
                          <span className="text-white font-medium">
                            {req.meetingDetails.title || "Consultation"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <FaClock className="text-[#2DE2E6]" />
                          <span className="text-gray-300">
                            {formatDateTime(req.meetingDetails.dateTime)}
                          </span>
                        </div>
                        {req.meetingDetails.meetLink && (
                          <a
                            href={req.meetingDetails.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2DE2E6] hover:text-[#FF6EC7] transition-colors text-sm cursor-pointer"
                          >
                            Join Google Meet
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status + Actions */}
                  <div className="flex flex-col gap-4 items-start lg:items-end w-full lg:w-auto">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold ${statusTone(
                        req.status
                      )}`}
                    >
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>

                    {/* Action buttons */}
                    {req.status === "pending" && schedulingId !== req._id && (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => beginSchedule(req._id)}
                          className="bg-gradient-to-r from-green-500 to-green-400 text-gray-900 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
                        >
                          <span className="inline-flex items-center gap-2">
                            <FaCheck className="h-4 w-4" />
                            Accept
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => beginDeny(req._id)}
                          className="bg-gradient-to-r from-red-500 to-red-400 text-gray-900 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
                        >
                          <span className="inline-flex items-center gap-2">
                            <FaTimes className="h-4 w-4" />
                            Deny
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Scheduling panel */}
                    {schedulingId === req._id && (
                      <div className="bg-white/5 backdrop-blur p-6 rounded-2xl w-full lg:w-96">
                        <h4 className="text-white font-medium mb-4 inline-flex items-center gap-2">
                          <FaCalendarAlt className="text-[#2DE2E6]" />
                          Schedule Meeting
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">
                              Meeting Title
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Career Consultation"
                              value={meetingForm.title}
                              onChange={(e) =>
                                setMeetingForm((p) => ({
                                  ...p,
                                  title: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-2.5 rounded-lg bg-white/10 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#2DE2E6] outline-none cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-300 text-sm mb-1">
                              Date &amp; Time
                            </label>
                            <input
                              type="datetime-local"
                              value={meetingForm.dateTime}
                              onChange={(e) =>
                                setMeetingForm((p) => ({
                                  ...p,
                                  dateTime: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-2.5 rounded-lg bg-white/10 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#2DE2E6] outline-none cursor-pointer"
                              min={new Date().toISOString().slice(0, 16)}
                            />
                          </div>

                          <div>
                            <label className="block text-gray-300 text-sm mb-1">
                              Google Meet Link
                            </label>
                            <input
                              type="url"
                              placeholder="https://meet.google.com/xxx-xxxx-xxx"
                              value={meetingForm.meetLink}
                              onChange={(e) =>
                                setMeetingForm((p) => ({
                                  ...p,
                                  meetLink: e.target.value,
                                }))
                              }
                              className="w-full px-4 py-2.5 rounded-lg bg-white/10 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#2DE2E6] outline-none cursor-pointer"
                            />
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={confirmSchedule}
                              className="flex-1 bg-gradient-to-r from-green-500 to-green-400 text-gray-900 px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
                            >
                              <span className="inline-flex items-center gap-2">
                                <FaCheck className="h-3 w-3" />
                                Confirm
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={cancelSchedule}
                              className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Deny Confirmation Modal (glass, no heavy borders) */}
      {denyId && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl p-6 bg-black/60 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-full">
                <FaExclamationTriangle className="h-5 w-5 text-red-300" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Deny Request?
              </h3>
            </div>
            <p className="text-gray-200 mb-6">
              Are you sure you want to deny this meeting request? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={confirmDeny}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-400 text-gray-900 px-4 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-all cursor-pointer"
              >
                Confirm Deny
              </button>
              <button
                type="button"
                onClick={cancelDeny}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations (from SkillForm) */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px) } 100% { opacity: 1; transform: translateY(0) } }
        .animate-fade-in { animation: fade-in .5s ease-out both }
        .animate-fade-in-up { animation: fade-in-up .55s cubic-bezier(.2,.65,.2,1) both }
      `}</style>
    </>
  );
}
