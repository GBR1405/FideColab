import React, { useState, useEffect } from 'react';
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL;
const token = Cookies.get("authToken");

const Reports = () => {
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); 

  const fetchDownloadHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/report-historial`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
  
      if (!response.ok) throw new Error("Error al obtener el historial");
      
      const data = await response.json();
      setDownloadHistory(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDownloadHistory = async () => {
      try {
        const response = await fetch(`${apiUrl}/report-historial`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Error al obtener el historial de descargas");
        }

        const data = await response.json();
        setDownloadHistory(data);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };

    fetchDownloadHistory();
  }, []);

  // Calcular índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = downloadHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(downloadHistory.length / itemsPerPage);

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDownloadStudents = async () => {
    try {
        const response = await fetch(`${apiUrl}/report-students`, {
            method: "GET",
            credentials: "include", 
            headers: {
              "Authorization": `Bearer ${token}`, 
              "Content-Type": "application/json"
            }
          });
  
      if (!response.ok) throw new Error("Error al descargar PDF");
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Estudiantes.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      await fetchDownloadHistory();
    } catch (error) {
      console.error("Error descargando el PDF:", error);
    }
  };

  const downloadTeachersReport = async () => {
    try {
      const response = await fetch(`${apiUrl}/report-teacher`, {
        method: "GET",
        credentials: "include", 
        headers: {
          "Authorization": `Bearer ${token}`, 
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error("Error al descargar el reporte");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte_profesores.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      await fetchDownloadHistory();
    } catch (error) {
      console.error("Error descargando el reporte:", error);
    }
  };



//PARTIDAS
  const downloadPartidasReport = async () => {
    try {
      const response = await fetch(`${apiUrl}/report-partidas`, {
        method: "GET",
        credentials: "include", 
        headers: {
          "Authorization": `Bearer ${token}`, 
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error("Error al descargar el reporte");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte_partidas.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      await fetchDownloadHistory();
    } catch (error) {
      console.error("Error descargando el reporte:", error);
    }
  };

  //BITACORA
  const downloadBitacoraReport = async () => {
    try {
      const response = await fetch(`${apiUrl}/report-bitacora`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Respuesta del servidor:", response);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al descargar el reporte: ${errorText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte_bitacora.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      await fetchDownloadHistory();
    } catch (error) {
      console.error("Error descargando el reporte:", error);
    }
};

  return (
    <>
      <LayoutAdmin>
        <section className="report__container">
          <div className="report__top">
            <h3>Reportes</h3>
          </div>
          <div className="report__middle">
              <button className="report__button" onClick={downloadPartidasReport}>
                  <div className="report__icon">
                      <i className="fa-solid fa-puzzle-piece"></i>
                  </div>
                  <div className="report__text">
                      <span>Descargar</span>
                      <span>Partidas</span>
                  </div>                    
              </button>
              <button className="report__button" onClick={handleDownloadStudents}>
                  <div className="report__icon">
                      <i className="fa-solid fa-user-graduate"></i>
                  </div>                    
                  <div className="report__text">
                       <span>Descargar</span>
                       <span>Estudiantes</span>
                  </div>       
              </button>
              <button className="report__button" onClick={downloadTeachersReport}>
                  <div className="report__icon">
                      <i className="fa-solid fa-user-tie"></i>
                  </div>                    
                  <div className="report__text">
                      <span>Descargar</span>
                      <span>Profesores</span>
                  </div>       
              </button>
              <button className="report__button" onClick={downloadBitacoraReport}>
                  <div className="report__icon">
                      <i className="fa-solid fa-book-open-reader"></i>
                  </div>                    
                  <div className="report__text">
                      <span>Descargar</span>
                      <span>Bitacora</span>
                  </div>       
              </button>
          </div>
          <div className="report__bottom">
            <div className="report__left">
                <div className="left__title">
                    <h3>Bitácora de Descargas</h3>
                </div>
                {loading ? (
                    <span>Cargando historial de descargas...</span>
                ) : downloadHistory.length === 0 ? (
                    <span>Por ahora no has descargado reportes</span>
                ) : (                  
                  <table className="left__table">
                    <thead className="table__head">
                      <th className="table__header">Usuario</th>
                      <th className="table__header">Acción</th>
                      <th className="table__header">Fecha</th>
                    </thead>
                    <tbody className="table__body">
                        {currentItems.map((item, index) => (
                            <tr className="table__row" key={index}>
                                <td className="table__data">{item.usuario}</td>
                                <td className="table__data">{item.accion}</td>
                                <td className="table__data">{new Date(item.fecha).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="table__foot">
                      {/* Paginación centrada debajo de la tabla */}
                      {totalPages > 1 && (
                          <div className="foot__buttons">                            
                              {/* Mostrar páginas alrededor de la página actual */}
                              {Array.from({ length: totalPages }, (_, i) => i + 1)
                                  .filter(number => {
                                    let pageNumber;
                                    if (currentPage === 1 || currentPage === 2) {
                                      pageNumber = currentPage === 1? number <= 5 : number >= currentPage - 1 && number <= currentPage + 3;
                                    }
                                    if (currentPage > 2 && currentPage < totalPages -1) {
                                      pageNumber = number >= currentPage - 2 && number <= currentPage + 2 && number > 0 && number <= totalPages;
                                    }  
                                    if (currentPage === totalPages - 1 || currentPage === totalPages) {
                                      pageNumber = currentPage === totalPages ? number >= currentPage - 4 : number >= currentPage - 3 && number <= currentPage + 1;
                                    }                                                 
                                    return pageNumber;                            
                                  })
                                  .map(number => (
                                      <button 
                                          className={`button__page ${currentPage === number ? "active" : ""}`}
                                          key={number}
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
            <div className="report__right">
              <div className="report__box">
                  <Link to="/admin/history" style={{ textDecoration: "none", color: "inherit", display: "contents" }}>
                      <div className="box__shape">
                          <i className="fa-solid fa-clock-rotate-left"></i>
                      </div>
                      <div className="right__text">
                          <p className="text__title">Historial</p>
                          <p className="text__description">
                              Si gusta no descargar puede optar por ver el historial de este cuatrimestre.
                          </p>
                      </div>
                  </Link>
              </div>
              <div className="report__box">   
                <Link to="/admin/depuration" style={{ textDecoration: "none", color: "inherit", display: "contents" }}>
                  <div className="box__shape">
                      <i className="fa-solid fa-eraser"></i>
                  </div>
                  <div className="right__text">
          
                          <p className="text__title">Depuración</p>
                          <p className="text__description">
                              Si desea eliminar datos, estudiantes o información y guardarlos puede depurar el sistema.
                          </p>
                  </div>
                </Link> 
              </div>
            </div>
          </div>
        </section>
      </LayoutAdmin>
    </>
  );
};

export default Reports;