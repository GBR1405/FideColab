import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import { useDrag, useDrop } from 'react-dnd';
import "../styles/professorComponents.css";
import LayoutProfessor from "../components/Layout";

const apiURL = process.env.REACT_APP_API_URL;
const secretKey = process.env.REACT_APP_SECRET_KEY;

const CreatePersonalization = ({ personalizacionId }) => {
  const [juegosDisponibles, setJuegosDisponibles] = useState([]);
  const [juegosSeleccionados, setJuegosSeleccionados] = useState([]);
  const [tituloPersonalizacion, setTituloPersonalizacion] = useState("");
  const [currentImagePage, setCurrentImagePage] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    axios.get(`${apiURL}/tipo-juegos`).then((res) => {
      if (res.data.success) {
        setJuegosDisponibles(res.data.juegos);
      }
    });

    if (personalizacionId) {
      axios
        .get(`${apiURL}/personalizacion?id=${personalizacionId}`)
        .then((res) => {
          if (res.data.success) {
            setJuegosSeleccionados(
              res.data.juegos.sort((a, b) => a.orden - b.orden)
            );
            setTituloPersonalizacion(res.data.titulo || "");
          }
        });
    }
  }, [personalizacionId]);

  const obtenerTemas = async (juegoId) => {
    try {
      const res = await axios.get(`${apiURL}/temas-juego/${juegoId}`);
      return res.data.success ? res.data.temas : [];
    } catch (error) {
      console.error("Error al obtener temas:", error);
      return [];
    }
  };

  const agregarJuego = async (juego) => {
    // Verificación inmediata + estado local
    if (juegosSeleccionados.length >= 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite alcanzado',
        text: 'Solo puedes seleccionar hasta 5 juegos',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Deshabilitar botones temporalmente
    const gameButtons = document.querySelectorAll('.game__shape');
    gameButtons.forEach(btn => btn.disabled = true);

    const temas = await obtenerTemas(juego.Tipo_Juego_ID_PK);
    const dificultad = juego.Juego === "Dibujo" ? 1 : 1;

    const nuevoJuego = {
      ...juego,
      orden: juegosSeleccionados.length + 1,
      dificultad,
      tema: juego.Juego === "Memoria" ? null : (temas.length > 0 ? temas[0].Tema_Juego_ID_PK : ""),
      temas,
      necesitaSeleccionarImagen: juego.Juego === "Rompecabezas"
    };

    setJuegosSeleccionados(prev => {
      const updated = [...prev, nuevoJuego];
      // Verificación adicional por si acaso
      return updated.length <= 5 ? updated : updated.slice(0, 5);
    });

    // Rehabilitar botones después de 500ms
    setTimeout(() => {
      gameButtons.forEach(btn => btn.disabled = false);
    }, 500);

    if (juego.Juego === "Rompecabezas") {
      const index = juegosSeleccionados.length;
      setTimeout(() => {
        setCurrentImageIndex(index);
        setShowImageModal(true);
      }, 100);
    }
  };

  const actualizarJuego = (index, campo, valor) => {
    setJuegosSeleccionados((prev) => {
      const updatedJuegos = [...prev];
      updatedJuegos[index][campo] = valor;
      
      if (campo === 'tema' && updatedJuegos[index].necesitaSeleccionarImagen) {
        updatedJuegos[index].necesitaSeleccionarImagen = false;
      }
      
      updatedJuegos[index].orden = index + 1;
      return updatedJuegos;
    });
  };

  const eliminarJuego = (index) => {
    setJuegosSeleccionados((prev) => {
      const updatedJuegos = [...prev];
      updatedJuegos.splice(index, 1);
      return updatedJuegos.map((juego, idx) => ({
        ...juego,
        orden: idx + 1
      }));
    });
  };

  const guardarConfiguracion = () => {

      const rompecabezasJuegos = juegosSeleccionados.filter(j => j.Juego === "Rompecabezas");

      const temasUsados = new Set();
      let imagenDuplicada = false;
      let imagenFaltante = false;

      rompecabezasJuegos.forEach(juego => {
        if (!juego.tema) {
          imagenFaltante = true;
        } else if (temasUsados.has(juego.tema)) {
          imagenDuplicada = true;
        } else {
          temasUsados.add(juego.tema);
        }
      });

      if (imagenFaltante) {
        Swal.fire({
          icon: 'error',
          title: 'Imágenes faltantes',
          text: 'Hay juegos de rompecabezas sin imagen seleccionada',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      if (imagenDuplicada) {
        Swal.fire({
          icon: 'error',
          title: 'Imágenes repetidas',
          text: 'Cada juego de rompecabezas debe tener una imagen distinta',
          confirmButtonText: 'Entendido'
        });
        return;
      }


    if (tituloPersonalizacion.trim() === "") {
      Swal.fire("Error", "Por favor ingrese un título para la personalización", "error");
      return;
    }

    const userInfoCookie = Cookies.get("IFUser_Info");
    if (!userInfoCookie) {
      Swal.fire("Error", "No se pudo obtener la información del usuario.", "error");
      return;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(userInfoCookie, secretKey);
      const userData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      const usuarioId = userData.id;
      const token = Cookies.get("authToken");

      // Confirmación antes de guardar
      Swal.fire({
        title: '¿Guardar configuración?',
        text: '¿Deseas guardar esta personalización con la configuración y orden actual?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (!result.isConfirmed) return;

        // Mostrar loading
        Swal.fire({
          title: "Guardando...",
          text: "Por favor espera mientras se guarda la configuración.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        axios.post(`${apiURL}/personalizacion`, {
          personalizacionId,
          usuarioId,
          juegos: juegosSeleccionados.map((juego) => ({
            ...juego,
            tema:
              juego.Juego === "Memoria"
                ? null
                : juego.temas.find((t) => t.Tema_Juego_ID_PK === juego.tema)?.Tema_Juego_ID_PK || juego.tema,
          })),
          titulo: tituloPersonalizacion,
        }, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include"
        })
        .then((res) => {
          Swal.close(); // Cierra el loading
          if (res.data.success) {
            Swal.fire("¡Guardado!", "Configuración guardada exitosamente", "success").then(() => {
              window.location.reload();
            });
          } else {
            Swal.fire("Error", "No se pudo guardar la configuración", "error");
          }
        })
        .catch((err) => {
          Swal.close(); // Cierra el loading en caso de error
          const errorMessage =
            err.response?.data?.error || "No se pudo guardar la configuración";
          Swal.fire("Error", errorMessage, "error");
        });
      });

    } catch (error) {
      Swal.fire("Error", "Hubo un error al desencriptar la información del usuario.", "error");
    }
  };


  const moveCard = (dragIndex, hoverIndex) => {
    const draggedItem = juegosSeleccionados[dragIndex];
    const updatedJuegos = [...juegosSeleccionados];
    updatedJuegos.splice(dragIndex, 1);
    updatedJuegos.splice(hoverIndex, 0, draggedItem);
    setJuegosSeleccionados(updatedJuegos.map((juego, idx) => ({
      ...juego,
      orden: idx + 1
    })));
  };

  const handleImageSelect = (temaId) => {
    if (temaId && currentImageIndex !== null) {
      // Verificar si la imagen ya está en uso
      const isAlreadyUsed = juegosSeleccionados.some((j, idx) => 
        idx !== currentImageIndex && j.tema === temaId
      );
      
      if (isAlreadyUsed) {
        Swal.fire({
          icon: 'error',
          title: 'Imagen en uso',
          text: 'Esta imagen ya está seleccionada en otro juego',
          confirmButtonText: 'Entendido'
        });
        return;
      }
      
      actualizarJuego(currentImageIndex, "tema", temaId);
      setShowImageModal(false);
      setCurrentImagePage(1);
    }
  };


  const renderImageModal = () => {
  if (!showImageModal || currentImageIndex === null) return null;

  const juego = juegosSeleccionados[currentImageIndex];
  
  // Obtener imágenes ya usadas en otros juegos
  const usedImages = juegosSeleccionados
    .filter((j, idx) => idx !== currentImageIndex && j.tema)
    .map(j => j.tema);

  const imagesPerPage = 4;
  const availableImages = juego.temas.filter(tema => !usedImages.includes(tema.Tema_Juego_ID_PK));
  const totalPages = Math.ceil(availableImages.length / imagesPerPage);
  const startIdx = (currentImagePage - 1) * imagesPerPage;
  const endIdx = startIdx + imagesPerPage;
  const currentImages = availableImages.slice(startIdx, endIdx);

  return (
    <div className="image-modal-overlay">
      <div className="image-modal">
        <div className="modal-header">
          <h3>Elegir Imagen</h3>
          <button onClick={() => {
            setShowImageModal(false);
            setCurrentImagePage(1);
          }} className="close-button">
            &times;
          </button>
        </div>
        
        <div className="image-gallery">
          {currentImages.length > 0 ? (
            currentImages.map((tema) => (
              <div 
                key={tema.Tema_Juego_ID_PK} 
                className={`image-item ${juego.tema === tema.Tema_Juego_ID_PK ? 'selected' : ''}`}
                onClick={() => handleImageSelect(tema.Tema_Juego_ID_PK)}
              >
                <img 
                  src={tema.Contenido} 
                  alt={`Tema ${tema.Tema_Juego_ID_PK}`} 
                />
              </div>
            ))
          ) : (
            <div className="no-images">
              No hay imágenes disponibles. Todas las imágenes están en uso en otros juegos.
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className='styled-select_Pagination'
              onClick={() => setCurrentImagePage(p => Math.max(p - 1, 1))}
              disabled={currentImagePage === 1}
            >
              Anterior
            </button>
            <span>Página {currentImagePage} de {totalPages}</span>
            <button className='styled-select_Pagination'
              onClick={() => setCurrentImagePage(p => Math.min(p + 1, totalPages))}
              disabled={currentImagePage === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

  const JuegoCard = ({ index, juego }) => {
    const [, ref] = useDrag({
      type: "JUEGO",
      item: { index, tipoJuegoId: juego.Tipo_Juego_ID_PK },
    });
    
    const [, drop] = useDrop({
      accept: "JUEGO",
      hover: (item) => {
        if (item.index !== index) {
          moveCard(item.index, index);
          item.index = index;
        }
      },
    });

    return (
      <div ref={(node) => ref(drop(node))} className="list__shape">
        <div className="list__image">
          <i className={`fa-solid ${juego.Juego === 'Rompecabezas' ? 'fa-puzzle-piece' : juego.Juego === 'Dibujo' ? 'fa-paintbrush' : juego.Juego === 'Sopa de letras' ? 'fa-a' : 'fa-brain'}`}></i>
        </div>

        <div className="list__text">
          <div className="list__title">
            <h4>{juego.Juego}</h4>
          </div>
          <div className="list__data">
            <span>Tiempo: </span>
            <span>{juego.Juego === 'Rompecabezas' ? '3 minutos' : juego.Juego === 'Dibujo' ? '8 minutos' : '5 minutos'}</span>
          </div>
        </div>

        <div className="list__dificulty">
          {juego.Juego === "Dibujo" ? (
            <select
              value={juego.dificultad}
              onChange={(e) => actualizarJuego(index, "dificultad", e.target.value)}
              className="styled-select"
            >
              <option value="0" disabled selected>Dificultad:</option>
              <option value="2">Medio (5 min)</option>
              <option value="1">Fácil (7 min)</option>
              <option value="3">Difícil (3 min)</option>
            </select>
          ) : (
            <select
              value={juego.dificultad}
              onChange={(e) => actualizarJuego(index, "dificultad", e.target.value)}
              className="styled-select"
            >
              <option value="0" disabled selected>Dificultad:</option>
              <option value="2">Medio</option>
              <option value="1">Fácil</option>
              <option value="3">Difícil</option>
            </select>
          )}
        </div>

        <div className="list__dificulty">
          {juego.Juego === 'Rompecabezas' ? (
            <>
              <button 
                onClick={() => {
                  setCurrentImageIndex(index);
                  setShowImageModal(true);
                }}
                className={`select-image-button ${juego.necesitaSeleccionarImagen ? 'pending' : ''}`}
                style={{
                  backgroundColor: juego.necesitaSeleccionarImagen ? '#ff0000' : '#0d24a1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
              >
                {juego.necesitaSeleccionarImagen ? '¡Falta imagen!' : 'Imagen Elegida'}
              </button>
            </>
          ) : (
            <select
              value={juego.tema || ""}
              onChange={(e) => {
                const newTemaId = e.target.value;
                actualizarJuego(index, "tema", newTemaId);
              }}
              className="styled-select"
            >
              {juego.temas.length > 0 ? (
                juego.temas.map((tema) => (
                  <option key={tema.Tema_Juego_ID_PK} value={tema.Tema_Juego_ID_PK}>
                    {tema.Contenido}
                  </option>
                ))
              ) : (
                <option value="">Ningún tema</option>
              )}
            </select>
          )}
        </div>

        <button onClick={() => eliminarJuego(index)} className="list__action__s">
          Eliminar
        </button>
      </div>
    );
  };

  return (
    <LayoutProfessor>
      {renderImageModal()}
      <section className="create__container">
        <div className="container__title">
          <h3>Personalizar</h3>
        </div>
        <div className="container__options">
          <div className="option__text">
            <span>Nombre:</span>
            <input
              className="text__input"
              type="text"
              placeholder="Ingrese un nombre."
              value={tituloPersonalizacion}
              onChange={(e) => setTituloPersonalizacion(e.target.value)}
            />
          </div>
          <div className="option__button button--second">
            <button type="submit" onClick={guardarConfiguracion}>Guardar Personalización</button>
          </div>
        </div>
        <div className="container__content">
          <div className="content__box">
            <div className="box__title">
              <h3>Orden de los juegos</h3>
            </div>
            <div className="box__order">
              <div className="order__list">
                {juegosSeleccionados.map((juego, index) => (
                  <JuegoCard 
                    key={`juego-${juego.Tipo_Juego_ID_PK}-${index}`}
                    index={index}
                    juego={juego}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="content__box">
            <div className="box__title">
              <h3>Juegos disponibles</h3>
            </div>
            <div className="box__games">
              {juegosDisponibles.map((juego) => (
                <button
                  key={juego.Tipo_Juego_ID_PK}
                  className="game__shape"
                  onClick={() => agregarJuego(juego)}
                  disabled={juegosSeleccionados.length >= 5}
                >
                  <div className="game__image">
                    <i className={`fa-solid ${juego.Juego === 'Rompecabezas' ? 'fa-puzzle-piece' : juego.Juego === 'Dibujo' ? 'fa-paintbrush' : juego.Juego === 'Memoria' ? 'fa-brain' : 'fa-circle-question'}`}></i>
                  </div>
                  <div className="game__text">
                    <h4 className="game__title">{juego.Juego}</h4>
                    <div className="game__description">
                      <span>Tiempo:</span>
                      <span>{juego.Juego === 'Rompecabezas' ? '3 minutos' : juego.Juego === 'Dibujo' ? '8 minutos' : '5 minutos'}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </LayoutProfessor>
  );
};

export default CreatePersonalization;