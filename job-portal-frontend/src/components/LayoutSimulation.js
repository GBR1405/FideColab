import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/TeamRoom.css";

const LayoutSimulation = ({ children, userData }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <main className="body__teamroom">                    
      {children}        
    </main>
  );
};

export default LayoutSimulation;