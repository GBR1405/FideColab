import React, { useState } from 'react';
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";

const Depuration = () => {
  const [selectedTab, setSelectedTab] = useState('professors');
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
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
                <div className="box__shape">
                  <i className="fa-solid fa-user-tie"></i>
                </div>
                <div className="right__text">
                  <p className="text__title">Depurar Profesores</p>
                  <p className="text__description">Desde acá podrás depurar, agregar, editar o eliminar profesores.</p>
                </div>
              </div>
              <div className="left__box" onClick={() => handleTabChange('students')}>
                <div className="box__shape_y">
                  <i className="fa-solid fa-user-graduate"></i>
                </div>
                <div className="right__text">
                  <p className="text__title">Depurar Estudiantes</p>
                  <p className="text__description">Desde acá podrás depurar, agregar, editar o eliminar estudiantes.</p>
                </div>
              </div>
              <div className="left__box" onClick={() => handleTabChange('history')}>
                <div className="box__shape_yh">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div className="right__text">
                  <p className="text__title">Depurar Historial</p>
                  <p className="text__description">Desde acá podrás depurar el historial de las partidas.</p>
                </div>
              </div>
              <div className="left__box" onClick={() => handleTabChange('log')}>
                <div className="box__shape_g">
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
                <div className="bottom__title">
                  <h3>Lista a depurar</h3>
                </div>
                <div className="bottom__content">
                  {/* Conditionally render based on the selected tab */}
                  {selectedTab === 'history' ? (
                    <div>
                      <h4>Historial de Partidas</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Descripción</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Fecha 1</td>
                            <td>Descripción de la partida</td>
                          </tr>
                          {/* Más filas */}
                        </tbody>
                      </table>
                    </div>
                  ) : selectedTab === 'log' ? (
                    <div>
                      <h4>Bitácora de Acciones</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Acción</th>
                            <th>Descripción</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Fecha 1</td>
                            <td>Acción Realizada</td>
                            <td>Descripción de la acción realizada en el backend</td>
                          </tr>
                          {/* Más filas */}
                        </tbody>
                      </table>
                    </div>
                  ) : selectedTab === 'professors' || selectedTab === 'students' ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{selectedTab === 'professors' ? 'Profesor 1' : 'Estudiante 1'}</td>
                          <td>
                            <button>Eliminar</button>
                            <button>Editar</button>
                          </td>
                        </tr>
                        {/* Más filas */}
                      </tbody>
                    </table>
                  ) : (
                    <span>Selecciona un elemento para depurar.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </LayoutAdmin>
    </>
  );
};

export default Depuration;
