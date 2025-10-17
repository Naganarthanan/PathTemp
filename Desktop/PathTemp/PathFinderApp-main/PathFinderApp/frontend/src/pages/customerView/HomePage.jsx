import { NavLink } from "react-router-dom";
import {
  FaLightbulb,
  FaGraduationCap,
  FaArrowRight,
  FaRocket,
  FaChartLine,
  FaUsers,
  FaHeart,
  FaPlay,
  FaStar,
  FaCode,
  FaBrain,
  FaShieldAlt,
} from "react-icons/fa";

const HomePage = () => {
  return (
    <div className="bg-[#1D1E2C] text-white min-h-screen w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1D1E2C] via-[#2a2b3d] to-[#1D1E2C] pt-28 pb-20 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 lg:w-96 lg:h-96 bg-[#2DE2E6]/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 lg:w-80 lg:h-80 bg-[#FF6EC7]/5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* Hero Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center bg-[#2DE2E6]/10 px-4 py-2 rounded-full text-[#2DE2E6] text-sm font-medium mb-6 border border-[#2DE2E6]/20">
                <FaRocket className="mr-2" /> The future of tech career planning
                is here
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Discover Your{" "}
                <span className="text-[#2DE2E6]">Perfect Path</span> in{" "}
                <span className="text-[#FF6EC7]">Tech</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 mb-8 lg:mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                PathFinder uses advanced AI to analyze your skills, connect you
                with expert mentors, and map your ideal career trajectory in the
                ever-evolving tech industry.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 lg:mb-10">
                <NavLink
                  to="/studentSignup"
                  className="bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-[#1D1E2C] px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center group shadow-lg shadow-[#2DE2E6]/20"
                >
                  Start Your Journey{" "}
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </NavLink>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-[#1D1E2C] bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7]"
                    ></div>
                  ))}
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-gray-300 text-sm">
                    <span className="font-bold text-[#2DE2E6]">5,000+</span>{" "}
                    tech professionals found their path
                  </p>
                  <div className="flex items-center justify-center lg:justify-start mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className="text-[#FF6EC7] text-xs mr-1"
                      />
                    ))}
                    <span className="text-gray-400 text-sm ml-2">4.9/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="lg:w-1/2 flex justify-center relative mt-8 lg:mt-0">
              <div className="relative w-full max-w-md lg:max-w-lg">
                <div className="absolute -top-4 -left-4 w-24 h-24 lg:w-32 lg:h-32 bg-[#FF6EC7]/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 lg:w-32 lg:h-32 bg-[#2DE2E6]/20 rounded-full blur-2xl animate-pulse delay-1000"></div>

                <div className="bg-[#2a2b3d]/80 backdrop-blur-xl rounded-3xl p-6 lg:p-8 border border-[#2DE2E6]/30 relative z-10 shadow-2xl shadow-[#2DE2E6]/10">
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2DE2E6]/20">
                      <FaCode className="text-[#2DE2E6]" />
                    </div>
                    <h3 className="ml-3 font-semibold text-white">
                      Tech Specializations
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6">
                    {[
                      "Frontend",
                      "Backend",
                      "Data Science",
                      "DevOps",
                      "AI/ML",
                      "Cybersecurity",
                    ].map((item) => (
                      <div
                        key={item}
                        className="bg-[#1D1E2C]/60 p-3 lg:p-4 rounded-xl hover:bg-[#2DE2E6]/10 transition-all duration-300 border border-[#2a2b3d] hover:border-[#2DE2E6]/30 group"
                      >
                        <h3 className="text-[#2DE2E6] font-medium text-sm lg:text-base text-center group-hover:text-[#2DE2E6]">
                          {item}
                        </h3>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#1D1E2C]/60 p-4 lg:p-5 rounded-xl border border-[#2a2b3d]">
                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-[#FF6EC7] rounded-full mr-2 lg:mr-3"></div>
                        <h3 className="font-medium text-sm lg:text-base">
                          Your Career Progress
                        </h3>
                      </div>
                      <span className="text-[#2DE2E6] text-sm font-medium">
                        75%
                      </span>
                    </div>
                    <div className="h-1.5 lg:h-2 bg-[#2a2b3d] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] rounded-full transition-all duration-1000"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-20 bg-[#2a2b3d] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {[
              {
                value: "15K+",
                label: "Active Users",
                icon: (
                  <FaUsers className="text-[#2DE2E6] text-xl lg:text-2xl" />
                ),
                increase: "+25% this month",
              },
              {
                value: "650+",
                label: "Expert Mentors",
                icon: (
                  <FaGraduationCap className="text-[#FF6EC7] text-xl lg:text-2xl" />
                ),
                increase: "From top companies",
              },
              {
                value: "80+",
                label: "Career Paths",
                icon: (
                  <FaLightbulb className="text-[#2DE2E6] text-xl lg:text-2xl" />
                ),
                increase: "Constantly updated",
              },
              {
                value: "96%",
                label: "Satisfaction Rate",
                icon: (
                  <FaHeart className="text-[#FF6EC7] text-xl lg:text-2xl" />
                ),
                increase: "Based on reviews",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[#1D1E2C]/40 backdrop-blur-md rounded-2xl p-4 lg:p-6 text-center border border-[#2a2b3d] hover:border-[#2DE2E6]/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-center mb-3 lg:mb-4">
                  {item.icon}
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  {item.value}
                </div>
                <div className="text-gray-300 font-medium text-sm lg:text-base mb-2">
                  {item.label}
                </div>
                <div className="text-[#2DE2E6] text-xs">{item.increase}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-[#1D1E2C] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center bg-[#2DE2E6]/10 px-4 py-2 rounded-full text-[#2DE2E6] text-sm font-medium mb-4 border border-[#2DE2E6]/20">
              <FaRocket className="mr-2" /> How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your <span className="text-[#2DE2E6]">Path</span> to Tech Success
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto text-base lg:text-lg">
              Our streamlined process helps you navigate your tech career
              journey with confidence and clarity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <FaBrain className="text-[#2DE2E6] text-2xl" />,
                title: "AI Skill Assessment",
                description:
                  "Our advanced AI evaluates your skills and provides personalized guidance on career paths that match your unique strengths and interests.",
                link: "/assessment",
                color: "[#2DE2E6]",
              },
              {
                icon: <FaUsers className="text-[#FF6EC7] text-2xl" />,
                title: "Expert Mentorship",
                description:
                  "Connect with industry experts from top tech companies for personalized guidance, code reviews, and career advice.",
                link: "/mentors",
                color: "[#FF6EC7]",
              },
              {
                icon: <FaChartLine className="text-[#2DE2E6] text-2xl" />,
                title: "Career Roadmapping",
                description:
                  "Receive tailored learning paths, project recommendations, and skill development plans to achieve your career goals.",
                link: "/career-paths",
                color: "[#2DE2E6]",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-[#2a2b3d]/50 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-[#2a2b3d] hover:border-[#2DE2E6]/30 transition-all duration-300 group hover:-translate-y-2"
              >
                <div
                  className={`bg-${feature.color}/10 w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-${feature.color}/20 transition-colors duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed text-sm lg:text-base">
                  {feature.description}
                </p>
                <NavLink
                  to={feature.link}
                  className={`text-${feature.color} font-medium flex items-center group-hover:underline text-sm lg:text-base`}
                >
                  Learn more{" "}
                  <FaArrowRight className="ml-2 text-sm transition-transform group-hover:translate-x-1" />
                </NavLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      <section className="py-16 lg:py-20 bg-[#2a2b3d] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 lg:w-96 lg:h-96 bg-[#2DE2E6]/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center bg-[#FF6EC7]/10 px-4 py-2 rounded-full text-[#FF6EC7] text-sm font-medium mb-4 border border-[#FF6EC7]/20">
              <FaShieldAlt className="mr-2" /> Specializations
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore <span className="text-[#FF6EC7]">Tech Domains</span>
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto text-base lg:text-lg">
              Discover various tech specializations and find your perfect fit in
              the industry
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            {[
              { name: "Frontend", icon: "💻", color: "[#2DE2E6]" },
              { name: "Backend", icon: "⚙️", color: "[#FF6EC7]" },
              { name: "DevOps", icon: "🔄", color: "[#2DE2E6]" },
              { name: "Data Science", icon: "📊", color: "[#FF6EC7]" },
              { name: "AI/ML", icon: "🤖", color: "[#2DE2E6]" },
              { name: "Cybersecurity", icon: "🔒", color: "[#FF6EC7]" },
            ].map((item, index) => (
              <div
                key={index}
                className={`bg-[#1D1E2C]/40 backdrop-blur-md rounded-xl p-3 lg:p-4 text-center border border-[#2a2b3d] hover:border-${item.color}/30 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="text-2xl lg:text-3xl mb-2">{item.icon}</div>
                <h3 className={`text-${item.color} text-sm font-medium`}>
                  {item.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#2a2b3d] to-[#1D1E2C] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#2DE2E6]/5 to-transparent"></div>
        <div className="absolute -top-16 -left-16 w-48 h-48 lg:w-64 lg:h-64 bg-[#2DE2E6]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-16 -right-16 w-48 h-48 lg:w-64 lg:h-64 bg-[#FF6EC7]/10 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Launch Your{" "}
            <span className="text-[#2DE2E6]">Tech Career</span>?
          </h2>
          <p className="text-gray-300 mb-8 lg:mb-10 max-w-2xl mx-auto text-base lg:text-lg">
            Join thousands of developers, engineers, and tech professionals who
            have discovered their ideal career path with our guidance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <NavLink
              to="/studentSignup"
              className="bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] text-[#1D1E2C] px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center group shadow-lg shadow-[#2DE2E6]/20"
            >
              Start Your Journey{" "}
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </NavLink>
          </div>
          <p className="text-gray-400 text-sm">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
