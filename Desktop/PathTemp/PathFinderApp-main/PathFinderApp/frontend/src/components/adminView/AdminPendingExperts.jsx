import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

/* ------------------------------- Utilities -------------------------------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isHttpUrl = (url = "") => /^(https?:)\/\//i.test(String(url).trim());
const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(+d) ? "—" : d.toLocaleDateString();
};
const cleanPhotoUrl = (p = "") =>
  p
    ? (p.startsWith("http") ? p : `http://localhost:4000/${p}`).replace(
        /([^:]\/)\/+/g,
        "$1"
      )
    : "";

/* ----------------------------- Main Component ----------------------------- */
export default function AdminPendingExperts() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState("pending"); // "pending" | "approved" | "denied"
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState(null);

  /* ------------------------------ Data Fetching ----------------------------- */
  const fetchRows = async (status) => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `http://localhost:4000/adminRoute/experts?status=${encodeURIComponent(
          status
        )}`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || `Failed to fetch experts (${res.status})`);
      }
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error fetching experts");
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRows(tab);
  }, [tab]);

  /* --------------------------------- Actions -------------------------------- */
  const approve = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(
        `http://localhost:4000/adminRoute/experts/${id}/approve`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Error approving expert");
      }
      toast.success("Expert approved successfully");
      fetchRows(tab);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to approve expert");
    }
  };

  const deny = async (id) => {
    if (!id) return;
    try {
      const reason = (
        window.prompt("Reason for denial (optional):") || ""
      ).slice(0, 300);
      const res = await fetch(
        `http://localhost:4000/adminRoute/experts/${id}/deny`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        }
      );
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || "Error denying expert");
      }
      toast.success("Expert denied successfully");
      fetchRows(tab);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to deny expert");
    }
  };

  /* ------------------------------- Subcomponents ---------------------------- */
  function Field({ label, value }) {
    return (
      <div>
        <label className="text-[#2DE2E6]/70 text-sm">{label}</label>
        <p className="text-white font-medium break-words mt-1">{value}</p>
      </div>
    );
  }

  function ExpertDetailModal({ expert, onClose }) {
    const photoSrc = cleanPhotoUrl(expert.photo);
    return (
      <div className="fixed inset-0  flex items-center justify-center z-50 p-4 mt-24">
        <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-black/40 backdrop-blur-md shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#2DE2E6]">Expert Details</h2>
            <button
              aria-label="Close"
              onClick={onClose}
              className="text-white hover:text-white/90 text-2xl leading-none cursor-pointer"
            >
              &times;
            </button>
          </div>

          {/* Identity */}
          <div className="flex items-center gap-4 mb-6">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={expert.name || "Expert"}
                className="h-16 w-16 rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] flex items-center justify-center">
                <span className="text-gray-900 text-2xl font-bold">
                  {expert?.name?.[0] || "E"}
                </span>
              </div>
            )}
            <div>
              <div className="text-white text-xl font-semibold">
                {expert.name || "—"}
              </div>
              <div className="text-[#2DE2E6]/80">
                {expert.title?.trim() || "—"}
              </div>
            </div>
          </div>

          {/* Facts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Email"
              value={EMAIL_RE.test(expert.email) ? expert.email : "—"}
            />
            <Field
              label="LinkedIn"
              value={
                isHttpUrl(expert.linkedin) ? (
                  <a
                    href={expert.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2DE2E6] hover:text-[#FF6EC7] transition-colors cursor-pointer break-all"
                  >
                    LinkedIn Profile
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Field label="Organization" value={expert.organization || "—"} />
            <Field
              label="Specialization"
              value={expert.specialization || "—"}
            />
            <Field label="Qualification" value={expert.qualification || "—"} />
            <Field
              label="Experience"
              value={
                Number.isFinite(Number(expert.experience))
                  ? `${Math.max(0, Number(expert.experience))} years`
                  : "—"
              }
            />
            <div>
              <label className="text-[#2DE2E6]/70 text-sm">Status</label>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                    expert.approval?.status === "approved"
                      ? "bg-[#2DE2E6]/10 text-[#2DE2E6]"
                      : expert.approval?.status === "denied"
                      ? "bg-[#FF6EC7]/10 text-[#FF6EC7]"
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {expert.approval?.status || "pending"}
                </span>
              </div>
            </div>
            <Field label="Created At" value={fmtDate(expert.createdAt)} />
            <Field label="Updated At" value={fmtDate(expert.updatedAt)} />
          </div>

          {/* Skills */}
          <div className="mt-6">
            <label className="text-[#2DE2E6]/70 text-sm">Skills</label>
            {Array.isArray(expert.skills) && expert.skills.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {expert.skills.map((s, i) => (
                  <span
                    key={`${String(s)}-${i}`}
                    className="bg-white/10 text-[#2DE2E6] px-3 py-1 rounded-full text-sm"
                  >
                    {String(s)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-white/80 mt-1">—</p>
            )}
          </div>

          {/* Bio */}
          <div className="mt-4">
            <label className="text-[#2DE2E6]/70 text-sm">Bio</label>
            <p className="text-white/80 bg-white/10 p-3 rounded-lg mt-1">
              {expert.bio?.trim() || "—"}
            </p>
          </div>

          {/* Denial Reason */}
          {expert.approval?.reason && (
            <div className="mt-4">
              <label className="text-[#2DE2E6]/70 text-sm">Denial Reason</label>
              <p className="text-white/80 bg-white/10 p-3 rounded-lg mt-1">
                {expert.approval.reason}
              </p>
            </div>
          )}

          {/* Actions */}
          {tab === "pending" && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  approve(expert._id);
                  onClose();
                }}
                className="flex-1 px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#2DE2E6] to-[#7df0f2] text-gray-900 hover:opacity-90 transition cursor-pointer"
              >
                Approve Expert
              </button>
              <button
                onClick={() => {
                  deny(expert._id);
                  onClose();
                }}
                className="flex-1 px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#FF6EC7] to-[#ff76cf] text-gray-900 hover:opacity-90 transition cursor-pointer"
              >
                Deny Expert
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ------------------------------------ UI ----------------------------------- */
  return (
    <>
      <Toaster position="top-center" />

      {/* Header */}
      <div className="p-8 bg-transparent animate-fade-in-up mt-16">
        <h1 className="text-4xl font-extrabold text-center text-white bg-clip-text bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] drop-shadow">
          Expert Approvals
        </h1>
        <p className="text-center text-white mt-4 text-lg drop-shadow">
          Review and manage expert registration requests.
        </p>
      </div>

      {/* Shell */}
      <main className="flex items-start justify-center px-4 pb-12 bg-transparent">
        <div className="w-full max-w-7xl rounded-2xl p-6 bg-black/60 backdrop-blur shadow-xl animate-fade-in">
          {/* Tabs */}
          <div className="flex justify-center md:justify-between flex-col md:flex-row md:items-center gap-3">
            <div className="text-center md:text-left">
              <p className="text-white/80">
                Quick overview of expert onboarding statuses
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {["pending", "approved", "denied"].map((s) => {
                const active = tab === s;
                return (
                  <button
                    key={s}
                    onClick={() => setTab(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 shadow-md"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    title={`View ${s} experts`}
                    type="button"
                  >
                    {s[0].toUpperCase() + s.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg p-4 text-center bg-white/10">
              <div className="text-2xl font-bold text-[#2DE2E6]">
                {rows.filter((r) => r.approval?.status === "pending").length}
              </div>
              <div className="text-white/80 text-sm">Pending Review</div>
            </div>
            <div className="rounded-lg p-4 text-center bg-white/10">
              <div className="text-2xl font-bold text-[#2DE2E6]">
                {rows.filter((r) => r.approval?.status === "approved").length}
              </div>
              <div className="text-white/80 text-sm">Approved Experts</div>
            </div>
            <div className="rounded-lg p-4 text-center bg-white/10">
              <div className="text-2xl font-bold text-[#2DE2E6]">
                {rows.filter((r) => r.approval?.status === "denied").length}
              </div>
              <div className="text-white/80 text-sm">Denied Requests</div>
            </div>
          </div>

          {/* Table / List */}
          <div className="mt-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-white">
                <div className="animate-spin h-12 w-12 rounded-full border-4 border-white/20 border-t-[#2DE2E6]" />
                <span className="mt-4 text-white/90">Loading experts…</span>
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-16 rounded-xl bg-white/10 animate-fade-in-up">
                <h3 className="text-xl font-bold text-white">
                  No {tab} experts found
                </h3>
                <p className="mt-2 text-white/80 max-w-md mx-auto">
                  {tab === "pending"
                    ? "When experts submit registration requests, they'll appear here for review."
                    : tab === "approved"
                    ? "No approved experts found. Approve pending requests to see them here."
                    : "No denied expert requests found."}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl bg-white/5">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-white/90">
                        <th className="p-4">Expert</th>
                        <th className="p-4 hidden md:table-cell">Contact</th>
                        <th className="p-4 hidden lg:table-cell">
                          Specialization
                        </th>
                        <th className="p-4 hidden sm:table-cell">Requested</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr
                          key={r._id}
                          className="odd:bg-white/5 even:bg-white/10 hover:bg-white/15 transition-all cursor-pointer"
                          onClick={() => setSelectedExpert(r)}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] flex items-center justify-center">
                                <span className="text-gray-900 font-bold">
                                  {r?.name?.charAt(0) || "E"}
                                </span>
                              </div>
                              <div>
                                <div className="text-white font-semibold">
                                  {r.name || "—"}
                                </div>
                                <div className="text-white/70 text-sm md:hidden">
                                  {EMAIL_RE.test(r.email) ? r.email : "—"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 text-white/90 hidden md:table-cell">
                            {EMAIL_RE.test(r.email) ? r.email : "—"}
                          </td>

                          <td className="p-4 hidden lg:table-cell">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-[#2DE2E6]">
                              {r.specialization || "—"}
                            </span>
                          </td>

                          <td className="p-4 text-white/80 hidden sm:table-cell">
                            {fmtDate(r?.approval?.requestedAt)}
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                                r?.approval?.status === "approved"
                                  ? "bg-[#2DE2E6]/10 text-[#2DE2E6]"
                                  : r?.approval?.status === "denied"
                                  ? "bg-[#FF6EC7]/10 text-[#FF6EC7]"
                                  : "bg-yellow-500/10 text-yellow-400"
                              }`}
                            >
                              {r?.approval?.status || "pending"}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            {tab === "pending" ? (
                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    approve(r._id);
                                  }}
                                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#2DE2E6] to-[#7df0f2] text-gray-900 hover:opacity-90 transition shadow-md cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deny(r._id);
                                  }}
                                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#FF6EC7] to-[#ff76cf] text-gray-900 hover:opacity-90 transition shadow-md cursor-pointer"
                                >
                                  Deny
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedExpert(r);
                                }}
                                className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                              >
                                View Details
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer hint */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-white/70">
              <span>
                Showing {rows.length} expert{rows.length !== 1 ? "s" : ""}
              </span>
              <span>Tip: Click any row to view details</span>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedExpert && (
        <ExpertDetailModal
          expert={selectedExpert}
          onClose={() => setSelectedExpert(null)}
        />
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
