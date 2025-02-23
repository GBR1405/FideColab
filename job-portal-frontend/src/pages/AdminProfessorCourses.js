import React, { useEffect } from "react";
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";
import $ from "jquery";
import "datatables.net-dt/css/jquery.dataTables.css";
import "datatables.net";

const AdminProfessorCourses = () => {


    useEffect(() => {

        if ($.fn.dataTable.isDataTable("#tableTeachers")) {
            $("#tableTeachers").DataTable().destroy();
        }

        if ($.fn.dataTable.isDataTable("#tableCourses")) {
            $("#tableCourses").DataTable().destroy();
        }

        $("#tableTeachers").DataTable({
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
        
        $("#tableCourses").DataTable({
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
      <LayoutAdmin>
        <section className="add__container">
            <div className="container__title">
                <h3>Profesores y Cursos</h3>
            </div>
            <div className="container__options">
                <div className="option__filters">
                    <input className="filter__input" type="text" placeholder="Buscar:" />
                    <div className="filter__course">
                        <select>
                            <option value="0" disabled selected>Curso:</option>
                            <option value="1">Curso 1</option>
                            <option value="2">Curso 2</option>
                            <option value="3">Curso 3</option>
                        </select>
                    </div>
                </div>
                <div className="option__buttons">
                    <div className="option__button">                              
                        <button type="submit">Agregar Curso</button>
                    </div> 
                    <div className="option__button">                              
                        <button type="submit">Agregar Grupo</button>
                    </div> 
                </div>                  
            </div>
            <div className="container__content">
                <div className="content__box">
                    <div className="box__title">
                        <h3>Lista Profesores</h3>
                    </div>
                    <div className="box__table">
                        <div className="table__data">
                            <table id="tableTeachers">
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
                            <button type="submit">Agregar</button>
                        </div> 
                    </div>
                </div>
                <div className="content__box">
                    <div className="box__title">
                        <h3>Lista Cursos</h3>
                    </div>
                    <div className="box__table">
                        <div className="table__data">
                            <table id="tableCourses">
                                <thead>
                                    <tr>
                                        <th>Codigo</th>
                                        <th>Curso</th>
                                        <th>Grupo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>123456789</td>
                                        <td>ejemplo</td>
                                        <td>ejemplo</td>
                                    </tr>
                                    <tr>
                                        <td>123456789</td>
                                        <td>ejemplo</td>
                                        <td>ejemplo</td>
                                    </tr>
                                    <tr>
                                        <td>123456789</td>
                                        <td>ejemplo</td>
                                        <td>ejemplo</td>
                                    </tr>
                                    <tr>
                                        <td>123456789</td>
                                        <td>ejemplo</td>
                                        <td>ejemplo</td>
                                    </tr>
                                    <tr>
                                        <td>123456789</td>
                                        <td>ejemplo</td>
                                        <td>ejemplo</td>
                                    </tr>
                                    <tr>
                                        <td>123456789</td>
                                        <td>ejemplo</td>
                                        <td>ejemplo</td>
                                    </tr>
                                    <tr>
                                        <td>123456789</td>
                                        <td>ejemplo</td>
                                        <td>ejemplo</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>                        
                    </div>
                    <div className="box__bottom">
                        <div className="bottom__button">                              
                            <button type="submit">Asignar</button>
                        </div> 
                        <div className="bottom__button">                              
                            <button type="submit">Eliminar</button>
                        </div> 
                    </div>
                </div>
            </div>
        </section>
      </LayoutAdmin>
    </>
  );
};

export default AdminProfessorCourses;
