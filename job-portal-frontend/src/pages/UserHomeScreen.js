import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import Cookies from "js-cookie";


const apiUrl = process.env.REACT_APP_API_URL;

function UserHomeScreen() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(""); 

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const token = Cookies.get('authToken');

      if (!token) {
        setError("User is not logged in");
        return;
      }

      const response = await axios.get(`${apiUrl}/auth/get-userDetails`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setUserData(response.data.user);
        let userInfo = { isLoggedIn: true, userData: response.data.user };
        document.cookie = `userData=${JSON.stringify(userInfo)}; path=/; max-age=86400`;
      } else {
        setError(response.data.message || "Failed to fetch user details");
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  // Aquí, renderizamos solo cuando los datos estén disponibles.
  if (error) {
    return (
      <Layout userData={null}>
      </Layout>
    );
  }

  if (!userData) {
    return (
      <div>Loading...</div> // Puedes mostrar un indicador de carga aquí mientras se obtiene la información
    );
  }

  return (
    <Layout userData={userData}>
      <section className="main__container">
        
      </section>
    </Layout>
  );
}

export default UserHomeScreen;
