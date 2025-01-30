import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";

function UserHomeScreen() {
  const [userData, setUserData] = useState(null); // Cambié el valor inicial a null para tener una validación más fácil
  const [error, setError] = useState(""); // Para manejar cualquier error

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      // Recuperar el token desde sessionStorage
      const token = sessionStorage.getItem("authToken"); 

      if (!token) {
        setError("User is not logged in");
        return;
      }

      // Hacer la solicitud a la API con el token en la cabecera
      const response = await axios.get(
        "http://localhost:3000/api/auth/get-userDetails", // Asegúrate de que esta ruta sea correcta
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Aquí asumimos que 'user' es el objeto que contiene la información del usuario
        setUserData(response.data.user); // Seteamos los datos del usuario en el estado
        let userInfo = {
          isLoggedIn: true,
          userData: response.data.user,
        };
        sessionStorage.setItem("userData", JSON.stringify(userInfo)); // Guardamos la información del usuario en sessionStorage
      } else {
        setError(response.data.message || "Failed to fetch user details");
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  // Verificamos si hay un error o si los datos del usuario no están cargados aún
  if (error) {
    return (
      <div>
        <h2>Error: {error}</h2>
      </div>
    );
  }

  if (!userData) {
    return <div>Loading...</div>; // Cargando mientras se obtiene la información
  }

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Welcome to User Home Screen</h2>
      <div style={{ textAlign: "center" }}>
        {/* Mostramos la información del usuario según la estructura de datos */}
        <h2>
          Name: {userData.name} <br /> Email: {userData.email} <br /> Rol: {userData.rol}
        </h2>
      </div>
    </div>
  );
}

export default UserHomeScreen;
