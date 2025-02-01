import React, { useEffect, useState } from "react";
import axios from "axios";

function EditUser() {
  const [user, setUser] = useState({
    nombre: "", // Cambié 'name' a 'nombre'
    generoId: "", // Cambié 'gender' a 'generoId'
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Cargar los detalles del usuario cuando el componente se monta
  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Función para obtener los detalles del usuario
  const fetchUserDetails = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        setError("You must log in to edit your profile.");
        return;
      }

      const response = await axios.get("http://localhost:3000/api/auth/get-userDetails", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setUser({
          nombre: response.data.user.name, // Cambié 'name' a 'nombre'
          generoId: response.data.user.gender, // Cambié 'gender' a 'generoId'
        });
      } else {
        setError(response.data.message || "Could not fetch user details.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching user details.");
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Función para manejar el envío del formulario (actualización de usuario)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        setError("User not authenticated.");
        return;
      }

      const response = await axios.post("http://localhost:3000/api/auth/user-edit", {
        nombre: user.nombre, // Cambié 'name' a 'nombre'
        generoId: user.generoId, // Cambié 'gender' a 'generoId'
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setMessage("User updated successfully!");
      } else {
        setError(response.data.message || "Could not update user.");
      }
    } catch (err) {
      console.error(err);  // Esto ayudará a ver el error completo en la consola
      setError(err.response?.data?.message || "An error occurred while updating user.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Edit Profile</h2>
        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre" // Cambié 'name' a 'nombre'
            value={user.nombre} // Cambié 'name' a 'nombre'
            onChange={handleChange}
            required
          />

          <label>Género:</label>
          <select
            name="generoId" // Cambié 'gender' a 'generoId'
            value={user.generoId} // Cambié 'gender' a 'generoId'
            onChange={handleChange}
            required
          >
            <option value="1">Hombre</option>
            <option value="2">Mujer</option>
            <option value="3">Indefinido</option>
          </select>

          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    maxWidth: "350px",
    width: "100%",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  success: {
    color: "green",
  },
  error: {
    color: "red",
  },
};

export default EditUser;
