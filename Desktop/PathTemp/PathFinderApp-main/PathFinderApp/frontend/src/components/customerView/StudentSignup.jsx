import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import auth, { db } from "../../services/firebaseAuth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * StudentSignup
 * - Registers a new user with Firebase Auth
 * - Persists minimal profile to Firestore (`users/{uid}`)
 * - Basic client-side validation for email/password
 * - Stores email in cookie/localStorage for session convenience
 */
function StudentSignup() {
  const navigate = useNavigate();

  // -------------------- State --------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -------------------- Validation --------------------
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

  // Toast helper
  const notify = (message, type = "error") =>
    toast[type](message, {
      position: "top-center",
      autoClose: 4000,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });

  // -------------------- Submit --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side checks
    if (!EMAIL_RE.test(email)) {
      notify("Please enter a valid email address.");
      return;
    }
    if (!PASSWORD_RE.test(password)) {
      notify(
        "Password must include uppercase, lowercase, number & special character (min 8 characters)."
      );
      return;
    }
    if (password !== confirmPassword) {
      notify("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create user
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Persist minimal profile
      try {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "student",
        });
      } catch (err) {
        console.error("Firestore setDoc error:", err?.code, err?.message);
        throw new Error(`FIRESTORE_${err?.code || "WRITE_FAILED"}`);
      }

      // Lightweight session bits
      document.cookie = `email=${user.email}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem("userEmail", email);

      notify("Registration successful! Redirecting...", "success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const friendly = err.message?.startsWith("FIRESTORE_")
        ? "Could not save your profile. Please try again."
        : {
            "auth/email-already-in-use": "This email is already in use.",
            "auth/weak-password": "Password is too weak.",
            "auth/invalid-email": "Email address is invalid.",
          }[err.code] || "Registration failed. Please try again.";

      console.log(err);
      notify(friendly);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------- UI --------------------
  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex flex-col animate-fade-in">
        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center py-8 px-4">
          {/* Card */}
          <div className="w-full max-w-md bg-[#1D1E2C]/95 rounded-xl shadow-2xl overflow-hidden z-10 animate-fade-in-up">
            {/* Header */}
            <div className="p-6 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-[#2DE2E6] tracking-tight">
                Create Student Account
              </h1>
              <p className="text-[#2DE2E6]/80 text-sm md:text-base mt-2">
                Join our tech community to get started
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#2DE2E6] mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#2a2b3d] text-white rounded-lg focus:outline-none focus:ring-0 placeholder:text-gray-400"
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
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#2DE2E6] mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#2a2b3d] text-white rounded-lg focus:outline-none focus:ring-0 placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#2DE2E6] mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#2a2b3d] text-white rounded-lg focus:outline-none focus:ring-0 placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 shadow-lg ${
                    isSubmitting
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] hover:from-[#25c8cc] hover:to-[#e55db2]"
                  } cursor-pointer`}
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
                      Processing ...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2DE2E6]/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1D1E2C] text-[#2DE2E6]">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-[#FF6EC7] font-medium hover:text-[#e55ab0] text-sm hover:underline rounded px-2 py-1 transition duration-200 cursor-pointer"
                >
                  Sign in to your account
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 pb-6 text-center">
              <p className="text-xs text-[#2DE2E6]/70">
                By registering, you agree to our{" "}
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

export default StudentSignup;
