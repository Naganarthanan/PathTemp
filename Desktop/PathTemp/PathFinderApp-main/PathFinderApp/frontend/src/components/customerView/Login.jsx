import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import auth, { db } from "../../services/firebaseAuth";
import { getDoc, doc } from "firebase/firestore";
import RoleContext from "../RoleContext";
import appBg from "../../assets/images/app-bg.jpeg";

/**
 * Login page for Path Finder (MERN + Firebase Auth)
 * (styles-only revamp: removed unnecessary borders/outlines, added cursor-pointer + animations)
 */
function Login() {
  const navigate = useNavigate();
  const { setUserRole } = useContext(RoleContext);

  // -------------------- State --------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignupOptions, setShowSignupOptions] = useState(false);

  // -------------------- Validation --------------------
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

  // Common toast helper
  const notify = (message, type = "error") =>
    toast[type](message, {
      position: "top-center",
      autoClose: 3000,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });

  // Persist session bits
  const persistSession = (role, emailToStore) => {
    localStorage.setItem("role", role);
    localStorage.setItem("userEmail", emailToStore);
    document.cookie = `email=${emailToStore}; path=/; max-age=86400`;
    setUserRole(role);
  };

  // -------------------- Submit --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!EMAIL_RE.test(email)) {
      notify("Please enter a valid email address.");
      return;
    }
    if (password === "") {
      notify("Password cannot be empty.");
      return;
    }
    if (!PASSWORD_RE.test(password)) {
      notify(
        "Password must include uppercase, lowercase, number & special character (min 8 characters)."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Admin shortcut (bypasses Firebase)
      if (email === "admin@gmail.com" && password === "Admin@123") {
        persistSession("admin", email);
        notify("Login successful!", "success");
        navigate("/");
        return;
      }

      // Firebase sign-in
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      // Fetch role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const role = userDoc.data()?.role || "student";

      persistSession(role, email);
      notify("Login successful!", "success");

      // Navigate to home (can branch by role later if needed)
      navigate("/");
    } catch (error) {
      const errorMessages = {
        "auth/user-not-found": "No user found with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential": "Invalid email/password combination.",
      };
      notify(errorMessages[error.code] || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------- UI --------------------
  return (
    <>
      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundImage: `url(${appBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <main className="flex-grow flex items-center justify-center relative px-4">
          {/* Login Card */}
          <div className="relative w-full max-w-md bg-[#1D1E2C]/95 rounded-xl shadow-2xl overflow-hidden z-10 mt-6 animate-fade-in-up">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#1D1E2C] to-[#2a2b3d] p-6 sm:p-8 text-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7]" />
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2DE2E6] tracking-tight">
                Welcome Back
              </h1>
              <p className="text-[#2DE2E6]/80 text-sm sm:text-base mt-2">
                Please login to continue your journey
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Email */}
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-[#2DE2E6] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#2a2b3d] text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6EC7] transition duration-200"
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-[#2DE2E6]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="animate-fade-in [animation-delay:80ms]">
                <label className="block text-sm font-medium text-[#2DE2E6] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#2a2b3d] text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6EC7] transition duration-200"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-[#2DE2E6]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-[#2DE2E6]/70 mt-2">
                  Must include: uppercase, lowercase, number, special character
                  (min 8 chars)
                </p>
              </div>

              {/* Submit */}
              <div className="pt-2 animate-fade-in [animation-delay:160ms]">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 shadow-lg cursor-pointer focus:outline-none active:scale-[0.98] ${
                    isSubmitting
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] hover:from-[#25c8cc] hover:to-[#e55db2] hover:shadow-[0_8px_30px_rgba(255,110,199,0.25)]"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative py-4 animate-fade-in [animation-delay:220ms]">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1D1E2C] text-[#2DE2E6]">
                    Don't have an account?
                  </span>
                </div>
              </div>

              {/* Sign-up options */}
              {showSignupOptions && (
                <div className="mt-4 p-4 bg-[#2a2b3d] rounded-lg animate-fade-in-up [animation-delay:260ms]">
                  <p className="text-sm font-medium text-[#2DE2E6] mb-2 text-center">
                    Sign up as:
                  </p>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate("/studentSignup")}
                      className="flex-1 bg-[#1D1E2C] text-[#2DE2E6] py-2 px-3 rounded-md hover:bg-[#2DE2E6]/10 transition-colors text-sm font-medium text-center cursor-pointer focus:outline-none hover:shadow-[0_6px_18px_rgba(45,226,230,0.25)]"
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/expertRegister")}
                      className="flex-1 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-gray-900 py-2 px-3 rounded-md hover:opacity-90 transition-colors text-sm font-medium text-center cursor-pointer focus:outline-none hover:shadow-[0_6px_18px_rgba(255,110,199,0.35)]"
                    >
                      Expert
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 text-center animate-fade-in [animation-delay:300ms]">
                <button
                  type="button"
                  onClick={() => setShowSignupOptions((v) => !v)}
                  className="text-[#2DE2E6] font-medium hover:text-[#FF6EC7] text-sm hover:underline rounded px-2 py-1 transition duration-200 cursor-pointer focus:outline-none"
                >
                  {showSignupOptions ? "Hide options" : "Create new account"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/forgotPassword")}
                  className="text-[#2DE2E6] font-medium hover:text-[#FF6EC7] text-sm hover:underline rounded px-2 py-1 transition duration-200 cursor-pointer focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 sm:px-8 pb-6 text-center pt-4 animate-fade-in [animation-delay:340ms]">
              <p className="text-xs text-[#2DE2E6]/70">
                By logging in, you agree to our{" "}
                <a
                  href="#"
                  className="text-[#FF6EC7] hover:underline cursor-pointer"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-[#FF6EC7] hover:underline cursor-pointer"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </main>
      </div>

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
        .animate-fade-in { animation: fade-in .5s ease-out both }
        .animate-fade-in-up { animation: fade-in-up .55s cubic-bezier(.2,.65,.2,1) both }
      `}</style>
    </>
  );
}

export default Login;
