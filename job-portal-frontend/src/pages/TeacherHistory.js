import React, { useState, useEffect } from "react";
import "../styles/historyComponents.css";
import Layout from "../components/Layout";
import Cookies from "js-cookie";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import "../styles/modal.css";

const TeacherHistory = () => {
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState(null);

  const itemsPerPage = 5;
  const apiURL = process.env.REACT_APP_API_URL;
  const token = Cookies.get("authToken");

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${apiURL}/result-teacher`, {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.data.success) {
          setHistorial(res.data.data);
        } else {
          console.error("Error: La respuesta de la API no es exitosa");
        }
      } catch (error) {
        console.error("Error al obtener historial del profesor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [apiURL, token]);

  // Filtro
  const filtrarHistorial = () => {
    return historial.filter((item) => {
      const cursoMatch = item.curso
        ?.toLowerCase()
        .includes(filtroCurso.toLowerCase());

      const fechaMatch = filtroFecha
        ? item.fecha?.split("T")[0] === filtroFecha
        : true;

      return cursoMatch && fechaMatch;
    });
  };

  const historialFiltrado = filtrarHistorial();

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historialFiltrado.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(historialFiltrado.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openModal = (id) => {
    setSelectedResultId(id);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedResultId(null);
  };

  return (
    <Layout>
      <section className="teacher__container_H">
        <div className="historial__title_H">
          <h3>Historial</h3>
        </div>

        {/* Filtros */}
        <div className="historial__options_H">
          <div className="options__top_H">
            <div className="option__box_H">
              <input
                type="text"
                placeholder="Buscar curso..."
                value={filtroCurso}
                onChange={(e) => setFiltroCurso(e.target.value)}
              />
            </div>
            <div className="option__box_H">
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="historial__view_H">
          <div className="left__title_H">
            <h3>Historial de Partidas</h3>
          </div>

          {loading ? (
            <span>Cargando historial...</span>
          ) : historialFiltrado.length === 0 ? (
            <span>No hay partidas registradas.</span>
          ) : (
            <table className="left__table_H">
              <thead className="table__head_H">
                <tr>
                  <th className="table__header_H">Fecha</th>
                  <th className="table__header_H">Curso</th>
                  <th className="table__header_H">Acción</th>
                </tr>
              </thead>
              <tbody className="table__body_H">
                {currentItems.map((item, index) => (
                  <tr className="table__row_H" key={index}>
                    <td className="table__data_H">{item.fecha?.split("T")[0]}</td>
                    <td className="table__data_H">{item.curso}</td>
                    <td className="table__data_H">
                      <button className="ver__btn_H" onClick={() => openModal(item.id)}>
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table__foot_H">
                {totalPages > 1 && (
                  <div className="foot__buttons_H">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((number) => {
                        let show = false;
                        if (currentPage <= 2) show = number <= 5;
                        else if (currentPage >= totalPages - 1)
                          show = number >= totalPages - 4;
                        else show = number >= currentPage - 2 && number <= currentPage + 2;
                        return show;
                      })
                      .map((number) => (
                        <button
                          key={number}
                          className={`button__page_H ${currentPage === number ? "active" : ""}`}
                          onClick={() => paginate(number)}
                        >
                          {number}
                        </button>
                      ))}
                  </div>
                )}
              </tfoot>
            </table>
          )}
        </div>

        {/* MODAL */}
        {modalVisible && (
          <div className="modal-overlay show" onClick={closeModal}>
            <div
              className="modal-content animated slideIn"
              style={{ width: "80%", height: "80%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close-btn" onClick={closeModal}>
                ✕
              </button>
              <iframe
                src={`/resultados/${selectedResultId}`}
                title="Resultados"
                style={{ width: "100%", height: "100%", border: "none" }}
              ></iframe>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default TeacherHistory;
