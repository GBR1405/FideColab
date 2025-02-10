import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2"; // Importa SweetAlert2

function EditUser({ showModal, setShowModal }) {
  const [userData, setUserData] = useState({
    name: "",
    gender: "Indefinido", // Valor por defecto
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal) {
      // Al abrir el modal, cargamos la información del usuario
      fetchUserData();
    }
  }, [showModal]);

  const fetchUserData = async () => {
    const token = Cookies.get("authToken");
    if (!token) {
      setError("Debes iniciar sesión para editar tu perfil.");
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:3000/api/auth/user-profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setUserData({
          name: response.data.user.name,
          gender: response.data.user.gender || "Indefinido", // Si no hay género, se asigna "Indefinido"
        });
      } else {
        setError(response.data.message || "No se pudo obtener la información del usuario.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Ocurrió un error al cargar la información.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = Cookies.get("authToken");
    if (!token) {
      setError("No token provided. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/user-edit",
        {
          nombre: userData.name,
          generoId: userData.gender === "Hombre" ? 1 : userData.gender === "Mujer" ? 2 : 3, // Convertir el género a un ID numérico
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Muestra un SweetAlert de éxito
        Swal.fire({
          title: "¡Éxito!",
          text: "Información actualizada exitosamente",
          icon: "success",
          confirmButtonText: "Aceptar",
        }).then(() => {
          setShowModal(false);
          window.location.reload(); // Recarga la página para ver los cambios
        });
      } else {
        setError(response.data.message || "No se pudo actualizar la información.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Ocurrió un error al actualizar la información.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false); // Cerrar el modal
  };

  if (!showModal) return null;

  return (
    <>
      <style>
        {`
          /* Estilo básico para el modal */
          .modal {
            display: flex;
            justify-content: center;
            align-items: center;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
          }

          .modal-content {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: scale(0.95);
            transition: transform 0.3s ease-out;
          }

          .modal-content.show {
            transform: scale(1);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }

          .modal-header h2 {
            font-size: 20px;
            font-weight: 600;
            color: #333;
            margin: 0;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            color: #555;
            cursor: pointer;
          }

          .form-group {
            margin-bottom: 15px;
          }

          .form-group label {
            font-size: 14px;
            font-weight: 600;
            color: #333;
          }

          .form-group input,
          .form-group select {
            width: 100%;
            padding: 10px;
            margin-top: 5px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s;
          }

          .form-group input:focus,
          .form-group select:focus {
            border-color: #007bff;
          }

          .error-text {
            color: red;
            font-size: 14px;
            margin-bottom: 10px;
          }

          .modal-footer {
            text-align: right;
          }

          .modal-footer button {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
          }

          .modal-footer button:hover {
            background-color: #0056b3;
          }

          .modal-footer button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
        `}
      </style>

      <div className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Editar Información</h2>
            <button className="close-btn" onClick={handleCloseModal}>
              &times;
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="error-text">{error}</div>}
              <div className="form-group">
                <label htmlFor="name">Nombre completo:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Género:</label>
                <select
                  id="gender"
                  name="gender"
                  value={userData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Indefinido">Indefinido</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditUser;
