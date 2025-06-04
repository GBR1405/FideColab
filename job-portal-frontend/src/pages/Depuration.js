import React, { useState, useEffect } from 'react';
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";

const Depuration = () => {
  const [selectedTab, setSelectedTab] = useState('professors');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

// Calcular índices para la paginación
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(data.length / itemsPerPage);

const getData = async () => {
    const historialDataArray = [];
    
    for (let i = 1; i <= 10; i++) {
        historialDataArray.push({
            fecha: `Fecha ${i}`,
            estudiante: `Estudiante ${i}`,
            profesor: `Profesor ${i}`,
            accion: `Acción ${i}`,
            descripcion: `Descripción ${i}`
        });
    }
    
    setData(historialDataArray);
}

// Función para cargar datos de profesores
const getProfessorsData = async () => {
    const professorsDataArray = [];
    
    for (let i = 1; i <= 80; i++) {
        professorsDataArray.push({
            profesor: `Profesor ${i}`,
            estudiante: `Estudiante ${i}`
        });
    }
    
    setData(professorsDataArray);
}

// Función para cargar datos de estudiantes
const getStudentsData = async () => {
    const studentsDataArray = [];
    
    for (let i = 1; i <= 20; i++) {
        studentsDataArray.push({
            profesor: `Profesor ${i}`,
            estudiante: `Estudiante ${i}`
        });
    }
    
    setData(studentsDataArray);
}

// Cargar datos al iniciar el componente
useEffect(() => {
    if (selectedTab === 'history') {
        getData();
    } else if (selectedTab === 'professors') {
        getProfessorsData();
    } else if (selectedTab === 'students') {
        getStudentsData();
    }
}, [selectedTab]);

// Cargar datos iniciales al montar el componente
useEffect(() => {
    // Cargar datos según la pestaña seleccionada por defecto (professors)
    getProfessorsData();
}, []);

// Cambiar página
const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    
    // Cargar datos cuando se selecciona la pestaña de historial
    if (tab === 'history') {
      getData();
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <>
      <LayoutAdmin>
        <section className="depuration__container">
          <div className="depuration__title">
            <h3>Depuración</h3>
          </div>
          <div className="depuration__content">
            {/* Left Sidebar */}
            <div className="depuration__left">
              <div className="left__box" onClick={() => handleTabChange('professors')}>
                <div className="box__shape shape--professors">
                  <i className="fa-solid fa-user-tie"></i>
                </div>
                <div className="right__text">
                  <p className="text__title">Depurar Profesores</p>
                  <p className="text__description">Desde acá podrás depurar, agregar, editar o eliminar profesores.</p>
                </div>
              </div>
              <div className="left__box" onClick={() => handleTabChange('students')}>
                <div className="box__shape shape--students">
                  <i className="fa-solid fa-user-graduate"></i>
                </div>
                <div className="right__text">
                  <p className="text__title">Depurar Estudiantes</p>
                  <p className="text__description">Desde acá podrás depurar, agregar, editar o eliminar estudiantes.</p>
                </div>
              </div>
              <div className="left__box" onClick={() => handleTabChange('history')}>
                <div className="box__shape shape--history">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div className="right__text">
                  <p className="text__title">Depurar Historial</p>
                  <p className="text__description">Desde acá podrás depurar el historial de las partidas.</p>
                </div>
              </div>
              <div className="left__box" onClick={() => handleTabChange('log')}>
                <div className="box__shape shape--log">
                  <i className="fa-solid fa-pen-ruler"></i>
                </div>
                <div className="right__text">
                  <p className="text__title">Depurar Bitácora</p>
                  <p className="text__description">Se eliminará información de acciones hechas por el backend.</p>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="depuration__right">
              {/* Options */}
              <div className="depuration__top">
                <div className="depuration__options">
                  <div className="options__top">
                    <div className="depuration__title">
                      <h3>Acciones</h3>
                    </div>
                    {/* Acción según el tab */}
                    {selectedTab !== 'history' && selectedTab !== 'log' && (
                      <>
                        <div className="option__button button--all">
                          <button type="submit">Eliminar todo</button>
                        </div>
                      </>
                    )}
                    {selectedTab === 'professors' || selectedTab === 'students' ? (
                      <div className="option__button button--unlink">
                        <button type="submit">Desvincular todos</button>
                      </div>
                    ) : null}
                  </div>
                  <div className="options__bottom">
                    <div className="option__search">
                      <i className="fa-solid fa-magnifying-glass"></i>
                      <input 
                        type="search" 
                        placeholder="Busca elemento"
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </div>
                    <div className="option__button button--search">
                      <button type="submit">Buscar</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* List to Depurate */}
              <div className="depuration__bottom">
                  {/* Conditionally render based on the selected tab */}
                  {selectedTab === 'history' ? (
                    <>
                        <div className="bottom__title">
                            <h3>Historial de partidas</h3>
                        </div>
                        <table className="bottom__table">
                            <thead className="table__head">
                              <th className="table__header">Fecha</th>
                              <th className="table__header">Descripción</th>
                            </thead>
                            <tbody className="table__body">
                                {currentItems.map((item, index) => (
                                    <tr className="table__row" key={index}>
                                        <td className="table__data">{item.fecha}</td>
                                        <td className="table__data">{item.descripcion}</td>
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
                    </>
                  ) : selectedTab === 'log' ? (
                    <>
                        <div className="bottom__title">
                            <h3>Bitácora de Acciones</h3>
                        </div>
                        <table className="bottom__table">
                            <thead className="table__head">
                              <th className="table__header">Fecha</th>
                              <th className="table__header">Acción</th>
                              <th className="table__header">Descripción</th>
                            </thead>
                            <tbody className="table__body">
                                {currentItems.map((item, index) => (
                                    <tr className="table__row" key={index}>
                                        <td className="table__data">{item.fecha}</td>
                                        <td className="table__data">{item.accion}</td>
                                        <td className="table__data">{item.descripcion}</td>
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
                    </>
                  ) : selectedTab === 'professors' || selectedTab === 'students' ? (
                    <>
                        <div className="bottom__title">
                            <h3>{selectedTab === 'professors' ? "Lista de profesores" : "Lista de estudiantes"}</h3>
                        </div>
                        <table className="bottom__table">
                            <thead className="table__head">
                              <th className="table__header">Nombre</th>
                              <th className="table__header">Acciones</th>
                            </thead>
                            <tbody className="table__body">
                                {currentItems.map((item, index) => (
                                    <tr className="table__row" key={index}>
                                        <td className="table__data">{selectedTab === 'professors' ? item.profesor : item.estudiante}</td>
                                        <td className="table__data">
                                          <button className="button__edit">
                                            <i className="fa-solid fa-pen-to-square"></i>
                                          </button>
                                          <button className="button__ban">
                                            <i className="fa-solid fa-ban"></i>
                                          </button> 
                                        </td>
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
                    </>
                  ) : (
                    <span>Selecciona un elemento para depurar.</span>
                  )}
              </div>
            </div>
          </div>
        </section>
      </LayoutAdmin>
    </>
  );
};

export default Depuration;
