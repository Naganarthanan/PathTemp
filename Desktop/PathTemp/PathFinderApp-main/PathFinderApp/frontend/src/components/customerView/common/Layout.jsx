import { Outlet } from "react-router-dom";
import UserNavbar from "../UserNavbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main content with proper spacing */}
      <main className="flex-grow pt-20 pb-3">
        <div className="max-w-[99%] mx-auto px-0 rounded-md border border-transparent mt-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
