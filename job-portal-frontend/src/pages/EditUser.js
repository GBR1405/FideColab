import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";

const apiUrl = process.env.REACT_APP_API_URL;
const secretKey = process.env.REACT_APP_SECRET_KEY; 

function EditUser({ showModal, setShowModal }) {
  const [userInfo, setUserInfo] = useState({
    name: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal) {
      fetchUserData();
    }
  }, [showModal]);

  const fetchUserData = async () => {
    const userInfoCookie = Cookies.get("IFUser_Info");
    if (!userInfoCookie) {
      setError("Debes iniciar sesión para editar tu perfil.");
      return;
    }

    try {
      // Desencriptar la información de la cookie
      const bytes = CryptoJS.AES.decrypt(userInfoCookie, secretKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      setUserInfo({
        name: `${decryptedData.nombre} ${decryptedData.apellido1} ${decryptedData.apellido2}`,
        gender: decryptedData.genero || "Indefinido",
      });
    } catch (err) {
      setError("No se pudo obtener la información del usuario desde la cookie.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userInfoCookie = Cookies.get("IFUser_Info");
    if (!userInfoCookie) {
      setError("No token provided. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // Desencriptar la cookie para obtener los datos
      const bytes = CryptoJS.AES.decrypt(userInfoCookie, secretKey);
      const userData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      // Verificar si el género ha cambiado
      if (userInfo.gender === userData.genero) {
        Swal.fire({
          title: "Sin cambios",
          text: "El género no ha cambiado.",
          icon: "info",
          confirmButtonText: "Aceptar",
        });
        setLoading(false);
        setShowModal(false);
        return;
      }

      const token = Cookies.get("authToken");

      // Enviar solo el cambio de género y el correo del usuario desde la cookie
      const response = await fetch(`${apiUrl}/auth/user-edit`, {
        method: "POST",
        credentials: "include", 
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            correo: userData.correo,
            generoId: userInfo.gender === "Hombre" ? 1 : userInfo.gender === "Mujer" ? 2 : 3,
        })
      });
    
      const responseData = await response.json();

      if (responseData.success) {
        // Actualizar la cookie con el nuevo género
        const updatedUserInfo = {
          ...userData,
          genero: userInfo.gender,
        };
      
        Cookies.remove("IFUser_Info");
        Cookies.set("IFUser_Info", CryptoJS.AES.encrypt(JSON.stringify(updatedUserInfo), secretKey).toString(), {
          expires: 7,
          secure: false, 
        });
      
        Swal.fire({
          title: "¡Éxito!",
          text: "Género actualizado exitosamente",
          icon: "success",
          confirmButtonText: "Aceptar",
        }).then(() => {
          setShowModal(false);
          window.location.reload();
        });
      } else {
        setError(responseData.message || "No se pudo actualizar la información.");
      }
      
    } catch (err) {
      setError(err.response?.data?.message || "Ocurrió un error al actualizar la información.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <>
      <style>
        {`
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
                  value={userInfo.name}
                  onChange={handleChange}
                  required
                  disabled
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Género:</label>
                <select
                  id="gender"
                  name="gender"
                  value={userInfo.gender}
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
