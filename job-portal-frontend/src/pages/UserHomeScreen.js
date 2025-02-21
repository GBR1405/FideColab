import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Cookies from "js-cookie";

function UserHomeScreen() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = Cookies.get("IFUser_Info");

    if (!token) {
      setError("User is not logged in");
      return;
    }

    try {
      // Convertir el token de la cookie de nuevo a objeto
      const decodedUser = JSON.parse(token); // Aquí estamos parseando el JSON en lugar de decodificar un JWT

      // Establecer la información del usuario en el estado
      setUserData({
        nombre: decodedUser.nombre,
        apellido1: decodedUser.apellido1,
        apellido2: decodedUser.apellido2,
        correo: decodedUser.correo,
        rol: decodedUser.rol,
      });
    } catch (err) {
      console.error("Error al parsear la cookie:", err);
      setError("Failed to parse user data");
    }
  }, []);

  if (error) {
    return <Layout userData={null} />;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <Layout userData={userData}>
      <section className="main__container">
        {/* Aquí va el contenido principal */}
        <h1>Bienvenido, {userData.nombre} {userData.apellido1}</h1>
        {/* Más contenido que quieras mostrar */}
      </section>
    </Layout>
  );
}

export default UserHomeScreen;
