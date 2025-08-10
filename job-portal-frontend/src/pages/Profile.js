import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/profile.css";
import Cookies from "js-cookie";
import EditUser from "./EditUser";
import CryptoJS from "crypto-js";

const secretKey = process.env.REACT_APP_SECRET_KEY;
const apiUrl = process.env.REACT_APP_API_URL;

function Profile() {

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const formatCourseName = (courseString) => {
    if (!courseString) return "N/A";
    
    if (/^[A-Z]{2}-\d{3} G\d$/.test(courseString.trim())) {
      return courseString;
    }
    
    return courseString.split(',').map(course => {
      const trimmed = course.trim();
      const codeMatch = trimmed.match(/[A-Z]{2}-\d{3}/);
      const groupMatch = trimmed.match(/G\d+/);
      
      const code = codeMatch ? codeMatch[0] : trimmed.substring(0, 6);
      const group = groupMatch ? groupMatch[0] : trimmed.split(' ').pop();
      
      return `${code} ${group}`;
    }).join(', ');
  };

  const handleHistoryClick = () => {
    navigate(user.rol === "Profesor" ? "/teacher-history" : "/student-history");
  };

  const handleViewClick = (partidaId) => {
    navigate(user.rol === "Profesor" 
      ? `/teacher-history?partida=${partidaId}`
      : `/student-history?partida=${partidaId}`
    );
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    const encryptedUserInfo = Cookies.get("IFUser_Info");
    const token = Cookies.get("authToken");

    if (!encryptedUserInfo || !token) {
      setError("Debes iniciar sesión para ver tu perfil.");
      return;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedUserInfo, secretKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      setUser(decryptedData);

      const response = await fetch(`${apiUrl}/get-user-games`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        console.error("Error al obtener datos del perfil extendido.");
      }
    } catch (err) {
      console.error("Error al desencriptar o al obtener datos:", err);
      setError("Ocurrió un error al cargar tu perfil.");
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

  if (!user || !stats) {
  return (
    <Layout>
      <section className="main__container_L">
        <div className="loader_L"></div>
        <p className="loading-text_L">Cargando datos del usuario...</p>
      </section>
    </Layout>
  );
}

  return (
    <Layout>
      <section className="main__container_PF">
        {/* Sección superior - Información del usuario */}
        <div className="container__top_PF">
          <div className="top__image_PF">
            <img
              className="image__user_PF"
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.nombre}`}
              alt="User Avatar"
            />
          </div>
          <div className="top__info_PF">
            <div className="info__box_PF">
              <h1 className="info__title_PF">{`${user.nombre} ${user.apellido1} ${user.apellido2}`}</h1>
              <span className="info__role_PF">{user.rol}</span>
            </div>
            <div className="info__stats_PF">
              <div className="stats__group_PF">
                <div className="stats__icon_PF">
                  <i className="fa-solid fa-flag"></i>
                </div>
                <div className="stats__text_PF">
                  <h3>{stats.simulaciones}</h3>
                  <span>Simulaciones realizadas</span>
                </div>
              </div>
              {user.rol === "Estudiante" && (
                <div className="stats__group_PF">
                  <div className="stats__icon_PF">
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  <div className="stats__text_PF">
                    <h3>{stats.logros}</h3>
                    <span>Logros</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="top__edit_PF">
            <button 
              className="edit__btn_PF" 
              onClick={() => setShowModal(true)}
            >
              Editar Perfil
            </button>
          </div>
        </div>

        {/* Sección media - Información personal */}
        <div className="container__middle_PF">
          <div className="container__heading">
            <h3>Información personal</h3>
          </div>
          <div className="middle__content_PF">
            <div className="content__info_PF">
              <label className="info__label_PF">Nombre completo:</label>
              <input 
                className="info__input_PF" 
                type="text" 
                value={`${user.nombre} ${user.apellido1} ${user.apellido2}`} 
                readOnly 
              />
            </div>
            <div className="content__info_PF">
              <label className="info__label_PF">Curso:</label>
              <input
                className="info__input_PF"
                type="text"
                value={formatCourseName(stats.cursoActual)}
                readOnly
              />
            </div>
            <div className="content__info_PF">
              <label className="info__label_PF">Correo electrónico:</label>
              <input 
                className="info__input_PF" 
                type="text" 
                value={user.correo} 
                readOnly 
              />
            </div>
            <div className="content__info_PF">
              <label className="info__label_PF">Género:</label>
              <input 
                className="info__input_PF" 
                type="text" 
                value={user.genero} 
                readOnly 
              />
            </div>
          </div>
        </div>

        {/* Sección inferior - Simulaciones recientes */}
        <div className="container__simulations">
          <div className="simulations__heading">
            <h3>Simulaciones recientes</h3>
            <button 
              className="bottom__link"
              onClick={handleHistoryClick}
            >
              Ver historial completo
            </button>
          </div>

          <div className="simulations__content">
            {stats.ultimasPartidas.length === 0 ? (
              <span className="simulations__empty">¡Todavía no has hecho una simulación!</span>
            ) : (
              <table className="simulations__table">
                <thead className="table__head">
                  <th className="table__header">Fecha</th>
                  <th className="table__header">Curso</th>
                  <th className="table__header">Equipo</th>
                  <th className="table__header">Acción</th>
                </thead>
                <tbody className="table__body">
                  <div className="body__list">
                    {stats.ultimasPartidas.map((partida, index) => (
                      <tr className="table__row" key={index}>
                        <td className="table__data">{new Date(partida.fecha).toLocaleDateString()}</td>
                        <td className="table__data">{formatCourseName(partida.curso)}</td>
                        <td className="table__data">{partida.equipo || "-"}</td>
                        <td className="table__data">
                          <button 
                            className="table__button"
                            onClick={() => handleViewClick(partida.id)}
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </div>                  
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {showModal && <EditUser setShowModal={setShowModal} />}
    </Layout>
  );
}

export default Profile;