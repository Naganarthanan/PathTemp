import { useEffect, useMemo, useState, useCallback } from "react";
import {
  FaStar,
  FaFilter,
  FaSort,
  FaSearch,
  FaSync,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
  FaEye,
  FaReply,
} from "react-icons/fa";
import Swal from "sweetalert2";

/* --------------------------------- Constants -------------------------------- */
// Allowed status values
const STATUSES = ["new", "reviewed", "replied", "resolved", "archived"];

/* --------------------------------- Helpers --------------------------------- */
// Format date safely
const formatDateTime = (value) => {
  if (!value) return "—";
  const dt = new Date(value);
  return Number.isNaN(+dt) ? "—" : dt.toLocaleString();
};

// Clamp rating to 0..5 (integer)
const clampRating = (r) => {
  const n = Number(r);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, Math.round(n)));
};

// Status chip color classes (minimal borders, neon-friendly)
const statusClasses = (status) => {
  switch (status) {
    case "new":
      return "bg-yellow-500/10 text-yellow-400";
    case "reviewed":
      return "bg-blue-500/10 text-blue-400";
    case "replied":
      return "bg-emerald-500/10 text-emerald-400";
    case "resolved":
      return "bg-green-600/10 text-green-400";
    case "archived":
      return "bg-gray-500/10 text-gray-300";
    default:
      return "bg-gray-500/10 text-gray-300";
  }
};

// Status icon
const StatusIcon = ({ status }) => {
  switch (status) {
    case "new":
      return <FaExclamationTriangle className="mr-1" />;
    case "reviewed":
      return <FaEye className="mr-1" />;
    case "replied":
      return <FaReply className="mr-1" />;
    case "resolved":
      return <FaCheckCircle className="mr-1" />;
    case "archived":
      return <FaTimesCircle className="mr-1" />;
    default:
      return null;
  }
};

