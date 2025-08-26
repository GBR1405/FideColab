import React, { useEffect, useRef, useState } from "react";
import "../styles/professorComponents.css";
import "../styles/adminComponents.css";
import LayoutProfessor from "../components/Layout";
import $ from "jquery";
import "datatables.net";
import * as Swal from 'sweetalert2';
import Cookies from "js-cookie";
import { processFileMiddleware } from '../LN/processFileMiddleware';
import Plantilla from '../docs/Plantilla.xlsx';


const apiUrl = process.env.REACT_APP_API_URL;
const token = Cookies.get("authToken");

const ProfessorStudents = () => {
  const tableRef = useRef(null);  
  const [gruposDisponibles, setGruposDisponibles] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(5);

  const [filters, setFilters] = useState({
    nombre: '',
    curso: '',
    grupo: ''
  });

  
  // Obtener cursos únicos al cargar el componente
  useEffect(() => {
    if (estudiantes && estudiantes.length > 0) {
      const cursosUnicos = [...new Set(
        estudiantes.map(est => `${est.Codigo_Curso} - G${est.Codigo_Grupo}`)
      )];
      setAllCourses(cursosUnicos);
    }
  }, [estudiantes]);
  
  // Función para manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Función para aplicar los filtros
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    // La paginación se reseteará al aplicar nuevos filtros
    setCurrentPage(1);
  };
  
  // Filtrar estudiantes
  const filteredStudents = estudiantes ? estudiantes.filter(est => {
    const nombreCompleto = `${est.Nombre} ${est.Apellido1} ${est.Apellido2}`.toLowerCase();
    const cursoGrupo = `${est.Codigo_Curso} - G${est.Codigo_Grupo}`;
    
    return (
      nombreCompleto.includes(filters.nombre.toLowerCase()) &&
      cursoGrupo.includes(filters.curso) &&
      (filters.grupo === '' || est.Codigo_Grupo.includes(filters.grupo))
    );
  }) : [];
  
  // Ordenar estudiantes por código (mayor a menor)
  const sortedStudents = [...filteredStudents].sort((a, b) => 
    b.Usuario_ID_PK - a.Usuario_ID_PK
  );
   
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
                <input type="file" id="fileInput" class="custom-file-input" accept=".xlsx, .xls" />
                <div style="margin-top: 10px; text-align: center;">
                 <a href="${Plantilla}" download="Plantilla.xlsx" style="
                    display: inline-block;
                    background-color: #3498db;
                    color: white;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    text-decoration: none;
                    font-family: inherit;
                    ">
                    Descargar Plantilla
                    </a>
                </div>
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
            
            // Validar tipo de archivo al seleccionar
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
              fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                  const validExtensions = ['.xlsx', '.xls'];
                  const fileName = file.name.toLowerCase();
                  const isValid = validExtensions.some(ext => fileName.endsWith(ext));
                  
                  if (!isValid) {
                    Swal.showValidationMessage('Solo se permiten archivos Excel (.xlsx, .xls)');
                    e.target.value = ''; // Limpiar el input
                  } else {
                    Swal.resetValidationMessage();
                  }
                }
              });
            }
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
                inputOptions: await getGroupOptions(),
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
                const grupoSeleccionado = resultGroup.value;
                console.log('Grupo seleccionado:', grupoSeleccionado);
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
                    grupoId: selectedGroupId
                  })
                });
        
                const result = await response.json();
                if (response.ok) {
                  const { mensaje, pdfBase64 } = result;
        
                  Swal.fire({
                    icon: 'success',
                    title: '¡Estudiantes agregados!',
                    text: `${mensaje}.`,
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#3e8e41'
                  }).then(() => {
                    window.location.reload();
                  });
                } else {
                  showErrorAlert(result.message);
                }
              } catch (error) {
                showErrorAlert("Error al agregar el estudiante.");
              }
        
            } else {
              // Modo archivo
              const fileInput = document.getElementById('fileInput').files[0];
              if (!fileInput) {
                showErrorAlert("Por favor sube un archivo.");
                return false;
              }
        
              // Validar extensión del archivo
              const validExtensions = ['.xlsx', '.xls'];
              const fileName = fileInput.name.toLowerCase();
              const isValid = validExtensions.some(ext => fileName.endsWith(ext));
              
              if (!isValid) {
                showErrorAlert("Solo se permiten archivos Excel (.xlsx, .xls)");
                return false;
              }
        
              const resultGroup = await Swal.fire({
                title: 'Selecciona un grupo',
                input: 'select',
                inputOptions: await getGroupOptions(),
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

               Swal.fire({
                  title: 'Agregando estudiante...',
                  text: 'Por favor espera un momento.',
                  allowOutsideClick: false,
                  didOpen: () => Swal.showLoading()
                });
        
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

                Swal.close();

                if (response.ok) {
                  const { mensaje, pdfBase64 } = result;
        
                  Swal.fire({
                    icon: 'success',
                    title: '¡Estudiantes agregados!',
                    text: `${mensaje}.`,
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#3e8e41'
                  }).then(() => {
                    window.location.reload();
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

    const handleUnlinkStudent = async (studentId) => {
      const result = await Swal.fire({
          title: '¿Desvincular estudiante?',
          text: "Esta acción no se puede deshacer",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, desvincular',
          cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
          try {
              Swal.fire({
                  title: 'Desvinculando estudiante...',
                  allowOutsideClick: false,
                  didOpen: () => Swal.showLoading()
              });

              const response = await fetch(`${apiUrl}/desvincular-estudiante`, {
                  method: 'POST',
                  credentials: 'include',
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ estudianteId: studentId })
              });

              const data = await response.json();

              if (response.ok) {
                  Swal.fire({
                      icon: 'success',
                      title: '¡Estudiante desvinculado!',
                      text: data.mensaje,
                      confirmButtonText: 'Aceptar',
                      confirmButtonColor: '#3e8e41'
                  }).then(() => {
                      // Actualizar la lista de estudiantes
                      const updatedEstudiantes = estudiantes.filter(est => est.Usuario_ID_PK !== studentId);
                      setEstudiantes(updatedEstudiantes);
                  });
              } else {
                  showErrorAlert(data.mensaje || "Error al desvincular estudiante");
              }
          } catch (error) {
              showErrorAlert("Error al desvincular estudiante");
          }
      }
  };

  const handleUnlinkAllStudents = async () => {
    console.log("Iniciando handleUnlinkAllStudents");
    try {
        // Mostrar selector de grupo
        console.log("Obteniendo opciones de grupos...");
        const groupOptions = await getGroupOptions();
        console.log("Opciones de grupos obtenidas:", groupOptions);

        const resultGroup = await Swal.fire({
            title: 'Selecciona un grupo para desvincular',
            input: 'select',
            inputOptions: groupOptions,
            inputPlaceholder: 'Selecciona un grupo',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Continuar',
            inputClass: 'swal2-select-wide', 
            inputValidator: (value) => {
                if (!value) {
                    return 'Por favor selecciona un grupo.';
                }
            }
        });

        if (!resultGroup.isConfirmed) {
            console.log("Usuario canceló la selección de grupo");
            return;
        }

        const grupoId = resultGroup.value;
        const grupoNombre = groupOptions[grupoId];
        console.log("Grupo seleccionado - ID:", grupoId, "Nombre:", grupoNombre);

        // Confirmación con temporizador
        let timerInterval;
        const confirmationResult = await Swal.fire({
            title: `¿Desvincular todos los estudiantes de ${grupoNombre}?`,
            html: 'Esta acción no se puede deshacer. El botón se habilitará en <b></b> segundos.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Desvincular (3)',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
            allowOutsideClick: false,
            didOpen: () => {
                const confirmButton = Swal.getConfirmButton();
                confirmButton.disabled = true;
                let timeLeft = 3;
                timerInterval = setInterval(() => {
                    timeLeft--;
                    Swal.getHtmlContainer().querySelector('b').textContent = timeLeft;
                    confirmButton.textContent = `Desvincular (${timeLeft})`;
                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        confirmButton.disabled = false;
                        confirmButton.textContent = 'Desvincular';
                    }
                }, 1000);
            }
        });

        clearInterval(timerInterval);
        
        if (!confirmationResult.isConfirmed) {
            console.log("Usuario canceló la confirmación");
            return;
        }

        console.log("Iniciando proceso de desvinculación...");
        Swal.fire({
            title: 'Desvinculando estudiantes...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        console.log("Enviando petición al backend...");
        const response = await fetch(`${apiUrl}/desvincular-todos-estudiantes`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ grupoId })
        });

        console.log("Respuesta recibida, status:", response.status);
        const data = await response.json();
        console.log("Datos de respuesta:", data);

        if (response.ok) {
            console.log("Desvinculación exitosa, actualizando estado...");
            Swal.fire({
                icon: 'success',
                title: '¡Estudiantes desvinculados!',
                text: data.mensaje,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#3e8e41'
            }).then(() => {
                // Actualizar la lista de estudiantes
                const cursoCodigo = grupoNombre.split(' - ')[0].trim();
                console.log("Filtrando estudiantes por código de curso:", cursoCodigo);
                const updatedEstudiantes = estudiantes.filter(est => 
                    est.Codigo_Curso !== cursoCodigo
                );
                console.log("Estudiantes después de filtrar:", updatedEstudiantes);
                setEstudiantes(updatedEstudiantes);
            });
        } else {
            console.error("Error en la respuesta del servidor:", data);
            showErrorAlert(data.mensaje || "Error al desvincular estudiantes");
        }
    } catch (error) {
        console.error("Error en handleUnlinkAllStudents:", error);
        showErrorAlert("Error al procesar la solicitud: " + error.message);
    }
};

  // Paginación para estudiantes filtrados y ordenados
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = sortedStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);

  const [showNoData, setShowNoData] = useState(false);

  useEffect(() => {
    if (!estudiantes || estudiantes.length === 0) {
      const timer = setTimeout(() => {
        setShowNoData(true);
      }, 5000); // Esperar 5 segundos

      return () => clearTimeout(timer);
    }
  }, [estudiantes]);

  


  return (
    <>
      <LayoutProfessor>       
        <section className="student__container">
          <div className="container__up">
            <div className="up__text">
              <div className="container__title">
                <h3>Estudiantes</h3>
              </div>
              <div className="container__description">
                <p>
                  Consulta el registro completo de tus estudiantes, acá podrás filtrar por curso y agregar estudiantes.
                </p>
              </div>
            </div>
            <div className="up__button">
              <button className="button__add" type="button" onClick={handleAddStudent}>Agregar estudiantes</button>
              <button 
                  className="button__add" 
                  type="button" 
                  onClick={handleUnlinkAllStudents}
                  style={{ marginLeft: '10px', backgroundColor: '#d33' }}
              >
                  Desvincular todos
              </button>
          </div>          
          </div>          
          <div className="container__content">
            <div className="content__box">
              <div className="box__title">
                <h3>Tabla de Estudiantes</h3>
              </div>
              <table className="box__table">
                <thead className="table__head">
                  <th className="hidden-column" width="15%">Código</th>
                  <th className="table__header" width="30%">Nombre</th>
                  <th className="table__header" width="25%">Correo</th>
                  <th className="table__header" width="20%">Curso/Grupo</th>
                  <th className="table__header" width="10%">Acciones</th>
                </thead>
                <tbody className="table__body_P">
                  {estudiantes && estudiantes.length > 0 ? (
                    currentStudents.map((est, index) => (
                      <tr className="table__row" key={index}>
                        <td className="hidden-column">{est.Usuario_ID_PK}</td>
                        <td className="table__data">{`${est.Nombre} ${est.Apellido1} ${est.Apellido2}`}</td>
                        <td className="table__data">{est.Correo}</td>
                        <td className="table__data">{`${est.Codigo_Curso} - G${est.Codigo_Grupo}`}</td>
                        <td className="table__data">
                          <button 
                            className="button__orange"
                            title="Desvincular estudiante"
                            onClick={() => handleUnlinkStudent(est.Usuario_ID_PK)}
                          >
                            <i className="fas fa-unlink"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr className="table__row loader__row">
                      <td colSpan="5">
                        <div className="loader__wrapper">
                          <div className="loader"></div>
                        </div>
                      </td>
                    </tr>
                    <tr className="table__row no-data__row">
                      <td colSpan="5">
                        <div
                          className="no-data"
                          style={{ display: showNoData ? 'flex' : 'none' }}
                        >
                          No hay estudiantes registrados
                        </div>
                      </td>
                    </tr>
                    </>
                  )}
                </tbody>
                <tfoot className="table__foot">
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
            </div>            
            <div className="content__box">
                <div className="box__title">
                    <h3>Filtros Avanzados</h3>
                </div>
                <form onSubmit={(e) => e.preventDefault()} className="box__filter">
                  <div className="box__text">
                    <div className="text__shape">
                          <label className="">Nombre del Estudiante</label>
                          <input 
                              className="shape__input"
                              type="text" 
                              name="nombre"
                              value={filters.nombre}
                              onChange={handleFilterChange}
                          />
                    </div>
                    <div className="text__shape">
                          <label className="">Curso/Grupo</label>
                          <select className="shape__input" name="curso" value={filters.curso} onChange={handleFilterChange}>
                            <option value="">Todos los cursos</option>
                            {gruposDisponibles.map((grupo, index) => (
                            <option key={index} value={`${grupo.Codigo_Curso} - G${grupo.Codigo_Grupo}`}>
                                {`${grupo.Codigo_Curso} - ${grupo.Nombre_Curso} - G${grupo.Codigo_Grupo}`}
                            </option>
                            ))}
                          </select>
                    </div>
                  </div>                              
                  <div className="box__button">
                      <button 
                      type="button"
                      onClick={() => {
                          setFilters({ nombre: '', curso: '', grupo: '' });
                          setCurrentPage(1);
                      }}
                      >
                      Limpiar Filtros
                      </button>
                  </div>
                </form>
            </div>              
          </div>
        </section>
      </LayoutProfessor>
    </>
  );
};

export default ProfessorStudents;
