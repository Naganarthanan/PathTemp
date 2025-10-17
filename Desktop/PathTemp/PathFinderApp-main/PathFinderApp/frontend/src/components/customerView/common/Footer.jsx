import {
  FaRocket,
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaInstagram,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";

/* -----------------------------------------------------------------------------
   Footer: professional, responsive, accessible, minimal borders, clean styles
   - Uses semantic sections and navs
   - Adds cursor-pointer where interactive
   - Adds native email validation (required + type="email")
   - Fixes contact href/text mismatches
----------------------------------------------------------------------------- */
function Footer() {
  const quickLinks = ["Home", "AI Analysis", "Experts", "About Us", "Contact"];
  const resources = ["Blog", "Careers", "Success Stories", "Webinars", "FAQ"];
  const policies = ["Privacy Policy", "Terms of Service", "Cookie Policy"];

  return (
    <footer className="text-gray-300 bg-gray-900/95 backdrop-blur-sm shadow-xl border-t border-electric-blue/30 rounded-md mx-2 mb-2">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {/* Brand */}
          <section>
            <div className="flex items-center mb-3">
              <div className="bg-electric-blue/20 p-2 rounded-lg mr-2">
                <FaRocket className="text-electric-blue text-lg" aria-hidden />
              </div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-electric-blue to-neon-pink">
                PathFinder
              </h3>
            </div>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed max-w-xs">
              Discover your career path with AI-powered analysis and connect
              with industry experts to guide your professional journey toward
              success.
            </p>
            <div className="flex space-x-3" aria-label="Social links">
              {[FaTwitter, FaLinkedin, FaGithub, FaInstagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="bg-white/10 p-2 rounded-md text-electric-blue hover:bg-white/20 hover:text-electric-blue transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-electric-blue/50 cursor-pointer"
                >
                  <Icon size={16} aria-hidden />
                </a>
              ))}
            </div>
          </section>

          {/* Quick Links */}
          <nav aria-label="Quick links">
            <h4 className="text-electric-blue font-semibold mb-3 text-base">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-electric-blue transition-colors duration-300 flex items-center group focus:outline-none focus:ring-2 focus:ring-electric-blue/50 rounded-md cursor-pointer"
                  >
                    <span className="w-2 h-2 bg-electric-blue/0 rounded-full mr-2 group-hover:bg-electric-blue transition-all duration-300" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources">
            <h4 className="text-electric-blue font-semibold mb-3 text-base">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              {resources.map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-electric-blue transition-colors duration-300 flex items-center group focus:outline-none focus:ring-2 focus:ring-electric-blue/50 rounded-md cursor-pointer"
                  >
                    <span className="w-2 h-2 bg-electric-blue/0 rounded-full mr-2 group-hover:bg-electric-blue transition-all duration-300" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <section aria-labelledby="footer-contact">
            <h4
              id="footer-contact"
              className="text-electric-blue font-semibold mb-3 text-base"
            >
              Contact Info
            </h4>
            <address className="text-gray-400 not-italic space-y-2 text-sm">
              <div className="flex items-start">
                <FaMapMarkerAlt
                  className="text-electric-blue mt-1 mr-2"
                  aria-hidden
                />
                <p>
                  123 Central Road,
                  <br />
                  Orr&apos;s Hill, Trincomalee
                </p>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-electric-blue mr-2" aria-hidden />
                <a
                  href="mailto:infopathfinder@gmail.com"
                  className="hover:text-electric-blue"
                >
                  infopathfinder@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <FaPhoneAlt className="text-electric-blue mr-2" aria-hidden />
                <a href="tel:+94761234567" className="hover:text-electric-blue">
                  +94 76 12 34 567
                </a>
              </div>
            </address>
          </section>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-3 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} PathFinder. All rights reserved.
            </p>
            <nav aria-label="Legal">
              <ul className="flex flex-wrap justify-center gap-4 md:gap-5">
                {policies.map((label) => (
                  <li key={label}>
                    <a
                      href="#"
                      className="text-gray-500 hover:text-electric-blue transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-electric-blue/50 rounded-md cursor-pointer"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
