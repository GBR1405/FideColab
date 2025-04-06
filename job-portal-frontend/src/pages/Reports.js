import React from 'react';
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL;
const token = Cookies.get("authToken");

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
    } catch (error) {
      console.error("Error descargando el reporte:", error);
    }
};


  


const Reports = () => {
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
                    <div className="left__content">
                        <span>
                            Por ahora no has descargado reportes
                        </span>
                    </div>
                </div>
                <div className="report__right">
                    <div className="report__box">
                        <div className="box__shape">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                        <div className="right__text">
                            <Link to="/admin/history" style={{ textDecoration: "none", color: "inherit" }}>
                                <p className="text__title">Historial</p>
                                <p className="text__description">
                                    Si gusta no descargar puede optar por ver el historial de este cuatrimestre.
                                </p>
                            </Link>
                        </div>
                    </div>
                    <div className="report__box">
                        <div className="box__shape">
                            <i className="fa-solid fa-eraser"></i>
                        </div>
                        <div className="right__text">
                            <Link to="/admin/depuration" style={{ textDecoration: "none", color: "inherit" }}>
                                <p className="text__title">Depuración</p>
                                <p className="text__description">
                                    Si desea eliminar datos, estudiantes o información y guardarlos puede depurar el sistema.
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </LayoutAdmin>
    </>
  );
};

export default Reports;
