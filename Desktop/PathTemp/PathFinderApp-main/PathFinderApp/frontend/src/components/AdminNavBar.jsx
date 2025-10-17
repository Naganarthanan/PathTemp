import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaUser, FaShieldAlt } from "react-icons/fa";

const AdminNavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Unified link styling function with correct colors
  const linkClasses = (isActive) =>
    `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
      isActive
        ? "text-[#2DE2E6] bg-[#2DE2E6]/10 shadow-lg shadow-[#2DE2E6]/20 scale-105"
        : "text-gray-300 hover:text-[#2DE2E6] hover:bg-[#2DE2E6]/5"
    }`;

  const mobileLinkClasses = (isActive) =>
    `flex items-center px-4 py-4 rounded-xl text-base font-medium transition-all duration-300 ${
      isActive
        ? "text-[#2DE2E6] bg-[#2DE2E6]/10 shadow-lg shadow-[#2DE2E6]/20"
        : "text-gray-300 hover:text-[#2DE2E6] hover:bg-[#2DE2E6]/5"
    }`;

  const navItems = [
    { path: "/adminHome", label: "HOME", emoji: "🏠" },
    {
      path: "/adminStudentPreference",
      label: "STUDENT PREFERENCES",
      emoji: "🎓",
    },
    { path: "/adminExperts", label: "EXPERTS", emoji: "👥" },
    { path: "/adminpendingexperts", label: "APPROVALS", emoji: "✅" },
    { path: "/adminFeedback", label: "FEEDBACK", emoji: "💬" },
  ];

  return (
    <>
      <nav className="fixed z-50 top-3 left-0 right-0 max-w-[99%] mx-auto bg-[#1D1E2C]/95 backdrop-blur-xl shadow-2xl rounded-2xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <NavLink
              to="/"
              className="flex items-center group py-2"
              onClick={() => setMenuOpen(false)}
            >
              <div className="bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] p-2 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#2DE2E6]/20">
                <FaShieldAlt className="text-[#1D1E2C] text-xl" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] bg-clip-text text-transparent">
                  PathFinder
                </span>
                <span className="text-xs text-[#FF6EC7] font-medium bg-[#FF6EC7]/10 px-2 py-0.5 rounded-full">
                  Admin Portal
                </span>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => linkClasses(isActive)}
                  title={item.label}
                >
                  <span aria-hidden="true" className="mr-2">
                    {item.emoji}
                  </span>
                  {item.label}
                </NavLink>
              ))}

              {/* Separator */}
              <div className="h-8 w-px bg-[#2DE2E6]/20 mx-2"></div>

              {/* Admin Profile & Logout */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-[#2a2b3d] px-3 py-2 rounded-xl">
                  <div className="w-2 h-2 bg-[#FF6EC7] rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-[#2DE2E6] font-medium">
                    ADMIN
                  </span>
                </div>

                <NavLink
                  to="/logout"
                  className="bg-gradient-to-r from-[#FF6EC7] to-[#2DE2E6] text-[#1D1E2C] px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-[#FF6EC7]/30 transition-all duration-300 flex items-center group font-semibold"
                >
                  <span aria-hidden="true" className="mr-2">
                    🔐
                  </span>
                  <FaUser className="mr-2 group-hover:scale-110 transition-transform" />
                  Logout
                </NavLink>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center space-x-2">
              <div className="hidden sm:flex items-center bg-[#2a2b3d] px-2 py-1 rounded-lg">
                <div className="w-1.5 h-1.5 bg-[#FF6EC7] rounded-full mr-1 animate-pulse"></div>
                <span className="text-xs text-[#2DE2E6] font-medium">
                  ADMIN
                </span>
              </div>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  menuOpen
                    ? "bg-[#FF6EC7]/10 text-[#FF6EC7]"
                    : "bg-[#2DE2E6]/10 text-[#2DE2E6] hover:bg-[#2DE2E6]/20"
                }`}
                aria-label="Toggle menu"
              >
                {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-[#1D1E2C]/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-2 animate-slide-down">
            {/* Admin Status */}
            <div className="flex items-center justify-center py-3 mb-2">
              <div className="flex items-center bg-[#2a2b3d] px-4 py-2 rounded-xl">
                <div className="w-2 h-2 bg-[#FF6EC7] rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm text-[#FF6EC7] font-medium">
                  Administrator Mode
                </span>
              </div>
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => mobileLinkClasses(isActive)}
                onClick={() => setMenuOpen(false)}
              >
                <span aria-hidden="true" className="mr-2">
                  {item.emoji}
                </span>
                {item.label}
              </NavLink>
            ))}

            {/* Mobile Logout Section */}
            <div className="pt-4 border-t border-[#2DE2E6]/20 mt-2">
              <NavLink
                to="/logout"
                className="flex items-center justify-center py-4 px-4 bg-gradient-to-r from-[#FF6EC7] to-[#2DE2E6] text-[#1D1E2C] text-center rounded-xl hover:shadow-lg hover:shadow-[#FF6EC7]/30 transition-all duration-300 font-semibold"
                onClick={() => setMenuOpen(false)}
              >
                <span aria-hidden="true" className="mr-2">
                  🔐
                </span>
                Logout Admin
              </NavLink>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default AdminNavBar;
