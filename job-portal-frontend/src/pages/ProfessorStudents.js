import React, { useEffect, useRef, useState } from "react";
import "../styles/professorComponents.css";
import "../styles/adminComponents.css";
import LayoutProfessor from "../components/Layout";
import $ from "jquery";
import "datatables.net";
import * as Swal from 'sweetalert2';
import Cookies from "js-cookie";
import { processFileMiddleware } from '../LN/processFileMiddleware';

const apiUrl = process.env.REACT_APP_API_URL;
const token = Cookies.get("authToken");

const ProfessorStudents = () => {
  const tableRef = useRef(null);  
  const [gruposDisponibles, setGruposDisponibles] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);

  useEffect(() => {
    const fetchEstudiantes = async () => {
        try {
            const response = await fetch(`${apiUrl}/get-students`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Datos recibidos:", data); // Verifica si los datos son correctos
                setEstudiantes(data.estudiantes); // Asegúrate de que 'estudiantes' es el nombre correcto de la propiedad
            } else {
                console.error("Error al obtener los estudiantes");
            }
        } catch (error) {
            console.error("Error al obtener los estudiantes:", error);
        }
    };

    fetchEstudiantes();
}, [token]); // Dependencia en el token


  const showSuccessAlert = (message) => {
          Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: message,
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#3e8e41'
          }).then(() => {
              window.location.reload();
          });
      };
  
      // Muestra una alerta de error
      const showErrorAlert = (message) => {
          Swal.fire({
              icon: 'error',
              title: '¡Error!',
              text: message,
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#d33'
          });
      };

  function descargarPDF(pdfBase64, fileName) {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${pdfBase64}`;
        link.download = `${fileName}.pdf`;
        link.click();
    }

    useEffect(() => {
        const fetchGrupos = async () => {
            try {
                const response = await fetch(`${apiUrl}/obtener-cursosVinculados`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setGruposDisponibles(data); // Guarda los grupos en el estado
                } else {
                    console.error("Error al obtener los grupos");
                }
            } catch (error) {
                console.error("Error al obtener los grupos:", error);
            }
        };

        fetchGrupos();
    }, [token]);

    // Función para obtener las opciones de los grupos
    const getGroupOptions = async () => {
        try {
            const response = await fetch(`${apiUrl}/obtener-cursosVinculados`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.ok) {
                const data = await response.json();
                // Convertir los datos a un formato adecuado para SweetAlert
                const options = data.reduce((acc, grupo) => {
                    acc[grupo.GruposEncargados_ID_PK] = `${grupo.Codigo_Curso} ${grupo.Nombre_Curso} - G${grupo.Codigo_Grupo}`; // Formato solicitado
                    return acc;
                }, {});
                return options;
            } else {
                console.error("Error al obtener los grupos");
                return {};
            }
        } catch (error) {
            console.error("Error al obtener los grupos:", error);
            return {};
        }
    };

  
    const handleAddStudent = () => {
        Swal.fire({
            title: 'Agregar Estudiante',
            html: `
                <div class="swal2-tabs">
                    <button class="swal2-tab" data-tab="1">Agregar via CSV/XLSX</button>
                    <button class="swal2-tab" data-tab="2">Agregar Manualmente</button>
                </div>
                <div class="swal2-tab-content">
                    <!-- Tab 1: Agregar via archivo -->
                    <div class="tab-1-content" id="tab-1-content" style="display: none;">
                        <input type="file" id="fileInput" class="custom-file-input" />
                    </div>
    
                    <!-- Tab 2: Agregar manualmente -->
                    <div class="tab-2-content" id="tab-2-content" style="display: none;">
                        <input type="text" id="studentName" placeholder="Nombre" class="swal2-input" />
                        <input type="text" id="studentLastName1" placeholder="Apellido 1" class="swal2-input" />
                        <input type="text" id="studentLastName2" placeholder="Apellido 2" class="swal2-input" />
                        <input type="email" id="studentEmail" placeholder="Correo" class="swal2-input" />
                        
                        <!-- Select para el género -->
                        <select id="studentGender" class="swal2-input">
                            <option value="1">Hombre</option>
                            <option value="2">Mujer</option>
                            <option value="3">Indefinido</option>
                        </select>
                    </div>
                </div>
            `,
            confirmButtonText: 'Agregar',
            cancelButtonText: 'Cerrar',
            showCancelButton: true,
            didOpen: () => {
                const tabs = document.querySelectorAll('.swal2-tab');
                const tabContent = document.querySelectorAll('.swal2-tab-content > div');
        
                tabContent.forEach(content => content.style.display = 'none');
                document.getElementById('tab-1-content').style.display = 'block';
        
                tabs.forEach(tab => {
                    tab.addEventListener('click', function () {
                        tabContent.forEach(content => content.style.display = 'none');
                        document.getElementById(`tab-${this.getAttribute('data-tab')}-content`).style.display = 'block';
                        tabs.forEach(tab => tab.classList.remove('active'));
                        this.classList.add('active');
                    });
                });
                
                tabs[0].classList.add('active');
            },
            preConfirm: async () => {
                const isManual = document.querySelector('.swal2-tab.active').getAttribute('data-tab') === '2';
            
                // Verificar si los campos están completos
                if (isManual) {
                    const name = document.getElementById('studentName').value.trim();
                    const lastName1 = document.getElementById('studentLastName1').value.trim();
                    const lastName2 = document.getElementById('studentLastName2').value.trim();
                    const email = document.getElementById('studentEmail').value.trim();
                    const gender = document.getElementById('studentGender').value.trim();
            
                    // Verificar que todos los campos estén completos
                    if (!name || !lastName1 || !lastName2 || !email || !gender) {
                        showErrorAlert("Por favor completa todos los campos.");
                        return false;
                    }
            
                    // Mostrar un segundo SweetAlert para seleccionar el grupo
                    const resultGroup = await Swal.fire({
                        title: 'Selecciona un grupo',
                        input: 'select',
                        inputOptions: await getGroupOptions(), // Obtener las opciones de grupo
                        inputPlaceholder: 'Selecciona un grupo',
                        showCancelButton: true,
                        cancelButtonText: 'Cancelar',
                        confirmButtonText: 'Seleccionar',
                        inputValidator: (value) => {
                            if (!value) {
                                return 'Por favor selecciona un grupo.';
                            }
                        }
                    });
            
                    // Si el usuario cancela, no hacer nada
                    if (resultGroup.isConfirmed) {
                        const grupoSeleccionado = resultGroup.value; // El ID del grupo seleccionado
                        console.log('Grupo seleccionado:', grupoSeleccionado);
                        // Aquí puedes enviar el grupo seleccionado al backend o realizar otras acciones
                    }
            
                    const selectedGroupId = resultGroup.value;
            
                    // Si seleccionamos un grupo, proceder con la inserción de datos
                    try {
                        const response = await fetch(`${apiUrl}/add-students`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                manual: "true",
                                name,
                                lastName1,
                                lastName2,
                                email,
                                gender,
                                grupoId: selectedGroupId // Cambié "groupId" a "grupoId" para que coincida con el backend
                            })
                        });
            
                        const result = await response.json();
                        if (response.ok) {
                            const { mensaje, pdfBase64 } = result; // Desestructuración para obtener la cantidad de omitidos
    
                            // Mostrar mensaje de éxito y cantidad de estudiantes omitidos
                            Swal.fire({
                                icon: 'success',
                                title: '¡Estudiantes agregados!',
                                text: `${mensaje}.`,
                                confirmButtonText: 'Aceptar',
                                confirmButtonColor: '#3e8e41'
                            }).then(() => {
                                // Descargar PDF después del mensaje de éxito
                                descargarPDF(pdfBase64, "Credenciales_Generadas");
                                window.location.reload(); // Recargar la página después
                            });
                        } else {
                            showErrorAlert(result.message);
                        }
                    } catch (error) {
                        showErrorAlert("Error al agregar el estudiante.");
                    }
            
                } else {
                    // Modo archivo: mostrar un segundo SweetAlert para seleccionar el grupo
                    const fileInput = document.getElementById('fileInput').files[0];
                    if (!fileInput) {
                        showErrorAlert("Por favor sube un archivo.");
                        return false;
                    }
            
                    const resultGroup = await Swal.fire({
                        title: 'Selecciona un grupo',
                        input: 'select',
                        inputOptions: await getGroupOptions(), // Obtener las opciones de grupo desde el backend o base de datos
                        inputPlaceholder: 'Selecciona un grupo',
                        showCancelButton: true,
                        cancelButtonText: 'Cancelar',
                        confirmButtonText: 'Seleccionar',
                        inputValidator: (value) => {
                            if (!value) {
                                return 'Por favor selecciona un grupo.';
                            }
                        }
                    });
            
                    if (!resultGroup.isConfirmed) {
                        return false;
                    }
            
                    const selectedGroupId = resultGroup.value;
            
                    try {
                        const estudiantes = await processFileMiddleware(fileInput);
                        const dataToSend = {
                            manual: "false",
                            estudiantes,
                            grupoId: selectedGroupId 
                        };
            
                        const response = await fetch(`${apiUrl}/add-students`, {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(dataToSend)
                        });
            
                        const result = await response.json();
                        if (response.ok) {
                            const { mensaje, pdfBase64 } = result; // Desestructuración para obtener la cantidad de omitidos
    
                            // Mostrar mensaje de éxito y cantidad de estudiantes omitidos
                            Swal.fire({
                                icon: 'success',
                                title: '¡Estudiantes agregados!',
                                text: `${mensaje}.`,
                                confirmButtonText: 'Aceptar',
                                confirmButtonColor: '#3e8e41'
                            }).then(() => {
                                // Descargar PDF después del mensaje de éxito
                                descargarPDF(pdfBase64, "Credenciales_Generadas");
                                window.location.reload(); // Recargar la página después
                            });
                        } else {
                            showErrorAlert(result.message);
                        }
                    } catch (error) {
                        showErrorAlert("Error al procesar el archivo.");
                    }
                }
            }                                  
        });
    };
    
    
  useEffect(() => {
    if ($.fn.dataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().clear().destroy();
    }

    $(tableRef.current).DataTable({
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
      searching: false, // Desactiva la barra de búsqueda
      info: false, // Elimina el texto "Showing X to Y of Z entries"
      destroy: true, // Permite reinicializar la tabla sin errores
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
              Consulta el registro completo de tus estudiantes, acá podrás filtrar por curso y agregar estudiantes.
            </p>
          </div>
          <div className="container__content">
            <div className="content__box">
              <div className="box__title">
                <h3>Tabla de Estudiantes</h3>
              </div>
              <div className="box__table">
              <div className="table__data">
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Código de Curso / Grupo</th> {/* Nueva columna */}
                        </tr>
                    </thead>
                    <tbody>
                        {estudiantes && estudiantes.length > 0 ? (
                            estudiantes.map((est, index) => (
                                <tr key={index}>
                                    <td>{est.Usuario_ID_PK}</td> {/* Código */}
                                    <td>{`${est.Nombre} ${est.Apellido1} ${est.Apellido2}`}</td> {/* Nombre */}
                                    <td>{est.Correo}</td> {/* Correo */}
                                    <td>{`${est.Codigo_Curso} - G${est.Codigo_Grupo}`}</td> {/* Código de Curso y Número de Grupo */}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No hay estudiantes registrados</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
              <div className="box__bottom">
                <div className="bottom__button">
                    <button type="button" onClick={handleAddStudent}>Agregar estudiantes</button>
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
