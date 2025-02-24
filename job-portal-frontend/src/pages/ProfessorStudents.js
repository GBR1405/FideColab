import React, { useEffect } from "react";
import "../styles/professorComponents.css";
import LayoutProfessor from "../components/LayoutProfessor";
import $ from "jquery";
import "datatables.net-dt/css/jquery.dataTables.css";
import "datatables.net";

const ProfessorStudents = () => {

    useEffect(() => {

        if ($.fn.dataTable.isDataTable("#tableStudents")) {
            $("#tableStudents").DataTable().destroy();
        }
        
        $("#tableStudents").DataTable({
            language: {
                processing: "Procesando...",
                lengthMenu: "Mostrar _MENU_ registros",
                infoEmpty: "No hay registros disponibles",
                infoFiltered: "(filtrado de _MAX_ registros en total)",
                loadingRecords: "Cargando...",
                zeroRecords: "No se han encontrado registros",
                emptyTable: "No hay datos disponibles en la tabla",
                paginate: {
                  first: "Primero",
                  previous: "Anterior",
                  next: "Siguiente",
                  last: "Último"
                },
                aria: {
                  sortAscending: ": activar para ordenar la columna de manera ascendente",
                  sortDescending: ": activar para ordenar la columna de manera descendente"
                }
            },
            searching: false,  // Desactiva la barra de búsqueda
            info: false         // Elimina el texto "Showing X to Y of Z entries"
        });

    }, []);

  return (
    <>
      <LayoutProfessor>       
        <section className="student__container">
            <div className="container__title">
                <h3>Estudiantes</h3>
            </div>
            <div className="container__description">
                <p>
                    Consulta el registro completo de tus estudiantes, acá podras filtrar por curso y agregar estudiantes.
                </p>
            </div>
            <div className="container__content">
                <div className="content__box">
                    <div className="box__title">
                        <h3>Tabla de Estudiantes</h3>
                    </div>
                    <div className="box__table">
                        <div className="table__data">
                            <table id="tableStudents">
                                <thead>
                                    <tr>
                                        <th>Codigo</th>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>123456789</td>
                                        <td>ejemplo</td>
                                        <td>ejemplo@gmail.com</td>
                                    </tr>
                                    <tr>
                                        <td>123456789</td>
                                        <td>ejemplo</td>
                                        <td>ejemplo@gmail.com</td>
                                    </tr>
                                    <tr>
                                        <td>123456789</td>
                                        <td>ejemplo</td>
                                        <td>ejemplo@gmail.com</td>
                                    </tr>
                                    <tr>
                                        <td>123456789</td>
                                        <td>ejemplo</td>
                                        <td>ejemplo@gmail.com</td>
                                    </tr>
                                    <tr>
                                        <td>123456789</td>
                                        <td>ejemplo</td>
                                        <td>ejemplo@gmail.com</td>
                                    </tr>
                                    <tr>
                                        <td>123456789</td>
                                        <td>ejemplo</td>
                                        <td>ejemplo@gmail.com</td>
                                    </tr>
                                    <tr>
                                        <td>123456789</td>
                                        <td>ejemplo</td>
                                        <td>ejemplo@gmail.com</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>                        
                    </div>
                    <div className="box__bottom">
                        <div className="bottom__button">                              
                            <button type="submit">Adjuntar lista</button>
                        </div> 
                        <div className="bottom__button">                              
                            <button type="submit">Agregar estudiantes</button>
                        </div> 
                    </div>
                </div>
                <div className="content__box">
                    <div className="box__title">
                        <h3>Filtros</h3>
                    </div>
                    <div className="box__filter">
                        <div className="filter__text">
                            <div className="text__shape">
                                <label>Grupo:</label>
                                <input className="shape__input" type="text" placeholder="Ingrese el grupo a buscar." />                             
                            </div>
                            <div className="text__shape">
                                <label>Curso:</label>
                                <input className="shape__input" type="text" placeholder="Ingrese el curso a buscar." />                             
                            </div>
                            <div className="text__shape">
                                <label>Nombre:</label>
                                <input className="shape__input" type="text" placeholder="Agregue el nombre a buscar." />                             
                            </div>
                        </div>                                            
                    </div>
                    <div className="box__bottom">
                        <div className="bottom__button">                              
                            <button type="submit">Buscar</button>
                        </div> 
                    </div> 
                </div>                
            </div>
        </section>
      </LayoutProfessor>
    </>
  );
};

export default ProfessorStudents;
