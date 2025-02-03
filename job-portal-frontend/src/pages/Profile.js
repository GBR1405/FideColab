import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "../styles/profile.css";
import axios from "axios";
import Cookies from "js-cookie";
import EditUser from "./EditUser"; // Importamos el modal

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        setError("Debes iniciar sesión para ver tu perfil.");
        return;
      }

      const response = await axios.get(
        "http://localhost:3000/api/auth/user-profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        setError(response.data.message || "No se pudo obtener la información del usuario.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Ocurrió un error.");
    }
  };

  if (error) {
    return (
      <Layout>
        <section className="main__container">
          <h2 className="error-text">{error}</h2>
        </section>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <section className="main__container">
          <div className="loader"></div>
          <p className="loading-text">Cargando datos del usuario...</p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="main__container">
        <div className="container__top">
          <div className="top__image">
            <img
              className="image__user"
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.name}`}
              alt="User Avatar"
            />
          </div>
          <div className="top__info">
            <div className="info__box">
              <h1 className="info__title">{user.name}</h1>
              <span>{user.role}</span>
            </div>
            <div className="info__stats">
              <div className="stats__group">
                <div className="stats__icon">
                  <i className="fa-solid fa-flag"></i>
                </div>
                <div className="stats__text">
                  <h3>0</h3>
                  <span>Simulaciones realizadas</span>
                </div>
              </div>
              <div className="stats__group">
                <div className="stats__icon">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div className="stats__text">
                  <h3>0</h3>
                  <span>Logros</span>
                </div>
              </div>
            </div>
          </div>
          <div className="top__edit">
            <button className="edit__btn" onClick={() => setShowModal(true)}>
              Editar Información
            </button>
          </div>
        </div>
        <div className="container__middle">
          <div className="container__heading">
            <h3>Información personal</h3>
          </div>
          <div className="middle__content">
            <div className="content__info">
              <label className="info__label">Nombre completo:</label>
              <input className="info__input" type="text" value={user.name} readOnly />
            </div>
            <div className="content__info">
              <label className="info__label">Curso:</label>
              <input className="info__input" type="text" value={user.groupName || "N/A"} readOnly />
            </div>
            <div className="content__info">
              <label className="info__label">Correo electrónico:</label>
              <input className="info__input" type="text" value={user.email} readOnly />
            </div>
            <div className="content__info">
              <label className="info__label">Género:</label>
              <input className="info__input" type="text" value={user.gender} readOnly />
            </div>
          </div>
        </div>
        <div className="container__bottom">
          <div className="container__heading">
            <h3>Simulaciones recientes</h3>
            <a className="bottom__text" href="#">
              Ver historial completo
            </a>
          </div>
          <div className="bottom__content">
            <span className="bottom__text">¡Todavía no has hecho una simulación!</span>
          </div>
        </div>
      </section>

      {/* Aquí se renderiza el modal de edición cuando showModal es true */}
      {showModal && <EditUser showModal={showModal} setShowModal={setShowModal} />}
    </Layout>
  );
}

export default Profile;
