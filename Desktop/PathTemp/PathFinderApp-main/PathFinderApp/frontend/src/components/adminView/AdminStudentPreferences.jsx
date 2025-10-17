import { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaEye,
  FaUserGraduate,
  FaChartLine,
  FaStar,
  FaSync,
  FaDownload,
  FaCode,
  FaNetworkWired,
  FaShieldAlt,
  FaPalette,
  FaDatabase,
  FaCog,
} from "react-icons/fa";

/* -------------------------------------------------------------------------- */
/*                         AdminStudentPreferences (Clean)                     */
/* -------------------------------------------------------------------------- */

const TRACK_FALLBACK = "Not Specified";

export default function AdminStudentPreferences() {
  const [prefs, setPrefs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("All");
  const [sortKey, setSortKey] = useState("newest"); // newest | oldest | email
  const [selectedPref, setSelectedPref] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // details | ai | skills
  const [, setStats] = useState(null);

  /* ------------------------------ Data Fetching ------------------------------ */
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      await fetchPreferences(controller.signal);
      await fetchStats(controller.signal);
    })();
    return () => controller.abort();
  }, []);

  const fetchPreferences = async (signal) => {
    try {
      setIsLoading(true);
      setLoadError("");
      const res = await fetch(
        "http://localhost:4000/aiRoute/getPreferDetails",
        {
          headers: { Accept: "application/json" },
          signal,
        }
      );
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      const data = await res.json();

      const list = Array.isArray(data?.preferences) ? data.preferences : [];
      const normalized = list.map((p, i) => ({
        _id: p?._id || p?.email || `pref_${i}`,
        email: String(p?.email || "").trim(),
        currentYear: Number.isFinite(Number(p?.currentYear))
          ? Number(p.currentYear)
          : null,
        currentSemester: Number.isFinite(Number(p?.currentSemester))
          ? Number(p.currentSemester)
          : null,
        cgpa: p?.cgpa ?? null,
        workStyle: String(p?.workStyle || "").trim(),
        debugPatience: String(p?.debugPatience || "").trim(),
        excitement: String(p?.excitement || "").trim(),
        wantsResearchPath: Boolean(p?.wantsResearchPath),
        alStream: String(p?.alStream || "").trim(),
        hasPhysicsAndCombinedMaths: Boolean(p?.hasPhysicsAndCombinedMaths),
        subjects: Array.isArray(p?.subjects) ? p.subjects.filter(Boolean) : [],
        careerGoals: Array.isArray(p?.careerGoals)
          ? p.careerGoals.filter(Boolean)
          : [],
        languages: Array.isArray(p?.languages)
          ? p.languages.filter(Boolean)
          : [],
        programmingSkill: Number.isFinite(Number(p?.programmingSkill))
          ? Number(p.programmingSkill)
          : 0,
        mathSkill: Number.isFinite(Number(p?.mathSkill))
          ? Number(p.mathSkill)
          : 0,
        cyberSkill: Number.isFinite(Number(p?.cyberSkill))
          ? Number(p.cyberSkill)
          : 0,
        uiuxSkill: Number.isFinite(Number(p?.uiuxSkill))
          ? Number(p.uiuxSkill)
          : 0,
        researchSkill: Number.isFinite(Number(p?.researchSkill))
          ? Number(p.researchSkill)
          : 0,
        motivation: Number.isFinite(Number(p?.motivation))
          ? Number(p.motivation)
          : 0,
        hardwareInterest: String(p?.hardwareInterest || "").trim(),
        designCreativity: String(p?.designCreativity || "").trim(),
        dataHandlingComfort: String(p?.dataHandlingComfort || "").trim(),
        securityMindset: String(p?.securityMindset || "").trim(),
        aiRecommendation: p?.aiRecommendation || null,
        createdAt: p?.createdAt || null,
        additional: String(p?.additional || "").trim(),
      }));

      setPrefs(normalized);
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error(err);
        setLoadError(
          "Failed to load student preferences. Please try again later."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async (signal) => {
    try {
      const res = await fetch(
        "http://localhost:4000/aiRoute/getPreferDetailsStats",
        {
          headers: { Accept: "application/json" },
          signal,
        }
      );
      if (res.ok) {
        const data = await res.json();
        setStats(data || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* -------------------------------- Utilities -------------------------------- */
  const getTrack = (p) =>
    String(
      p?.aiRecommendation?.recommendations?.[0]?.track || TRACK_FALLBACK
    ).trim();

  const getSpecializationIcon = (track) => {
    switch (track) {
      case "Software Engineering":
        return <FaCode className="text-[#2DE2E6]" />;
      case "Data Science":
        return <FaDatabase className="text-[#2DE2E6]" />;
      case "Cyber Security":
        return <FaShieldAlt className="text-[#2DE2E6]" />;
      case "UI/UX Design":
        return <FaPalette className="text-[#2DE2E6]" />;
      case "Network Engineering":
        return <FaNetworkWired className="text-[#2DE2E6]" />;
      case "Cloud Computing":
        return <FaCog className="text-[#2DE2E6]" />;
      case "AI/ML":
        return <FaChartLine className="text-[#2DE2E6]" />;
      default:
        return <FaStar className="text-[#2DE2E6]" />;
    }
  };

  /* ------------------------------ Filters/Sorters ----------------------------- */
  const specializationOptions = useMemo(() => {
    const set = new Set(prefs.map(getTrack).filter(Boolean));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [prefs]);

  const filteredPrefs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = prefs.filter((p) => {
      const track = getTrack(p);
      const specOk =
        specializationFilter === "All" || track === specializationFilter;

      if (!q) return specOk;

      const inEmail = p.email.toLowerCase().includes(q);
      const inTrack = track.toLowerCase().includes(q);
      return specOk && (inEmail || inTrack);
    });

    const by = {
      newest: (a, b) =>
        (new Date(b.createdAt).getTime() || 0) -
        (new Date(a.createdAt).getTime() || 0),
      oldest: (a, b) =>
        (new Date(a.createdAt).getTime() || 0) -
        (new Date(b.createdAt).getTime() || 0),
      email: (a, b) => a.email.localeCompare(b.email),
    }[sortKey];

    return [...list].sort(by || (() => 0));
  }, [prefs, query, specializationFilter, sortKey]);

  /* --------------------------------- Exports --------------------------------- */
  const exportToCSV = () => {
    const headers = [
      "Email",
      "Specialization",
      "CGPA",
      "Year",
      "Skills",
      "Career Goals",
      "Assessment Date",
    ];

    const rows = filteredPrefs.map((p) => [
      p.email || "",
      getTrack(p),
      p.cgpa ?? "N/A",
      `Year ${p.currentYear ?? "?"}, Sem ${p.currentSemester ?? "?"}`,
      Array.isArray(p?.skills)
        ? p.skills.join(", ")
        : Array.isArray(p?.languages)
        ? p.languages.join(", ")
        : "N/A",
      Array.isArray(p.careerGoals) ? p.careerGoals.join(", ") : "N/A",
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A",
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_preferences.csv";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /* ---------------------------------- UI ---------------------------------- */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-transparent animate-fade-in">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-white/20 border-t-[#2DE2E6] mx-auto" />
          <p className="mt-4 text-white/90">Loading student preferences…</p>
        </div>
      </div>
    );
  }

  if (loadError && prefs.length === 0) {
    return (
      <div className="min-h-screen p-8 bg-transparent animate-fade-in-up">
        <div className="max-w-2xl mx-auto rounded-2xl p-6 bg-black/60 backdrop-blur shadow-xl text-center">
          <p className="text-red-300 mb-4">{loadError}</p>
          <button
            type="button"
            onClick={() => fetchPreferences()}
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
          Student Preferences
        </h1>
        <p className="text-center text-white mt-4 text-lg drop-shadow">
          Explore the preferences submitted by all registered students.
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
                    aria-label="Search students or specializations"
                    placeholder="Search students or specializations..."
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
                  {specializationOptions.map((s) => (
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
                  aria-label="Sort preferences"
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
                  <option className="bg-[#0b0d14]" value="email">
                    Email (A–Z)
                  </option>
                </select>
              </div>
            </div>

            {/* Top Row: Export / Refresh / Count */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={exportToCSV}
                  className="inline-flex items-center bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <FaDownload className="mr-2" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => fetchPreferences()}
                  className="inline-flex items-center bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition cursor-pointer"
                >
                  <FaSync className="mr-2" />
                  Refresh
                </button>
              </div>
              <div className="text-white/90">
                Total:{" "}
                <span className="font-semibold text-[#2DE2E6]">
                  {prefs.length}
                </span>
              </div>
            </div>
          </div>

          {/* Error (non-blocking) */}
          {loadError && (
            <div className="mt-6 rounded-2xl p-4 bg-black/60 backdrop-blur shadow-xl text-center animate-fade-in">
              <p className="text-red-300">{loadError}</p>
            </div>
          )}

          {/* Preferences Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 animate-fade-in-up">
            {filteredPrefs.length === 0 ? (
              <div className="text-center rounded-2xl p-8 bg-black/60 backdrop-blur shadow-xl">
                <div className="text-white/90 text-lg mb-2">
                  No student preferences found
                </div>
                <p className="text-white/70">
                  {prefs.length === 0
                    ? "No students have completed assessments yet."
                    : "Try adjusting your filters or search terms."}
                </p>
              </div>
            ) : (
              filteredPrefs.map((p) => {
                const track = getTrack(p);
                const rec = p?.aiRecommendation?.recommendations?.[0] || null;

                return (
                  <div
                    key={p._id}
                    className="rounded-2xl p-6 bg-black/60 backdrop-blur shadow-xl hover:ring-2 hover:ring-[#2DE2E6] transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] flex items-center justify-center mr-4">
                            <FaUserGraduate className="text-gray-900" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {p.email || "Unknown"}
                            </h3>
                            <p className="text-white/80">
                              Year {p.currentYear ?? "?"}, Semester{" "}
                              {p.currentSemester ?? "?"}
                              {p.cgpa ? ` • CGPA: ${p.cgpa}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          {rec && (
                            <div className="flex items-center bg-white/10 text-[#2DE2E6] px-3 py-1 rounded-full text-sm">
                              {getSpecializationIcon(track)}
                              <span className="ml-2">{track}</span>
                              {Number.isFinite(Number(rec?.percentage)) && (
                                <span className="ml-2 font-bold">
                                  {rec.percentage}%
                                </span>
                              )}
                            </div>
                          )}

                          {p.workStyle && (
                            <div className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm">
                              Prefers {p.workStyle} work
                            </div>
                          )}

                          {Array.isArray(p.careerGoals) &&
                            p.careerGoals.length > 0 && (
                              <div className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-sm">
                                {p.careerGoals.length} career goals
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPref(p);
                            setActiveTab("details");
                          }}
                          className="inline-flex items-center bg-white/10 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                        >
                          <FaEye className="mr-2" />
                          View Details
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/90">
                      <SkillStars
                        label="Programming"
                        value={p.programmingSkill}
                      />
                      <SkillStars label="Math" value={p.mathSkill} />
                      <SkillStars label="Cyber" value={p.cyberSkill} />
                      <SkillStars label="UI/UX" value={p.uiuxSkill} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPref && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-black/70 backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-white">
                Student Assessment Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPref(null)}
                className="text-white hover:text-white/90 text-2xl leading-none cursor-pointer"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] flex items-center justify-center mr-4">
                <FaUserGraduate className="text-gray-900 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedPref.email || "Unknown"}
                </h3>
                <p className="text-white/80">
                  Year {selectedPref.currentYear ?? "?"}, Semester{" "}
                  {selectedPref.currentSemester ?? "?"}
                  {selectedPref.cgpa ? ` • CGPA: ${selectedPref.cgpa}` : ""}
                </p>
              </div>
            </div>

            <div className="border-b border-white/10 mb-6" />

            <div className="flex space-x-4">
              <button
                type="button"
                className={`py-2 px-4 rounded-lg cursor-pointer transition ${
                  activeTab === "details"
                    ? "bg-white/10 text-[#2DE2E6]"
                    : "text-white/70 hover:bg-white/5"
                }`}
                onClick={() => setActiveTab("details")}
              >
                Details
              </button>
              <button
                type="button"
                className={`py-2 px-4 rounded-lg cursor-pointer transition ${
                  activeTab === "ai"
                    ? "bg-white/10 text-[#2DE2E6]"
                    : "text-white/70 hover:bg-white/5"
                }`}
                onClick={() => setActiveTab("ai")}
              >
                AI Recommendations
              </button>
              <button
                type="button"
                className={`py-2 px-4 rounded-lg cursor-pointer transition ${
                  activeTab === "skills"
                    ? "bg-white/10 text-[#2DE2E6]"
                    : "text-white/70 hover:bg-white/5"
                }`}
                onClick={() => setActiveTab("skills")}
              >
                Skills
              </button>
            </div>

            {/* Details */}
            {activeTab === "details" && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white/70 font-medium mb-2">
                    Academic Information
                  </h4>
                  <div className="space-y-2 text-white/90">
                    <p>Year: {selectedPref.currentYear ?? "Not specified"}</p>
                    <p>
                      Semester:{" "}
                      {selectedPref.currentSemester ?? "Not specified"}
                    </p>
                    <p>CGPA: {selectedPref.cgpa ?? "Not specified"}</p>
                    <p>AL Stream: {selectedPref.alStream || "Not specified"}</p>
                    {selectedPref.hasPhysicsAndCombinedMaths && (
                      <p className="text-[#2DE2E6]">
                        Has Physics and Combined Maths
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-white/70 font-medium mb-2">
                    Preferences
                  </h4>
                  <div className="space-y-2 text-white/90">
                    <p>Work Style: {selectedPref.workStyle || "—"}</p>
                    <p>Debug Patience: {selectedPref.debugPatience || "—"}</p>
                    <p>Excitement: {selectedPref.excitement || "—"}</p>
                    <p>
                      Research Interest:{" "}
                      {selectedPref.wantsResearchPath ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {Array.isArray(selectedPref.subjects) &&
                  selectedPref.subjects.length > 0 && (
                    <div>
                      <h4 className="text-white/70 font-medium mb-2">
                        Favorite Subjects
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPref.subjects.map((s, i) => (
                          <span
                            key={`subj_${i}`}
                            className="bg-white/10 text-[#2DE2E6] px-3 py-1 rounded-full text-sm"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {Array.isArray(selectedPref.careerGoals) &&
                  selectedPref.careerGoals.length > 0 && (
                    <div>
                      <h4 className="text-white/70 font-medium mb-2">
                        Career Goals
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPref.careerGoals.map((g, i) => (
                          <span
                            key={`goal_${i}`}
                            className="bg-white/10 text-[#FF6EC7] px-3 py-1 rounded-full text-sm"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedPref.additional && (
                  <div className="md:col-span-2">
                    <h4 className="text-white/70 font-medium mb-2">
                      Additional Notes
                    </h4>
                    <p className="text-white/90 bg-white/10 p-4 rounded-lg">
                      {selectedPref.additional}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* AI Recommendations */}
            {activeTab === "ai" && selectedPref.aiRecommendation && (
              <div className="mt-6">
                <h4 className="text-white/70 font-medium mb-4">
                  AI Recommendations
                </h4>

                {selectedPref.aiRecommendation.summary && (
                  <div className="mb-6">
                    <p className="text-white font-medium mb-2">Summary</p>
                    <p className="text-white/90 bg-white/10 p-4 rounded-lg whitespace-pre-line">
                      {selectedPref.aiRecommendation.summary}
                    </p>
                  </div>
                )}

                {Array.isArray(
                  selectedPref.aiRecommendation.recommendations
                ) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {selectedPref.aiRecommendation.recommendations.map(
                      (rec, i) => (
                        <div
                          key={`rec_${i}`}
                          className="bg-white/10 p-4 rounded-lg"
                        >
                          <div className="flex items-center mb-3">
                            {getSpecializationIcon(rec.track)}
                            <h5 className="text-white font-medium ml-2">
                              {rec.track}
                            </h5>
                            {Number.isFinite(Number(rec?.percentage)) && (
                              <span className="ml-auto bg-white/10 text-[#2DE2E6] px-2 py-1 rounded-full text-sm font-bold">
                                {rec.percentage}%
                              </span>
                            )}
                          </div>
                          {rec.reason && (
                            <p className="text-white/90 text-sm mb-3">
                              {rec.reason}
                            </p>
                          )}

                          {Array.isArray(rec.roles) && rec.roles.length > 0 && (
                            <div className="mb-2">
                              <p className="text-white/70 text-xs mb-1">
                                Potential Roles:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {rec.roles.slice(0, 3).map((role, idx) => (
                                  <span
                                    key={`role_${i}_${idx}`}
                                    className="bg-white/10 text-white/90 px-2 py-1 rounded text-xs"
                                  >
                                    {role}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {rec.learningEase && (
                            <p className="text-white/70 text-xs">
                              Learning:{" "}
                              <span className="text-white/90">
                                {rec.learningEase}
                              </span>
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}

                {Array.isArray(selectedPref.aiRecommendation.expertTypes) && (
                  <div>
                    <p className="text-white font-medium mb-2">
                      Recommended Expert Types
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPref.aiRecommendation.expertTypes.map((t, i) => (
                        <span
                          key={`ext_${i}`}
                          className="bg-white/10 text-[#2DE2E6] px-3 py-1 rounded-full text-sm"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Skills */}
            {activeTab === "skills" && (
              <div className="mt-6">
                <h4 className="text-white/70 font-medium mb-4">
                  Skill Assessment
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-white/70 mb-2">Technical Skills</p>
                    <div className="space-y-3">
                      <SkillStars
                        label="Programming"
                        value={selectedPref.programmingSkill}
                        big
                      />
                      <SkillStars
                        label="Mathematics"
                        value={selectedPref.mathSkill}
                        big
                      />
                      <SkillStars
                        label="Cyber Security"
                        value={selectedPref.cyberSkill}
                        big
                      />
                      <SkillStars
                        label="UI/UX Design"
                        value={selectedPref.uiuxSkill}
                        big
                      />
                      <SkillStars
                        label="Research"
                        value={selectedPref.researchSkill}
                        big
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-white/70 mb-2">Interests & Attributes</p>
                    <div className="space-y-3 text-white/90">
                      <SkillStars
                        label="Motivation Level"
                        value={selectedPref.motivation}
                        big
                      />
                      <div className="flex items-center justify-between">
                        <span>Hardware Interest</span>
                        <span className="capitalize">
                          {selectedPref.hardwareInterest?.toLowerCase() || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Design Creativity</span>
                        <span className="capitalize">
                          {selectedPref.designCreativity?.toLowerCase() || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Data Handling Comfort</span>
                        <span className="capitalize">
                          {selectedPref.dataHandlingComfort?.toLowerCase() ||
                            "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Security Mindset</span>
                        <span className="capitalize">
                          {selectedPref.securityMindset?.toLowerCase() || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {Array.isArray(selectedPref.languages) &&
                  selectedPref.languages.length > 0 && (
                    <div>
                      <p className="text-white/70 mb-2">
                        Programming Languages
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPref.languages.map((lang, i) => (
                          <span
                            key={`lang_${i}`}
                            className="bg-white/10 text-[#2DE2E6] px-3 py-1 rounded-full text-sm"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
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

/* --------------------------------- Helpers --------------------------------- */

function SkillStars({ label, value = 0, big = false }) {
  const size = big ? 16 : 12;
  return (
    <div>
      <p className="text-white/70">{label}</p>
      <div className="flex items-center mt-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <FaStar
            key={s}
            size={size}
            className={s <= Number(value) ? "text-yellow-400" : "text-white/20"}
          />
        ))}
      </div>
    </div>
  );
}
