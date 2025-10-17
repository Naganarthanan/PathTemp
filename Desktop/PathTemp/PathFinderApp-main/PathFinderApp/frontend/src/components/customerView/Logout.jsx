import { useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import RoleContext from "../RoleContext";

function Logout() {
  const navigate = useNavigate();
  const { setUserRole } = useContext(RoleContext);
  const hasRequested = useRef(false); // guard for multiple runs

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    axios
      .post(
        "http://localhost:4000/studentRoute/logout",
        {},
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.success) {
          localStorage.removeItem("role");
          localStorage.removeItem("email");
          setUserRole(null);
          toast.success("Logged Out Successfully", {
            toastId: "logout-success",
            autoClose: 2000,
            position: "top-center", // ✅ Centered toast
          });
          setTimeout(() => navigate("/"), 500);
        }
      })
      .catch((error) => {
        console.error("Error during Logout:", error);
        toast.error("Server error. Try again.", {
          toastId: "logout-error",
          autoClose: 2000,
          position: "top-center", // ✅ Centered toast
        });
        setTimeout(() => navigate("/"), 2000);
      });
  }, [navigate, setUserRole]);

  return null;
}

export default Logout;
