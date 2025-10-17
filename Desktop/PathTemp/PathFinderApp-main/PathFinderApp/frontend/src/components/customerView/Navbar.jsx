import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaGraduationCap } from "react-icons/fa";

/**
 * Public Navbar (styled like AdminNavbar; uses color emojis)
 * - Glassy rounded bar, separators, gradient CTA
 * - Emoji nav items (🏠 ℹ️ ✉️)
 * - Accessible: Esc closes mobile menu, aria-* on controls
 * - Lightweight micro-animations
 */
function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu via Escape key
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && setIsMenuOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Desktop link styles (Admin-like pills)
  const desktopLinkClasses = (isActive) =>
    [
      "flex items-center px-4 py-3 rounded-xl text-sm font-semibold tracking-wide",
      "transition-all duration-300 cursor-pointer",
      isActive
        ? "text-[#2DE2E6] bg-[#2DE2E6]/10 shadow-lg shadow-[#2DE2E6]/20 ring-1 ring-inset ring-[#2DE2E6]/40 backdrop-blur"
        : "text-gray-300 hover:text-[#2DE2E6] hover:bg-[#2DE2E6]/5",
    ].join(" ");

  // Mobile link styles (Admin-like)
  const mobileLinkClasses = (isActive) =>
    [
      "flex items-center px-4 py-4 rounded-xl text-base font-semibold",
      "transition-all duration-300 cursor-pointer",
      isActive
        ? "text-[#2DE2E6] bg-[#2DE2E6]/10 ring-1 ring-inset ring-[#2DE2E6]/40"
        : "text-gray-300 hover:text-[#2DE2E6] hover:bg-[#2DE2E6]/5",
    ].join(" ");

  // Emoji nav items
  const navItems = [
    { path: "/", label: "HOME", emoji: "🏠" },
    { path: "/about", label: "ABOUT", emoji: "ℹ️" },
    { path: "/contact", label: "CONTACT", emoji: "✉️" },
  ];

  return (
    <>
      <nav className="fixed z-50 top-3 left-0 right-0 max-w-[99%] mx-auto">
        <div className="mx-2 rounded-3xl">
          {/* Glassy bar */}
          <div className="bg-[#1D1E2C]/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/30 px-3 sm:px-4 animate-fade-in-up">
            <div className="flex h-14 sm:h-16 items-center justify-between">
              {/* Brand */}
              <NavLink
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 group cursor-pointer"
                aria-label="Go to home"
              >
                <div className="p-2 rounded-2xl bg-gradient-to-br from-[#2DE2E6] to-[#FF6EC7] transition-transform duration-300 group-hover:scale-110">
                  <FaGraduationCap
                    className="text-[#1D1E2C] text-lg"
                    aria-hidden
                  />
                </div>
                <div className="leading-tight">
                  <div className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] bg-clip-text text-transparent">
                    PathFinder
                  </div>
                  <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold text-white/90 bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 px-2 py-0.5 rounded-xl">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400/80" />
                    Public
                  </div>
                </div>
              </NavLink>

              {/* Desktop nav */}
              <div className="hidden lg:flex items-center gap-1">
                {navItems.map(({ path, label, emoji }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) => desktopLinkClasses(isActive)}
                    title={label}
                  >
                    <span aria-hidden="true" className="mr-2">
                      {emoji}
                    </span>
                    {label}
                  </NavLink>
                ))}

                {/* Divider */}
                <span className="mx-2 h-6 w-px bg-white/10" />

                {/* Login CTA (gradient pill) */}
                <NavLink
                  to="/login"
                  className="ml-1 inline-flex items-center gap-2 px-5 py-2 rounded-2xl font-semibold text-[#1D1E2C] bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] hover:shadow-lg hover:shadow-[#2DE2E6]/30 transition-all duration-300 cursor-pointer"
                  title="Login"
                >
                  <span aria-hidden className="text-base">
                    🔑
                  </span>
                  Login
                </NavLink>
              </div>

              {/* Mobile toggle */}
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                aria-controls="public-mobile-menu"
                onClick={() => setIsMenuOpen((v) => !v)}
                className={`lg:hidden p-2.5 rounded-2xl transition-all duration-300 cursor-pointer ${
                  isMenuOpen
                    ? "bg-[#FF6EC7]/10 text-[#FF6EC7]"
                    : "bg-[#2DE2E6]/10 text-[#2DE2E6] hover:bg-[#2DE2E6]/20"
                }`}
              >
                {isMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div
            id="public-mobile-menu"
            className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
              isMenuOpen ? "max-height-open opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="mt-2 bg-[#1D1E2C]/95 backdrop-blur-xl rounded-3xl px-3 py-3 animate-slide-down">
              <div className="flex flex-col gap-2">
                {navItems.map(({ path, label, emoji }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) => mobileLinkClasses(isActive)}
                    title={label}
                  >
                    <span aria-hidden="true" className="mr-3">
                      {emoji}
                    </span>
                    {label}
                  </NavLink>
                ))}

                {/* Divider */}
                <div className="my-2 h-px w-full bg-white/10" />

                {/* Login CTA */}
                <NavLink
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-semibold text-[#1D1E2C] bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] hover:shadow-lg hover:shadow-[#2DE2E6]/30 transition-all duration-300 cursor-pointer"
                  title="Login"
                >
                  <span aria-hidden className="text-base">
                    🔑
                  </span>
                  Login
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* micro-animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0 } to { opacity: 1 }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px) }
          100% { opacity: 1; transform: translateY(0) }
        }
        @keyframes slide-down {
          0% { opacity: 0; transform: translateY(-6px) }
          100% { opacity: 1; transform: translateY(0) }
        }
        .animate-fade-in { animation: fade-in .5s ease-out both }
        .animate-fade-in-up { animation: fade-in-up .55s cubic-bezier(.2,.65,.2,1) both }
        .animate-slide-down { animation: slide-down .35s cubic-bezier(.2,.65,.2,1) both }
        .max-height-open { max-height: 520px }
      `}</style>
    </>
  );
}

export default Navbar;
