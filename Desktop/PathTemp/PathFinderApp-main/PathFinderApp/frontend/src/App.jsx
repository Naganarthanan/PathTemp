// src/App.jsx
import { useState, useEffect } from "react";
import "./index.css";

import appBg from "./assets/images/bg1.jpg";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import RoleContext from "./components/RoleContext";

import Layout from "./components/customerView/common/Layout";
import Navbar from "./components/customerView/Navbar";
import UserNavbar from "./components/customerView/UserNavbar";
import ExpertNavbar from "./components/customerView/ExpertNavbar";
import AdminNavBar from "./components/AdminNavBar";
import Footer from "./components/customerView/common/Footer";

import HomePage from "./pages/customerView/HomePage";
import UserHome from "./components/customerView/UserHome";
import AboutPage from "./components/customerView/About";
import ContactPage from "./components/customerView/ContactPage";
import SkillForm from "./components/customerView/SkillForm";
import ExpertProfile from "./components/customerView/ExpertProfile";
import Feedback from "./components/customerView/RatingFeedback";
import Logout from "./components/customerView/Logout";

import ExpertHome from "./components/customerView/experts/ExpertHome"
import ExpertRegister from "./components/customerView/ExpertRegister";
import StudentSignup from "./components/customerView/StudentSignup";
import Login from "./components/customerView/Login";
import ForgotPassword from "./components/customerView/ForgotPassword"; // ensure exists or comment

import AdminHome from "./components/adminView/AdminHome";
import AdminFeedback from "./components/adminView/Feedback";
import AdminExperts from "./components/adminView/AdminExperts";
import AdminPendingExperts from "./components/adminView/AdminPendingExperts";
import AdminStudentPreferences from "./components/adminView/AdminStudentPreferences";

import ExpertMeetingRequests from "./components/customerView/experts/ExpertMeetingRequests";
import StudentMeetingRequests from "./components/customerView/StudentMeetingRequests";
import ExpertProfilePage from "./components/customerView/experts/ExpertProfile";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppContent() {
  const [userRole, setUserRole] = useState("guest");
  const location = useLocation();

  // Pages that should NOT show the background image
  const NO_BG_PATHS = new Set(["/", "/about", "/contact"]);
  // Pages that hide the navbar
  const HIDE_NAV_PATHS = new Set([
    "/login",
    "/studentSignup",
    "/expertRegister",
  ]);

  const pathname = location.pathname;
  const showGlobalBg = !NO_BG_PATHS.has(pathname);
  const hideNavbar = HIDE_NAV_PATHS.has(pathname);

  // keep role in sync with localStorage
  useEffect(() => {
    setUserRole(localStorage.getItem("role") || "guest");
  }, [pathname]);

  const roleContextValue = {
    userRole,
    setUserRole: (newRole) => {
      setUserRole(newRole || "guest");
      if (newRole) localStorage.setItem("role", newRole);
      else localStorage.removeItem("role");
    },
  };

  return (
    <RoleContext.Provider value={roleContextValue}>
      {/* Global Toasts */}
      <ToastContainer
        position="top-center"
        theme="colored"
        closeOnClick
        pauseOnHover
        newestOnTop
        draggable
        toastClassName="!bg-[#1D1E2C] !text-white"
        progressClassName="!bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7]"
      />

      {/* Page wrapper with optional background */}
      <div
        className={`min-h-screen flex flex-col ${
          showGlobalBg ? "bg-page" : ""
        }`}
        style={showGlobalBg ? { "--page-bg": `url(${appBg})` } : undefined}
      >
        {/* NAVBAR */}
        {!hideNavbar && (
          <header className="sticky top-0 z-50 bg-[#1D1E2C]/95 backdrop-blur-sm">
            {userRole === "expert" ? (
              <ExpertNavbar />
            ) : userRole === "student" ? (
              <UserNavbar />
            ) : userRole === "admin" ? (
              <AdminNavBar />
            ) : (
              <Navbar />
            )}
          </header>
        )}

        {/* MAIN */}
        <main className={`flex-1 ${hideNavbar ? "" : "pt-6"}`}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="skillform" element={<SkillForm />} />
              <Route path="expertProfiles" element={<ExpertProfile />} />
              <Route path="ratingFeedback" element={<Feedback />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="logout" element={<Logout />} />
            </Route>
            <Route path="userHome" element={<UserHome />} />
             <Route path="expertHome" element={<ExpertHome />} />

            {/* Auth */}
            <Route path="expertRegister" element={<ExpertRegister />} />
            <Route path="studentSignup" element={<StudentSignup />} />
            <Route path="login" element={<Login />} />
            <Route path="forgotPassword" element={<ForgotPassword />} />

            {/* Admin */}
            <Route path="adminFeedback" element={<AdminFeedback />} />
            <Route path="adminExperts" element={<AdminExperts />} />
            <Route
              path="adminpendingexperts"
              element={<AdminPendingExperts />}
            />
            <Route
              path="adminStudentPreference"
              element={<AdminStudentPreferences />}
            />

            <Route path="adminHome" element={<AdminHome />} />

            {/* Expert / Student requests */}
            <Route path="expertProfilePage" element={<ExpertProfilePage />} />
            <Route
              path="expertMeetingRequest"
              element={<ExpertMeetingRequests />}
            />
            <Route
              path="studentMeetingRequest"
              element={<StudentMeetingRequests />}
            />
          </Routes>

          <div className="h-8" />
        </main>

        {/* FOOTER */}
        {!hideNavbar && <Footer />}
      </div>
    </RoleContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
