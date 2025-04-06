import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Cookies from "js-cookie";

function UserHomeScreen() {
  const [userData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = Cookies.get("IFUser_Info");

    if (!token) {
      setError("User is not logged in");
      return;
    }

    try {
 
    } catch (err) {
      console.error("Error al parsear la cookie:", err);
      setError("Failed to parse user data");
    }
  }, []);

  if (error) {
    return <Layout userData={null} />;
  }

  return (
    <Layout userData={userData}>
      <section className="main__container">
      </section>
    </Layout>
  );
}

export default UserHomeScreen;
