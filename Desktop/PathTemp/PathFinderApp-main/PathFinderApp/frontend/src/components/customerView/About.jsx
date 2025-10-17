// src/pages/AboutPage.jsx
import { NavLink } from "react-router-dom";
import {
  FaRocket,
  FaUsers,
  FaLightbulb,
  FaGraduationCap,
  FaShieldAlt,
  FaChartLine,
  FaHeartbeat,
  FaHandsHelping,
  FaGlobeAmericas,
  FaArrowRight,
} from "react-icons/fa";

const AboutPage = () => {
  return (
    <div className="text-white min-h-screen w-full overflow-hidden bg-[#1D1E2C]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1D1E2C] via-[#2a2b3d] to-[#1D1E2C] pt-28 pb-20 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 lg:w-96 lg:h-96 bg-[#2DE2E6]/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 lg:w-80 lg:h-80 bg-[#FF6EC7]/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center bg-[#2DE2E6]/10 px-4 py-2 rounded-full text-[#2DE2E6] text-sm font-medium mb-6 border border-[#2DE2E6]/20">
              <FaRocket className="mr-2" />
              Our Story
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              About <span className="text-[#2DE2E6]">PathFinder</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mt-6 max-w-3xl mx-auto">
              We help students and professionals discover the right path in
              tech—powered by AI guidance and human expertise.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-20 bg-[#2a2b3d] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {[
              {
                title: "Our Mission",
                text: "Democratize access to high-quality tech career guidance by combining advanced AI assessment with mentorship from real industry experts.",
                icon: <FaLightbulb className="text-[#2DE2E6] text-2xl" />,
              },
              {
                title: "Our Vision",
                text: "A world where anyone—regardless of background—can chart a personalized roadmap to a fulfilling, future-proof career in technology.",
                icon: <FaGlobeAmericas className="text-[#FF6EC7] text-2xl" />,
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-[#1D1E2C]/40 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-[#2a2b3d] hover:border-[#2DE2E6]/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              >
                <div className="flex items-center gap-3 mb-4">
                  {card.icon}
                  <h3 className="text-xl font-semibold">{card.title}</h3>
                </div>
                <p className="text-gray-300">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 lg:py-20 bg-[#1D1E2C] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16 animate-fade-in-up">
            <div className="inline-flex items-center bg-[#2DE2E6]/10 px-4 py-2 rounded-full text-[#2DE2E6] text-sm font-medium mb-4 border border-[#2DE2E6]/20">
              <FaGraduationCap className="mr-2" />
              What We Do
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Turning <span className="text-[#2DE2E6]">Potential</span> into{" "}
              <span className="text-[#FF6EC7]">Progress</span>
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto mt-4">
              We blend assessment, mentorship, and roadmapping to accelerate
              your growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <FaShieldAlt className="text-[#2DE2E6] text-2xl" />,
                title: "Personalized Guidance",
                desc: "AI-driven insights based on your skills, interests, and goals.",
              },
              {
                icon: <FaUsers className="text-[#FF6EC7] text-2xl" />,
                title: "Expert Mentorship",
                desc: "One-on-one sessions with industry leaders and educators.",
              },
              {
                icon: <FaChartLine className="text-[#2DE2E6] text-2xl" />,
                title: "Career Roadmaps",
                desc: "Clear action plans with projects, learning paths, and milestones.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-[#2a2b3d]/50 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-[#2a2b3d] hover:border-[#2DE2E6]/30 transition-all duration-300 group hover:-translate-y-2 animate-fade-in-up"
              >
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-6 bg-white/5">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-20 bg-[#2a2b3d] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center bg-[#FF6EC7]/10 px-4 py-2 rounded-full text-[#FF6EC7] text-sm font-medium mb-4 border border-[#FF6EC7]/20">
              <FaHeartbeat className="mr-2" />
              Our Values
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">What Drives Us</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "Empathy",
                desc: "We meet learners where they are—supporting diverse journeys.",
                color: "from-[#2DE2E6] to-[#FF6EC7]",
                icon: <FaHandsHelping />,
              },
              {
                title: "Excellence",
                desc: "We hold ourselves to high standards in content and coaching.",
                color: "from-[#FF6EC7] to-[#2DE2E6]",
                icon: <FaRocket />,
              },
              {
                title: "Integrity",
                desc: "We recommend what truly benefits your long-term growth.",
                color: "from-[#2DE2E6] to-[#FF6EC7]",
                icon: <FaShieldAlt />,
              },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-2xl p-6 lg:p-8 bg-[#1D1E2C]/50 border border-[#2a2b3d] hover:border-[#2DE2E6]/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5 bg-gradient-to-r ${v.color} text-[#1D1E2C]`}
                >
                  {v.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{v.title}</h3>
                <p className="text-gray-300">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#2a2b3d] to-[#1D1E2C] relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-48 h-48 lg:w-64 lg:h-64 bg-[#2DE2E6]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 lg:w-64 lg:h-64 bg-[#FF6EC7]/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the <span className="text-[#2DE2E6]">PathFinder</span>{" "}
            community
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Start with an AI assessment and meet mentors who can accelerate your
            journey.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <NavLink
              to="/studentSignup"
              className="bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-[#1D1E2C] px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center group shadow-lg shadow-[#2DE2E6]/20 cursor-pointer"
            >
              Get Started{" "}
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </NavLink>
            <NavLink
              to="/skillform"
              className="border-2 border-[#2DE2E6]/30 text-[#2DE2E6] px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:bg-[#2DE2E6]/10 transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              Try AI Assessment
            </NavLink>
          </div>
        </div>
      </section>

      {/* Animations */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px) } 100% { opacity: 1; transform: translateY(0) } }
        .animate-fade-in { animation: fade-in .5s ease-out both }
        .animate-fade-in-up { animation: fade-in-up .55s cubic-bezier(.2,.65,.2,1) both }
        .animate-pulse-slow { animation: pulse 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default AboutPage;
