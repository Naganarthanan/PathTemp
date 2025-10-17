import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * StudentHome.jsx — minimal, centered, responsive
 * - Clean hero, no data shown
 * - Friendly copy
 * - Single primary action (pending tasks)
 */
export default function UserHome() {
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
            Welcome to your Student Space
          </h1>
          <p className="mt-3 text-white">
            Your learning journey is ready to begin. Use the quick action below
            to check what’s waiting for you.
          </p>

          <div className="mt-8 flex items-center justify-center">
            <Link
              to="/skillform"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-white text-[#0b1020] hover:opacity-90 active:opacity-95 transition font-medium"
            >
              Start Skill Assessment{" "}
              <span role="img" aria-label="arrow">
                🚀
              </span>
            </Link>
          </div>

          <p className="mt-6 text-sm text-white">
            Tip: Begin your assessment to identify strengths and areas for
            growth.
          </p>
        </motion.section>

        <footer className="mt-8 text-center text-xs text-white">
          <p>
            Stay focused and keep learning—your workspace works smoothly on both
            mobile and desktop.
          </p>
        </footer>
      </main>
    </div>
  );
}
