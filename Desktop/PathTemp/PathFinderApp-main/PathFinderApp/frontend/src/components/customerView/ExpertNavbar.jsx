import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaUser, FaRocket } from "react-icons/fa";

/**
 * ExpertNavbar with emojis on nav items (matching UserNavbar style)
 */
function ExpertNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && setIsMenuOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const desktopLinkClasses = (isActive) =>
    `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
      isActive
        ? "text-[#2DE2E6] bg-[#2DE2E6]/10 shadow-lg shadow-[#2DE2E6]/20 scale-105"
        : "text-gray-300 hover:text-[#2DE2E6] hover:bg-[#2DE2E6]/5"
    }`;

  const mobileLinkClasses = (isActive) =>
    `flex items-center px-4 py-4 rounded-xl text-base font-medium transition-all duration-300 cursor-pointer ${
      isActive
        ? "text-[#2DE2E6] bg-[#2DE2E6]/10 shadow-lg shadow-[#2DE2E6]/20"
        : "text-gray-300 hover:text-[#2DE2E6] hover:bg-[#2DE2E6]/5"
    }`;

  const navItems = [
    { path: "/expertHome", label: "HOME", emoji: "🏠" },
    { path: "/expertProfiles", label: "EXPERTS", emoji: "👔" },
    { path: "/expertMeetingRequest", label: "MEETINGS", emoji: "📅" },
    { path: "/expertProfilePage", label: "PROFILE", emoji: "👤" },
    { path: "/ratingFeedback", label: "FEEDBACK", emoji: "💬" },
  ];

  return (
    <>
      <nav
        className="fixed z-50 top-3 left-0 right-0 max-w-[99%] mx-auto bg-[#1D1E2C]/95 backdrop-blur-xl shadow-2xl rounded-2xl animate-fade-in-up"
        aria-label="Expert navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <NavLink
              to="/"
              className="flex items-center group py-2 cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Go to home"
            >
              <div className="bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] p-2 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#2DE2E6]/20">
                <FaRocket className="text-[#1D1E2C] text-xl" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] bg-clip-text text-transparent">
                PathFinder
              </span>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => desktopLinkClasses(isActive)}
                >
                  <span aria-hidden="true" className="mr-2">
                    {item.emoji}
                  </span>
                  {item.label}
                </NavLink>
              ))}

              {/* Separator */}
              <div className="h-8 w-px bg-[#2DE2E6]/20 mx-2" />

              {/* Logout */}
              <NavLink
                to="/logout"
                className="ml-2 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-[#1D1E2C] px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-[#2DE2E6]/30 transition-all duration-300 flex items-center group font-semibold cursor-pointer"
                aria-label="Logout"
              >
                <span aria-hidden="true" className="mr-2">
                  🔓
                </span>
                <FaUser className="mr-2 hidden sm:inline-block" />
                Logout
              </NavLink>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center">
              <button
                type="button"
                onClick={() => setIsMenuOpen((v) => !v)}
                className={`p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                  isMenuOpen
                    ? "bg-[#FF6EC7]/10 text-[#FF6EC7]"
                    : "bg-[#2DE2E6]/10 text-[#2DE2E6] hover:bg-[#2DE2E6]/20"
                }`}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                aria-controls="expert-mobile-menu"
              >
                {isMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            id="expert-mobile-menu"
            className="lg:hidden bg-[#1D1E2C]/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-2 animate-slide-down"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => mobileLinkClasses(isActive)}
                onClick={() => setIsMenuOpen(false)}
              >
                <span aria-hidden="true" className="mr-3">
                  {item.emoji}
                </span>
                {item.label}
              </NavLink>
            ))}

            {/* Mobile Logout */}
            <div className="pt-4 mt-2">
              <NavLink
                to="/logout"
                className="flex items-center justify-center py-4 px-4 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-[#1D1E2C] text-center rounded-xl hover:shadow-lg hover:shadow-[#2DE2E6]/30 transition-all duration-300 font-semibold cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Logout"
              >
                <span aria-hidden="true" className="mr-2">
                  🔓
                </span>
                Logout Account
              </NavLink>
            </div>
          </div>
        )}
      </nav>

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
        @keyframes slide-down {
          0% { opacity: 0; transform: translateY(-6px) }
          100% { opacity: 1; transform: translateY(0) }
        }
        .animate-fade-in { animation: fade-in .5s ease-out both }
        .animate-fade-in-up { animation: fade-in-up .55s cubic-bezier(.2,.65,.2,1) both }
        .animate-slide-down { animation: slide-down .35s cubic-bezier(.2,.65,.2,1) both }
      `}</style>
    </>
  );
}

export default ExpertNavbar;