/* -------------------------------- Component -------------------------------- */
export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Controls
  const [ratingFilter, setRatingFilter] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("newest"); // newest | oldest | highest | lowest
  const [query, setQuery] = useState("");

  // Reply state
  const [openReplyFor, setOpenReplyFor] = useState(null);
  const [replyDraft, setReplyDraft] = useState("");

  /* ------------------------------ Data fetching ------------------------------ */
  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFeedbacks = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const response = await fetch(
        "http://localhost:4000/adminRoute/feedback",
        {
          headers: { Accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error(`HTTP_${response.status}`);

      const raw = await response.json().catch(() => {
        throw new Error("BAD_JSON");
      });

      const normalized = Array.isArray(raw)
        ? raw.map((f) => ({
            _id: f?._id,
            feedback: typeof f?.feedback === "string" ? f.feedback : "",
            rating: clampRating(f?.rating),
            status: STATUSES.includes(f?.status) ? f.status : "new",
            userEmail: typeof f?.userEmail === "string" ? f.userEmail : "",
            createdAt: f?.createdAt || null,
            reply: typeof f?.reply === "string" ? f.reply : "",
            repliedAt: f?.repliedAt || null,
          }))
        : [];

      setFeedbacks(normalized);
    } catch (err) {
      console.error(err);
      setLoadError("Failed to load feedback. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* --------------------------------- Actions -------------------------------- */
  const updateStatus = useCallback(async (id, nextStatus) => {
    if (!id || !STATUSES.includes(nextStatus)) return;
    try {
      const res = await fetch(
        `http://localhost:4000/adminRoute/feedback/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      if (!res.ok) throw new Error("STATUS_UPDATE_FAILED");
      setFeedbacks((prev) =>
        prev.map((f) => (f._id === id ? { ...f, status: nextStatus } : f))
      );
    } catch (err) {
      console.error(err);
      setLoadError("Failed to update status.");
    }
  }, []);

  const sendReply = useCallback(
    async (id) => {
      const text = replyDraft.trim();
      if (!id || !text) return;
      try {
        const res = await fetch(
          `http://localhost:4000/adminRoute/feedback/${id}/reply`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: text }),
          }
        );
        if (!res.ok) throw new Error("REPLY_FAILED");

        const updated = await res.json().catch(() => null);
        if (updated && updated._id) {
          setFeedbacks((prev) =>
            prev.map((f) => (f._id === id ? { ...f, ...updated } : f))
          );
        } else {
          setFeedbacks((prev) =>
            prev.map((f) =>
              f._id === id
                ? {
                    ...f,
                    reply: text,
                    repliedAt: new Date().toISOString(),
                    status: "replied",
                  }
                : f
            )
          );
        }
        setReplyDraft("");
        setOpenReplyFor(null);
      } catch (err) {
        console.error(err);
        setLoadError("Failed to send reply.");
      }
    },
    [replyDraft]
  );

  const deleteFeedback = useCallback(async (id) => {
    if (!id) return;
    Swal.fire({
      title: "Delete this feedback?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: "#0b0d14",
      color: "#E5E7EB",
      iconColor: "#FF6EC7",
      customClass: {
        popup: "rounded-2xl p-6 backdrop-blur-md bg-black/60 shadow-xl",
        confirmButton:
          "cursor-pointer bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 rounded-lg px-4 py-2",
        cancelButton:
          "cursor-pointer bg-white/10 text-white hover:bg-white/20 rounded-lg px-4 py-2 ml-2",
      },
    }).then(async (r) => {
      if (!r.isConfirmed) return;
      try {
        const res = await fetch(
          `http://localhost:4000/adminRoute/feedback/${id}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error("DELETE_FAILED");
        setFeedbacks((prev) => prev.filter((f) => f._id !== id));
        Swal.fire({
          icon: "success",
          title: "Deleted",
          background: "#0b0d14",
          color: "#E5E7EB",
          iconColor: "#2DE2E6",
          customClass: {
            popup: "rounded-2xl p-6 backdrop-blur-md bg-black/60 shadow-xl",
            confirmButton:
              "cursor-pointer bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 rounded-lg px-4 py-2",
          },
        });
      } catch (err) {
        console.error(err);
        setLoadError("Failed to delete feedback.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong.",
          background: "#0b0d14",
          color: "#E5E7EB",
          iconColor: "#FF6EC7",
          customClass: {
            popup: "rounded-2xl p-6 backdrop-blur-md bg-black/60 shadow-xl",
            confirmButton:
              "cursor-pointer bg-white/10 text-white hover:bg-white/20 rounded-lg px-4 py-2",
          },
        });
      }
    });
  }, []);

  /* ----------------------------- Filter & Sorting ---------------------------- */
  const visibleFeedbacks = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = feedbacks.filter((f) => {
      const ratingOk =
        ratingFilter === 0 || clampRating(f.rating) === ratingFilter;
      const text = (f.feedback || "").toLowerCase();
      const email = (f.userEmail || "").toLowerCase();
      const searchOk = !q || text.includes(q) || email.includes(q);
      const statusOk = statusFilter === "all" || f.status === statusFilter;
      return ratingOk && searchOk && statusOk;
    });

    const sorter =
      sortKey === "newest"
        ? (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        : sortKey === "oldest"
        ? (a, b) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
        : sortKey === "highest"
        ? (a, b) => clampRating(b.rating) - clampRating(a.rating)
        : (a, b) => clampRating(a.rating) - clampRating(b.rating);

    return [...filtered].sort(sorter);
  }, [feedbacks, ratingFilter, statusFilter, sortKey, query]);

  /* ---------------------------------- UI: Loading / Error (empty-state) ---------------------------------- */
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8 bg-transparent animate-fade-in">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-white/20 border-t-[#2DE2E6] mx-auto" />
          <p className="mt-4 text-white/90">Loading feedback…</p>
        </div>
      </div>
    );
  }

  if (loadError && feedbacks.length === 0) {
    return (
      <div className="p-8 bg-transparent animate-fade-in-up">
        <div className="max-w-2xl mx-auto rounded-2xl p-6 bg-black/60 backdrop-blur shadow-xl text-center">
          <p className="text-red-300 mb-4">{loadError}</p>
          <button
            type="button"
            onClick={fetchFeedbacks}
            className="inline-flex items-center bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition cursor-pointer"
          >
            <FaSync className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* --------------------------------------------- UI --------------------------------------------- */
  return (
    <>
      {/* Header */}
      <div className="p-8 bg-transparent animate-fade-in-up mt-16">
        <h1 className="text-4xl font-extrabold text-center text-white bg-clip-text bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] drop-shadow">
          Feedback Dashboard
        </h1>
        <p className="text-center text-white mt-4 text-lg drop-shadow">
          Manage and respond to user feedback.
        </p>
      </div>

      {/* Controls */}
      <div className="p-8 space-y-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl p-6 bg-black/60 backdrop-blur shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              {/* Search */}
              <div>
                <div className="flex items-center mb-2 text-white/80">
                  <FaSearch className="mr-2" />
                  <label className="text-sm">Search</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-300" />
                  </div>
                  <input
                    type="search"
                    inputMode="search"
                    aria-label="Search feedback"
                    placeholder="Search by text or user email…"
                    className="pl-10 pr-4 py-3 w-full rounded-lg bg-white/15 text-white placeholder:text-gray-200 focus:ring-2 focus:ring-[#2DE2E6]"
                    value={query}
                    onChange={(e) => setQuery(e.target.value.slice(0, 120))}
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <div className="flex items-center mb-2 text-white/80">
                  <FaFilter className="mr-2" />
                  <label className="text-sm">Rating</label>
                </div>
                <select
                  aria-label="Filter by rating"
                  className="w-full px-4 py-3 rounded-lg bg-white/15 text-white focus:ring-2 focus:ring-[#2DE2E6] cursor-pointer"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(Number(e.target.value))}
                >
                  <option className="bg-[#0b0d14]" value={0}>
                    All Ratings
                  </option>
                  <option className="bg-[#0b0d14]" value={1}>
                    1 Star
                  </option>
                  <option className="bg-[#0b0d14]" value={2}>
                    2 Stars
                  </option>
                  <option className="bg-[#0b0d14]" value={3}>
                    3 Stars
                  </option>
                  <option className="bg-[#0b0d14]" value={4}>
                    4 Stars
                  </option>
                  <option className="bg-[#0b0d14]" value={5}>
                    5 Stars
                  </option>
                </select>
              </div>

              {/* Status */}
              <div>
                <div className="flex items-center mb-2 text-white/80">
                  <FaFilter className="mr-2" />
                  <label className="text-sm">Status</label>
                </div>
                <select
                  aria-label="Filter by status"
                  className="w-full px-4 py-3 rounded-lg bg-white/15 text-white focus:ring-2 focus:ring-[#2DE2E6] cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option className="bg-[#0b0d14]" value="all">
                    All Status
                  </option>
                  {STATUSES.map((s) => (
                    <option className="bg-[#0b0d14]" key={s} value={s}>
                      {s[0].toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <div className="flex items-center mb-2 text-white/80">
                  <FaSort className="mr-2" />
                  <label className="text-sm">Sort By</label>
                </div>
                <select
                  aria-label="Sort feedback"
                  className="w-full px-4 py-3 rounded-lg bg-white/15 text-white focus:ring-2 focus:ring-[#2DE2E6] cursor-pointer"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                >
                  <option className="bg-[#0b0d14]" value="newest">
                    Newest First
                  </option>
                  <option className="bg-[#0b0d14]" value="oldest">
                    Oldest First
                  </option>
                  <option className="bg-[#0b0d14]" value="highest">
                    Highest Rated
                  </option>
                  <option className="bg-[#0b0d14]" value="lowest">
                    Lowest Rated
                  </option>
                </select>
              </div>
            </div>

            {/* Refresh + Count */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <button
                type="button"
                onClick={fetchFeedbacks}
                className="inline-flex items-center bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition cursor-pointer"
              >
                <FaSync className="mr-2" />
                Refresh
              </button>
              <div className="text-white/90">
                Total Feedback:{" "}
                <span className="font-semibold text-[#2DE2E6]">
                  {feedbacks.length}
                </span>
              </div>
            </div>
          </div>

          {/* Non-blocking error banner */}
          {loadError && (
            <div className="mt-6 rounded-2xl p-4 bg-black/60 backdrop-blur shadow-xl text-center animate-fade-in">
              <p className="text-red-300">{loadError}</p>
            </div>
          )}

          {/* List */}
          <div className="mt-8 space-y-4 animate-fade-in-up">
            {visibleFeedbacks.length === 0 ? (
              <div className="rounded-2xl p-8 bg-black/60 backdrop-blur shadow-xl text-center">
                <div className="text-white/90 text-lg mb-2">
                  No feedback found
                </div>
                <p className="text-white/70">
                  {feedbacks.length === 0
                    ? "No feedback has been submitted yet."
                    : "Try adjusting your filters or search terms."}
                </p>
              </div>
            ) : (
              visibleFeedbacks.map((item) => {
                const rating = clampRating(item.rating);
                const status = item.status || "new";
                const isReplyOpen = openReplyFor?._id === item._id;

                return (
                  <div
                    key={item._id}
                    className="rounded-2xl p-6 bg-black/60 backdrop-blur shadow-xl hover:ring-2 hover:ring-[#2DE2E6] transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      {/* Left: Content */}
                      <div className="flex-1">
                        {/* Rating + Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                          <div className="flex items-center">
                            <span className="font-semibold text-white/80 mr-2">
                              Rating:
                            </span>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={
                                    i < rating
                                      ? "text-yellow-400 mr-1"
                                      : "text-gray-600 mr-1"
                                  }
                                />
                              ))}
                              <span className="text-gray-400 text-sm ml-2">
                                ({rating}/5)
                              </span>
                            </div>
                          </div>

                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClasses(
                              status
                            )}`}
                          >
                            <StatusIcon status={status} />
                            <span className="capitalize">{status}</span>
                          </div>
                        </div>

                        {/* Feedback text */}
                        <p className="text-white/90 mb-4 bg-white/10 p-4 rounded-lg break-words whitespace-pre-wrap">
                          {item.feedback || "—"}
                        </p>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                          <div>
                            <span className="font-medium">From:</span>{" "}
                            {item.userEmail || "—"}
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span>{" "}
                            {formatDateTime(item.createdAt)}
                          </div>
                        </div>

                        {/* Existing reply */}
                        {item.reply && (
                          <div className="mt-4 p-4 bg-[#2DE2E6]/10 rounded-lg">
                            <div className="flex items-center text-[#2DE2E6] mb-2">
                              <FaReply className="mr-2" />
                              <span className="font-medium">Your Response</span>
                            </div>
                            <p className="text-white/90 break-words whitespace-pre-wrap">
                              {item.reply}
                            </p>
                            <div className="text-xs text-white/70 mt-2">
                              Replied on: {formatDateTime(item.repliedAt)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col sm:flex-row md:flex-col gap-2 min-w-[240px]">
                        {/* Status selector + Archive toggle */}
                        <div className="flex">
                          <select
                            value={status}
                            aria-label="Change status"
                            onChange={(e) =>
                              updateStatus(item._id, e.target.value)
                            }
                            className="flex-1 bg-white/15 text-white rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-[#2DE2E6] cursor-pointer"
                          >
                            {STATUSES.map((s) => (
                              <option
                                className="bg-[#0b0d14]"
                                key={s}
                                value={s}
                              >
                                {s[0].toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            title={
                              status === "archived"
                                ? "Unarchive (set to Reviewed)"
                                : "Archive"
                            }
                            onClick={() =>
                              updateStatus(
                                item._id,
                                status === "archived" ? "reviewed" : "archived"
                              )
                            }
                            className="px-3 py-2 bg-white/15 rounded-r-lg hover:bg-white/20 transition-colors cursor-pointer"
                          >
                            {status === "archived" ? (
                              <FaEye className="text-blue-300" />
                            ) : (
                              <FaTimesCircle className="text-white/80" />
                            )}
                          </button>
                        </div>

                        {/* Open reply */}
                        <button
                          type="button"
                          onClick={() =>
                            setOpenReplyFor(isReplyOpen ? null : item)
                          }
                          className="flex items-center justify-center px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                        >
                          <FaReply className="mr-1" />
                          {isReplyOpen ? "Close Reply" : "Reply"}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => deleteFeedback(item._id)}
                          className="flex items-center justify-center px-3 py-2 bg-[#ff6eaa]/20 text-[#ff6eaa] rounded-lg hover:bg-[#ff6eaa]/30 transition-colors cursor-pointer"
                        >
                          <FaTrash className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Reply composer */}
                    {isReplyOpen && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <textarea
                          rows={3}
                          aria-label="Reply message"
                          placeholder="Type your response here…"
                          className="w-full bg-white/15 text-white rounded-lg p-3 focus:ring-2 focus:ring-[#2DE2E6]"
                          value={replyDraft}
                          onChange={(e) => setReplyDraft(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenReplyFor(null);
                              setReplyDraft("");
                            }}
                            className="px-4 py-2 text-white/80 hover:text-white transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={!replyDraft.trim()}
                            onClick={() => sendReply(item._id)}
                            className="px-4 py-2 rounded-lg font-semibold transition cursor-pointer disabled:opacity-50 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 hover:opacity-90"
                          >
                            Send Response
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

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
