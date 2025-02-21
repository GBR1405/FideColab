import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getRole } from './UtilsAuth'; // Asegúrate de importar correctamente

const PrivateRoute = ({ element, allowedRoles, ...rest }) => {
    const authenticated = isAuthenticated();
    const userRole = getRole();
  
    console.log("Autenticado:", authenticated);  // Verifica si está autenticado
    console.log("Rol del usuario:", userRole);   // Verifica el rol del usuario
  
    if (!authenticated) {
      return <Navigate to="/login" />;
    }
  
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/not-authorized" />;
    }
  
    return element;
  };

export default PrivateRoute;
