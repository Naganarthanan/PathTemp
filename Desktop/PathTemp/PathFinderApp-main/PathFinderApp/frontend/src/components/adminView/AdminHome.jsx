import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * AdminWelcome.jsx — minimal, centered, responsive
 * - Clean hero, no data shown
 * - Friendly copy
 * - Single primary action (pending approvals)
 */
export default function AdminHome() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b1020] via-[#121a2f] to-[#0b1020] text-white px-4">
      <main className="w-full max-w-3xl">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 sm:p-10 shadow-xl"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white font-semibold leading-tight">
            Welcome to your Admin Space
          </h1>
          <p className="mt-3 text-white">
            Everything is set up and ready. Use the quick action below to jump
            straight into your pending work.
          </p>

          <div className="mt-8 flex items-center justify-center">
            <Link
              to="/adminpendingexperts"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-white text-[#0b1020] hover:opacity-90 active:opacity-95 transition font-medium"
            >
              View Pending Approvals{" "}
              <span role="img" aria-label="arrow">
                👉
              </span>
            </Link>
          </div>

          <p className="mt-6 text-sm text-white">
            Tip: You can wire this button to your route right away—no extra
            setup required.
          </p>
        </motion.section>

        <footer className="mt-8 text-center text-xs text-white">
          <p>
            Have a great session! Your workspace adapts nicely from mobile to
            desktop.
          </p>
        </footer>
      </main>
    </div>
  );
}
