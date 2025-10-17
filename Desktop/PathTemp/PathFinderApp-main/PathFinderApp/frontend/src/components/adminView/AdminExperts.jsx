import { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaTrash,
  FaEye,
  FaFilter,
  FaSort,
  FaUserTie,
  FaBuilding,
  FaGraduationCap,
  FaStar,
  FaEnvelope,
  FaLinkedin,
  FaSync,
} from "react-icons/fa";

/**
 * AdminExperts
 * - Lists experts with search/filter/sort
 * - Transparent page background (global background image shows through)
 * - Minimal borders, neon gradient accents, subtle blur/shadow cards
 * - Accessible buttons/labels and safe link validation
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isHttpUrl = (url = "") => /^(https?:)\/\//i.test(String(url).trim());

export default function AdminExperts() {
  const [experts, setExperts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("All");
  const [sortKey, setSortKey] = useState("newest"); // newest | oldest | name | experience
  const [detailExpert, setDetailExpert] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  /* ------------------------------ Data fetching ------------------------------ */
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      await fetchExperts(controller.signal);
    })();
    return () => controller.abort();
  }, []);

  const fetchExperts = async (signal) => {
    try {
      setIsLoading(true);
      setLoadError("");
      const res = await fetch("http://localhost:4000/expertRoute/getDetail", {
        headers: { Accept: "application/json" },
        signal,
      });
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      const data = await res.json();

      const normalized = Array.isArray(data)
        ? data.map((e, i) => ({
            _id: e?._id || e?.email || `exp_${i}`,
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
            createdAt: e?.createdAt || null,
          }))
        : [];

      setExperts(normalized);
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error(err);
        setLoadError("Failed to load experts. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------- Delete --------------------------------- */
  const openDeleteConfirm = (expert) => {
    setPendingDelete(expert);
    setIsDeleteOpen(true);
  };
  const closeDeleteConfirm = () => {
    setIsDeleteOpen(false);
    setPendingDelete(null);
  };
  const deleteExpert = async () => {
    if (!pendingDelete?._id) return;
    try {
      const res = await fetch(
        `http://localhost:4000/expertRoute/experts/${pendingDelete._id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("DELETE_FAILED");
      setExperts((prev) => prev.filter((e) => e._id !== pendingDelete._id));
      closeDeleteConfirm();
    } catch (err) {
      console.error(err);
      setLoadError("Failed to delete expert. Please try again.");
    }
  };

  /* ----------------------------- Filters & Sorts ----------------------------- */
  const specializations = useMemo(() => {
    const set = new Set(
      experts
        .map((e) => e.specialization)
        .filter((s) => typeof s === "string" && s.trim() !== "")
    );
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [experts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = experts.filter((e) => {
      const specOk =
        specializationFilter === "All" ||
        e.specialization === specializationFilter;
      if (!q) return specOk;

      // Search across key fields
      const inName = e.name.toLowerCase().includes(q);
      const inEmail = e.email.toLowerCase().includes(q);
      const inSpec = e.specialization.toLowerCase().includes(q);
      const inOrg = e.organization.toLowerCase().includes(q);
      const inSkills = (e.skills || []).some((s) =>
        String(s).toLowerCase().includes(q)
      );
      return specOk && (inName || inEmail || inSpec || inOrg || inSkills);
    });

    const by = {
      newest: (a, b) =>
        (new Date(b.createdAt).getTime() || 0) -
        (new Date(a.createdAt).getTime() || 0),
      oldest: (a, b) =>
        (new Date(a.createdAt).getTime() || 0) -
        (new Date(b.createdAt).getTime() || 0),
      name: (a, b) => a.name.localeCompare(b.name),
      experience: (a, b) => b.experience - a.experience,
    }[sortKey];

    return [...list].sort(by || (() => 0));
  }, [experts, query, specializationFilter, sortKey]);

  /* ---------------------------------- UI ---------------------------------- */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-transparent animate-fade-in">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-white/20 border-t-[#2DE2E6] mx-auto" />
          <p className="mt-4 text-white/90">Loading experts…</p>
        </div>
      </div>
    );
  }

  if (loadError && experts.length === 0) {
    return (
      <div className="min-h-screen p-8 bg-transparent animate-fade-in-up">
        <div className="max-w-2xl mx-auto rounded-2xl p-6 bg-black/60 backdrop-blur shadow-xl text-center">
          <p className="text-red-300 mb-4">{loadError}</p>
          <button
            type="button"
            onClick={() => fetchExperts()}
            className="inline-flex items-center bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition cursor-pointer"
          >
            <FaSync className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="p-8 bg-transparent animate-fade-in-up mt-16">
        <h1 className="text-4xl font-extrabold text-center text-white bg-clip-text bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] drop-shadow">
          Expert Management
        </h1>
        <p className="text-center text-white mt-4 text-lg drop-shadow">
          Manage and review all registered experts.
        </p>
      </div>

      {/* Controls */}
      <div className="p-8 space-y-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl p-6 bg-black/60 backdrop-blur shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
                    aria-label="Search experts"
                    placeholder="Search experts by name, email, org, specialization, or skill…"
                    className="pl-10 pr-4 py-3 w-full rounded-lg bg-white/15 text-white placeholder:text-gray-200 focus:ring-2 focus:ring-[#2DE2E6]"
                    value={query}
                    onChange={(e) => setQuery(e.target.value.slice(0, 120))}
                  />
                </div>
              </div>

              {/* Specialization */}
              <div>
                <div className="flex items-center mb-2 text-white/80">
                  <FaFilter className="mr-2" />
                  <label className="text-sm">Specialization</label>
                </div>
                <select
                  aria-label="Filter by specialization"
                  className="w-full px-4 py-3 rounded-lg bg-white/15 text-white focus:ring-2 focus:ring-[#2DE2E6] cursor-pointer"
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                >
                  {specializations.map((s) => (
                    <option className="bg-[#0b0d14]" key={s} value={s}>
                      {s}
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
                  aria-label="Sort experts"
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
                  <option className="bg-[#0b0d14]" value="name">
                    Name (A–Z)
                  </option>
                  <option className="bg-[#0b0d14]" value="experience">
                    Experience (High → Low)
                  </option>
                </select>
              </div>
            </div>

            {/* Top Row: Refresh + Count */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => fetchExperts()}
                className="inline-flex items-center bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition cursor-pointer"
              >
                <FaSync className="mr-2" />
                Refresh
              </button>
              <div className="text-white/90">
                Total Experts:{" "}
                <span className="font-semibold text-[#2DE2E6]">
                  {experts.length}
                </span>
              </div>
            </div>
          </div>

          {/* Error banner (non-blocking) */}
          {loadError && (
            <div className="mt-6 rounded-2xl p-4 bg-black/60 backdrop-blur shadow-xl text-center animate-fade-in">
              <p className="text-red-300">{loadError}</p>
            </div>
          )}

          {/* Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center rounded-2xl p-8 bg-black/60 backdrop-blur shadow-xl">
                <div className="text-white/90 text-lg mb-2">
                  No experts found
                </div>
                <p className="text-white/70">
                  {experts.length === 0
                    ? "No experts have registered yet."
                    : "Try adjusting your filters or search terms."}
                </p>
              </div>
            ) : (
              filtered.map((ex) => {
                const photoSrc = ex.photo
                  ? (ex.photo.startsWith("http")
                      ? ex.photo
                      : `http://localhost:4000/${ex.photo}`
                    ).replace(/([^:]\/)\/+/g, "$1")
                  : "";

                const showLinkedIn = isHttpUrl(ex.linkedin);
                const showEmail = EMAIL_RE.test(ex.email);

                return (
                  <div
                    key={ex._id}
                    className="rounded-2xl p-6 bg-black/60 backdrop-blur shadow-xl hover:ring-2 hover:ring-[#2DE2E6] transition-all"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {photoSrc ? (
                        <img
                          src={photoSrc}
                          alt={ex.name}
                          className="w-16 h-16 rounded-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] flex items-center justify-center">
                          <span className="text-gray-900 font-bold text-xl">
                            {ex.name?.[0] ?? "E"}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white">
                          {ex.name}
                        </h3>
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

                    <div className="space-y-3 mb-4 text-white/90 text-sm">
                      <div className="flex items-center">
                        <FaBuilding className="mr-2 text-[#2DE2E6]" />
                        <span>{ex.organization || "—"}</span>
                      </div>
                      <div className="flex items-center">
                        <FaStar className="mr-2 text-[#2DE2E6]" />
                        <span>{ex.specialization || "—"}</span>
                      </div>
                      <div className="flex items-center">
                        <FaGraduationCap className="mr-2 text-[#2DE2E6]" />
                        <span>{ex.qualification || "—"}</span>
                      </div>
                      <div className="flex items-center">
                        <FaStar className="mr-2 text-[#2DE2E6]" />
                        <span>{ex.experience} years of experience</span>
                      </div>

                      {showEmail && (
                        <div className="flex items-center">
                          <FaEnvelope className="mr-2 text-[#2DE2E6]" />
                          <span className="truncate">{ex.email}</span>
                        </div>
                      )}

                      {showLinkedIn && (
                        <div className="flex items-center">
                          <FaLinkedin className="mr-2 text-[#2DE2E6]" />
                          <a
                            href={ex.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#2DE2E6] hover:text-[#FF6EC7] transition-colors cursor-pointer truncate"
                          >
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>

                    {ex.bio && (
                      <p className="text-white/80 text-sm mb-4 line-clamp-3">
                        {ex.bio}
                      </p>
                    )}

                    {ex.skills?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-white/80 text-sm font-medium mb-2">
                          Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {ex.skills.slice(0, 4).map((s, i) => (
                            <span
                              key={`${ex._id}_skill_${i}`}
                              className="bg-white/10 text-[#2DE2E6] text-xs px-2 py-1 rounded-full"
                            >
                              {s}
                            </span>
                          ))}
                          {ex.skills.length > 4 && (
                            <span className="bg-white/10 text-white/80 text-xs px-2 py-1 rounded-full">
                              +{ex.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          setDetailExpert(
                            detailExpert?._id === ex._id ? null : ex
                          )
                        }
                        className="inline-flex items-center bg-white/10 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        <FaEye className="mr-2" />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteConfirm(ex)}
                        className="inline-flex items-center bg-[#ff6eaa]/20 text-[#ff6eaa] px-3 py-2 rounded-lg hover:bg-[#ff6eaa]/30 transition-colors cursor-pointer"
                      >
                        <FaTrash className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {isDeleteOpen && pendingDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl p-6 bg-black/70 backdrop-blur-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">
              Confirm Deletion
            </h3>
            <p className="text-white/90 mb-6">
              Are you sure you want to delete{" "}
              <span className="text-[#2DE2E6]">{pendingDelete.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteExpert}
                className="px-4 py-2 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 font-semibold rounded-lg hover:opacity-90 transition cursor-pointer"
              >
                Delete Expert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailExpert && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl p-6 bg-black/70 backdrop-blur-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-white">Expert Details</h3>
              <button
                type="button"
                onClick={() => setDetailExpert(null)}
                className="text-white hover:text-white/90 text-2xl leading-none cursor-pointer"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-shrink-0">
                {detailExpert.photo ? (
                  <img
                    src={
                      detailExpert.photo.startsWith("http")
                        ? detailExpert.photo
                        : `http://localhost:4000/${detailExpert.photo}`
                    }
                    alt={detailExpert.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] flex items-center justify-center mx-auto">
                    <span className="text-gray-900 font-bold text-4xl">
                      {detailExpert.name?.[0] ?? "E"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {detailExpert.name}
                </h3>
                <p className="text-[#2DE2E6] text-lg mb-4">
                  {detailExpert.title}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90">
                  <div className="flex items-center">
                    <FaBuilding className="mr-2 text-[#2DE2E6]" />
                    <span>{detailExpert.organization || "—"}</span>
                  </div>
                  <div className="flex items-center">
                    <FaStar className="mr-2 text-[#2DE2E6]" />
                    <span>{detailExpert.specialization || "—"}</span>
                  </div>
                  <div className="flex items-center">
                    <FaGraduationCap className="mr-2 text-[#2DE2E6]" />
                    <span>{detailExpert.qualification || "—"}</span>
                  </div>
                  <div className="flex items-center">
                    <FaStar className="mr-2 text-[#2DE2E6]" />
                    <span>{detailExpert.experience} years experience</span>
                  </div>
                  {EMAIL_RE.test(detailExpert.email) && (
                    <div className="flex items-center">
                      <FaEnvelope className="mr-2 text-[#2DE2E6]" />
                      <span>{detailExpert.email}</span>
                    </div>
                  )}
                  {isHttpUrl(detailExpert.linkedin) && (
                    <div className="flex items-center">
                      <FaLinkedin className="mr-2 text-[#2DE2E6]" />
                      <a
                        href={detailExpert.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2DE2E6] hover:text-[#FF6EC7] transition-colors cursor-pointer"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {detailExpert.bio && (
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-2">Bio</h4>
                <p className="text-white/90">{detailExpert.bio}</p>
              </div>
            )}

            {detailExpert.skills?.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-2">
                  Skills &amp; Expertise
                </h4>
                <div className="flex flex-wrap gap-2">
                  {detailExpert.skills.map((s, i) => (
                    <span
                      key={`${detailExpert._id}_mskill_${i}`}
                      className="bg-white/10 text-[#2DE2E6] px-3 py-1 rounded-full text-sm"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setDetailExpert(null)}
                className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
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
