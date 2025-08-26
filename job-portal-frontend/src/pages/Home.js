import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRole, isAuthenticated } from "../LN/UtilsAuth"; 

const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const role = getRole();

    if (!role) {
      navigate("/login");
      return;
    }
    
    if (role === "Administrador") {
      navigate("/admin");
    } else {
      navigate("/homeScreen");
    }
  }, [navigate]);

  return <h2>.</h2>;
};

export default AuthRedirect;
