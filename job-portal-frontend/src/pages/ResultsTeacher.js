// ResultsTeacher.js
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from 'react-router-dom';
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import "../styles/resultsTeacher.css";

const apiUrl = process.env.REACT_APP_API_URL;

function ResultsTeacher() {
  const { partidaId } = useParams();
  const [equipos, setEquipos] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [logros, setLogros] = useState({});
  const [partida, setPartida] = useState(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [imagenesDibujo, setImagenesDibujo] = useState([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getGameIcon = (tipoJuego) => {
    switch(tipoJuego) {
      case 'Dibujo':
        return 'fa-paintbrush';
      case 'Parejas':
        return 'fa-layer-group';
      case 'Diferencias':
        return 'fa-puzzle-piece';
      case 'Preguntas':
        return 'fa-question-circle';
      case 'Memoria':
        return 'fa-brain';
      default:
        return 'fa-gamepad';
    }
  };

  const handleSalirClick = () => {
    
    navigate('/homescreen');
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    
    equipos.forEach((equipo, index) => {
      if (index > 0) doc.addPage();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 53, 147);
      doc.text('Universidad Fidelitas', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`Grupo: ${equipo.equipo}`, 20, 35);
      doc.text(`Fecha: ${new Date(partida?.FechaFin).toLocaleDateString()}`, 160, 35);
      
      // Línea divisoria
      doc.setDrawColor(40, 53, 147);
      doc.setLineWidth(0.5);
      doc.line(20, 40, 190, 40);
      
      // Miembros del equipo
      doc.setFontSize(14);
      doc.text('Integrantes:', 20, 50);
      
      let yPos = 60;
      equipo.miembros.forEach(miembro => {
        doc.setFontSize(12);
        doc.text(`${miembro.Nombre} ${miembro.Apellido1} ${miembro.Apellido2 || ''}`, 30, yPos);
        yPos += 10;
      });
      
      // Resultados del equipo
      const resultadosEquipo = obtenerResultadosGrupo(equipo.equipo);
      yPos += 10;
      
      doc.setFontSize(14);
      doc.text('Resultados:', 20, yPos);
      yPos += 10;
      
      resultadosEquipo.forEach((juego, i) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.text(`Juego ${i + 1}: ${juego.tipoJuego}`, 30, yPos);
        doc.text(`Tiempo: ${formatearTiempo(juego.tiempo || 0)}`, 30, yPos + 10);
        doc.text(`Dificultad: ${juego.dificultad || 'No definida'}`, 30, yPos + 20);
        
        if (juego.progreso) {
          doc.text(`Progreso: ${juego.progreso}`, 30, yPos + 30);
        }
        
        yPos += 40;
      });
      
      // Logros del equipo
      if (logros[equipo.equipo]?.length > 0) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.text('Logros obtenidos:', 20, yPos);
        yPos += 10;
        
        logros[equipo.equipo].forEach(logro => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFontSize(12);
          doc.text(`• ${logro.Nombre}: ${logro.Descripcion}`, 30, yPos);
          yPos += 10;
        });
      }
    });
    
    doc.save(`resultados_partida_${partidaId}.pdf`);
  };

  const handleNextClick = useCallback(() => {
    setActive((prev) => (prev + 1 < imagenesDibujo.length ? prev + 1 : 0));
  }, [imagenesDibujo.length]);

  const handlePrevClick = () => {
    setActive((prev) => (prev - 1 >= 0 ? prev - 1 : imagenesDibujo.length - 1));
  };

  useEffect(() => {
    const interval = setInterval(handleNextClick, 5000);
    return () => clearInterval(interval);
  }, [handleNextClick]);

  useEffect(() => {
    const fetchResults = async () => {
      const token = Cookies.get("authToken");
      try {
        const response = await fetch(`${apiUrl}/resultados/${partidaId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Error al obtener resultados');
        const data = await response.json();

        setEquipos(data.equipos || []);
        console.log('Equipos:', data.resultados);
        setResultados(data.resultados || []);
        setLogros(data.logros || {});
        setPartida(data.partida || null);
        setGrupoSeleccionado(data.equipos?.[0]?.equipo || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [partidaId]);

  const AchievementBadge = ({ logro }) => {
  
  // Determinar el icono según el tipo de logro
  const getIcon = () => {
    if (logro.Tipo === 'grupo') return 'fa-users';
    
    // Iconos para logros personales basados en el nombre
    if (logro.Nombre.includes('Diseñador')) return 'fa-paintbrush';
    if (logro.Nombre.includes('Localizador de parejas')) return 'fa-layer-group';
    if (logro.Nombre.includes('Localizador de detalles')) return 'fa-puzzle-piece';
    if (logro.Nombre.includes('Adivinador')) return 'fa-question';
    if (logro.Nombre.includes('Jugador de partidas')) return 'fa-gamepad';
    if (logro.Nombre.includes('Hola de nuevo')) return 'fa-handshake';
    if (logro.Nombre.includes('Cazador de logros')) return 'fa-trophy';
    if (logro.Nombre.includes('Gracias por jugar')) return 'fa-heart';
    
    return 'fa-star';
  };

  // Determinar el color del borde según el nivel (si aplica)
  const getBorderColor = () => {
    if (logro.Tipo === 'grupo') return '#2a40bf'; // Azul para grupales
    
    // Colores para niveles de logros personales
    if (logro.Nombre.includes('Nivel 4')) return '#d4af37'; // Oro
    if (logro.Nombre.includes('Nivel 3')) return '#c0c0c0'; // Plata
    if (logro.Nombre.includes('Nivel 2')) return '#cd7f32'; // Bronce
    
    return '#2a40bf'; // Azul por defecto
  };

  const showAwardDescription = () => {
    Swal.fire({
      customClass: {
        popup: 'award__description'
      },
      showConfirmButton: false,
      showCloseButton: false,
      html: 
      `
      <div class="description__icon">
        <button class="award">
          <div class="award__border" style="background-color: ${getBorderColor()};"></div>
          <div class="award__body">
            <i class="fa-solid ${getIcon()}"></i>
          </div>
        </button>
      </div>      
      <div class="award__title">
        <h4>${logro.Nombre}</h4>
      </div>
      <div class="award__details">
        <p>${logro.Descripcion}</p>
      </div>  
      `
    });
  }

  return (
    <button className="award" onClick={showAwardDescription}>
      <div className="award__border" style={{ backgroundColor: getBorderColor() }}></div>
      <div className="award__body">
        <i className={`fa-solid ${getIcon()}`}></i>
      </div>
      <div className="award__ribbon ribbon--left"></div>
      <div className="award__ribbon ribbon--right"></div>
    </button>
  );
};

  const isValidImage = (str) => {
    return str && typeof str === 'string' && 
          (str.startsWith('data:image/png;base64,') || 
          str.startsWith('data:image/jpeg;base64,')) &&
          str.length > 100;
  };

  // Y en el render:
  {imagenesDibujo.map((src, i) => (
    isValidImage(src) ? (
      <img key={i} className="image__item" src={src} alt={`Dibujo ${i + 1}`} />
    ) : (
      <div key={i}>Imagen no válida</div>
    )
  ))}

  useEffect(() => {
  if (!grupoSeleccionado) return;
  const resultadoGrupo = resultados.find(r => r.equipo === grupoSeleccionado);
  if (!resultadoGrupo || !resultadoGrupo.resultados) return;

  const imagenes = resultadoGrupo.resultados
    .map(r => {
      try {
        // Verificar si ya está parseado o necesita parsearse
        const parsed = typeof r.Resultados === 'string' ? JSON.parse(r.Resultados) : r.Resultados;
        return parsed
          .filter(j => j.tipoJuego === 'Dibujo' && 
            (j.comentario?.startsWith('data:image') || j.progreso?.startsWith('data:image')))
          .map(j => j.comentario?.startsWith('data:image') ? j.comentario : j.progreso);
      } catch (error) {
        console.error('Error al parsear resultados:', error);
        return [];
      }
    })
    .flat()
    .filter(Boolean); // Eliminar valores nulos/undefined

  setImagenesDibujo(imagenes);
}, [grupoSeleccionado, resultados]);

  const obtenerMiembros = (grupo) => {
    const equipo = equipos.find(e => e.equipo === grupo);
    return equipo?.miembros || [];
  };

  const obtenerResultadosGrupo = (grupo) => {
    const grupoResult = resultados.find(r => r.equipo === grupo);
    if (!grupoResult?.resultados?.[0]) return [];

    try {
      return JSON.parse(grupoResult.resultados[0].Resultados);
    } catch {
      return [];
    }
  };

  const handleGrupoClick = (grupo) => {
    setGrupoSeleccionado(grupo);
    setActive(0);
  };

  const formatearTiempo = (segundos) => {
    const min = Math.floor(segundos / 60).toString().padStart(2, '0');
    const sec = (segundos % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

    const miembros = obtenerMiembros(grupoSeleccionado);
  const juegos = obtenerResultadosGrupo(grupoSeleccionado);

  return (
    <div className="results__body">
      <header className="header">
        <Link to="/" className="logo__link">
          <img className="image__source" src="https://i.postimg.cc/NGzXwBp6/logo.png" alt="Logo institución" />
          <div><h2 className="logo__text">FideColab</h2></div>
        </Link>
        <div className="header__title">
          <h1 className="title__text">Resultados</h1>
        </div>
      </header>

      <main className="main">
        {loading ? (
        <div className="loading__container">
          <div className="loader"></div>
          <p className="loading__text">Cargando resultados...</p>
        </div>
      ) : error ? (
        <div className="error-message">
            <i className="fa-solid fa-triangle-exclamation"></i> Error: {error}
          </div>
      ) : equipos.length === 0 ? (
        <div className="no-results">
            <i className="fa-solid fa-magnifying-glass"></i> No se encontraron resultados
          </div>
      ) : (
        <div className="results__container">
            {/* Lado izquierdo: Miembros y medallas */}
            <div className="container__left">
              <div className="container__box">
                <div className="box__title"><h3>Miembros</h3></div>
                <div className="box__group">
                  {miembros.map((m, i) => (
                    <div key={i} className="group__shape">
                      <h4 className="shape__name" style={{textAlign: 'center', width: '100%', padding: '0 10px'}}>
                        {m.Nombre} {m.Apellido1} {m.Apellido2}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>

              <div className="container__box">
                <div className="box__title"><h3>Logros</h3></div>
                <div className="box__content">
                  <div className="content__list">
                    <div className="list__award">
                      {(logros?.[grupoSeleccionado]?.length > 0) ? (
                        logros[grupoSeleccionado].map((logro, i) => (
                          <AchievementBadge key={i} logro={logro} />
                        ))
                      ) : (
                        <div style={{
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          height: '100%',
                          width: '100%'
                        }}>
                          <p style={{
                            fontWeight: 'bold', 
                            fontSize: '1.2rem',
                            color: '#2a40bf',
                            textAlign: 'center'
                          }}>No hay logros disponibles</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Centro: Juegos */}
            <div className="container__center">
              <div className="container__box">
                <div className="box__title"><h3>Progreso de la Partida</h3></div>
                <div className="box__results">
                  <div className="results__header" style={{
                    backgroundColor: 'white',
                    boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.04)',
                    borderBottomLeftRadius: '1em',
                    borderBottomRightRadius: '1em',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '10px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '80%',
                      maxWidth: '400px'
                    }}>
                      <h4>Grupo: {grupoSeleccionado}</h4>
                      <h4>Fecha: {new Date(partida?.FechaFin).toLocaleDateString()}</h4>
                    </div>
                  </div>
                  <div className="results__content">
                    {juegos.map((juego, index) => (
                      <div key={index} className="results__shape">
                        <div className="shape__icon">
                          <i className={`fa-solid ${
                            juego.tipoJuego === 'Dibujo' ? 'fa-paintbrush' :
                            juego.tipoJuego === 'Parejas' ? 'fa-layer-group' :
                            juego.tipoJuego === 'Diferencias' ? 'fa-puzzle-piece' :
                            juego.tipoJuego === 'Preguntas' ? 'fa-question-circle' :
                            juego.tipoJuego === 'Memoria' ? 'fa-brain' :
                            'fa-gamepad'
                          }`}></i>
                        </div>
                        <div className="shape__data">
                          <div className="data__text">
                            <h4 className="data__title">Juego #{juego.juegoNumero}</h4>
                            <p className="data__text">{juego.tipoJuego}</p>
                          </div>
                          <div className="data__text">
                            <h4 className="data__title">Tiempo:</h4>
                            <p className="data__text">{formatearTiempo(juego.tiempo || 0)}</p>
                          </div>
                          <div className="data__text">
                            <h4 className="data__title">Progreso:</h4>
                            <p className="data__text">
                              {juego.progreso ? (
                                typeof juego.progreso === 'string' ? (
                                  juego.progreso.startsWith('data:image') ? 'Dibujo completado' : juego.progreso
                                ) : (
                                  typeof juego.progreso === 'number' ? `${juego.progreso}% completado` : 'Progreso registrado'
                                )
                              ) : 'No disponible'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Lado derecho: Grupos e imágenes */}
            <div className="container__right">
              <div className="right__groups">
                <div className="box__title"><h3>Grupos</h3></div>
                <div className="right__box">
                  <div className="box__list">
                    {equipos.map(e => {
                      const tiempoGrupo = obtenerResultadosGrupo(e.equipo)
                        .reduce((acc, j) => acc + (j.tiempo || 0), 0);
                      return (
                        <div
                          key={e.equipo}
                          className={`list__group ${e.equipo === grupoSeleccionado ? 'grupo-activo' : ''}`}
                          onClick={() => handleGrupoClick(e.equipo)}
                        >
                          <h4>Grupo {e.equipo}</h4>
                          <h4>{formatearTiempo(tiempoGrupo)}</h4>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="right__buttons">
                  <button 
                    className="right__button"
                    onClick={handleSalirClick}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      marginRight: '10px'
                    }}
                  >
                    <i className="fa-solid fa-door-open" style={{marginRight: '8px'}}></i>
                    Salir
                  </button>
                  <button 
                    className="right__button"
                    onClick={generarPDF}
                    style={{
                      backgroundColor: '#4CAF50',
                      color: 'white'
                    }}
                  >
                    <i className="fa-solid fa-file-pdf" style={{marginRight: '8px'}}></i>
                    Descargar PDF
                  </button>
                </div>
              </div>

              <div className="right__images">
                <div className="right__slider">
                  {imagenesDibujo.length > 0 ? (
                    <>
                      <div className="slider__images">
                        {imagenesDibujo.length > 0 && (
                          <img 
                            className="image__item" 
                            src={imagenesDibujo[active]} 
                            alt={`Dibujo ${active + 1}`}
                          />
                        )}
                      </div>
                      <div className="slider__nav">
                        <button className="nav__button" onClick={handlePrevClick}>
                          <i className="fa-solid fa-caret-left"></i>
                        </button>
                        <button className="nav__button" onClick={handleNextClick}>
                          <i className="fa-solid fa-caret-right"></i>
                        </button>
                      </div>
                      <button className="button__download" onClick={() => {
                        const link = document.createElement('a');
                        link.href = imagenesDibujo[active];
                        link.download = `imagen-${active + 1}.png`;
                        link.click();
                      }}>
                        <i className="fa-solid fa-download"></i>
                      </button>
                    </>
                  ) : (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                      width: '100%'
                    }}>
                      <p style={{
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        color: '#2a40bf',
                        textAlign: 'center'
                      }}>Sin dibujos disponibles</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ResultsTeacher;
