import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import { useDrag, useDrop } from 'react-dnd';
import { FaEdit, FaTrash } from 'react-icons/fa';
import "../styles/professorComponents.css";
import LayoutProfessor from "../components/Layout";

const apiURL = process.env.REACT_APP_API_URL;
const secretKey = process.env.REACT_APP_SECRET_KEY;

const EditPersonalization = () => {
  const { id } = useParams();
  const [juegosDisponibles, setJuegosDisponibles] = useState([]);
  const [juegosSeleccionados, setJuegosSeleccionados] = useState([]);
  const [tituloPersonalizacion, setTituloPersonalizacion] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("authToken");
        
        // Obtener juegos disponibles
        const juegosRes = await fetch(`${apiURL}/tipo-juegos`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const juegosData = await juegosRes.json();
        if (juegosData.success) {
          setJuegosDisponibles(juegosData.juegos);
        }

        // Obtener personalización actual
        const personalizacionRes = await fetch(`${apiURL}/personalizacion-por-id?id=${id}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            });
        const personalizacionData = await personalizacionRes.json();
        
        if (personalizacionData.success) {
          // Obtener temas para cada juego
          const juegosConTemas = await Promise.all(
            personalizacionData.juegos.map(async (juego) => {
              if (juego.Juego === 'Memoria') {
                return { ...juego, temas: [] };
              }
              const temasRes = await fetch(`${apiURL}/temas-juego/${juego.Tipo_Juego_ID_PK}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              const temasData = await temasRes.json();
              return {
                ...juego,
                temas: temasData.success ? temasData.temas : [],
              };
            })
          );
          
          setJuegosSeleccionados(juegosConTemas.sort((a, b) => a.orden - b.orden));
          setTituloPersonalizacion(personalizacionData.titulo || "");
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "No se pudo cargar la personalización", "error");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const obtenerTemas = async (juegoId) => {
    try {
      const token = Cookies.get("authToken");
      const res = await fetch(`${apiURL}/temas-juego/${juegoId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      return data.success ? data.temas : [];
    } catch (error) {
      console.error("Error al obtener temas:", error);
      return [];
    }
  };

  const agregarJuego = async (juego) => {
    if (juegosSeleccionados.length >= 5) {
      Swal.fire("Advertencia", "No puedes agregar más de 5 juegos", "warning");
      return;
    }

    const temas = await obtenerTemas(juego.Tipo_Juego_ID_PK);

    const dificultad = juego.Juego === "Dibujo" ? 1 : 1; // Valor por defecto

    setJuegosSeleccionados((prev) => [
      ...prev,
      {
        ...juego,
        orden: prev.length + 1,
        dificultad,
        tema: juego.Juego === "Memoria" ? null : (temas.length > 0 ? temas[0].Tema_Juego_ID_PK : null),
        temas,
      },
    ]);
  };

  const actualizarJuego = (index, campo, valor) => {
    setJuegosSeleccionados((prev) => {
      const updatedJuegos = [...prev];
      updatedJuegos[index][campo] = valor;
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

  const guardarConfiguracion = async () => {
    if (tituloPersonalizacion.trim() === "") {
      Swal.fire("Error", "Por favor ingrese un título para la personalización", "error");
      return;
    }

    if (juegosSeleccionados.length === 0) {
      Swal.fire("Error", "Debe agregar al menos un juego", "error");
      return;
    }

    // Validar que todos los juegos (excepto Memoria) tengan tema seleccionado
    const juegosSinTema = juegosSeleccionados.filter(juego => 
      juego.Juego !== 'Memoria' && (!juego.tema || juego.tema === null)
    );

    if (juegosSinTema.length > 0) {
      Swal.fire("Error", `Por favor seleccione un tema para el juego ${juegosSinTema[0].Juego}`, "error");
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

      const response = await fetch(`${apiURL}/editar-personalizacion`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizacionId: id,
          usuarioId,
          juegos: juegosSeleccionados.map((juego) => ({
            Tipo_Juego_ID_PK: juego.Tipo_Juego_ID_PK,
            dificultad: juego.dificultad,
            orden: juego.orden,
            tema: juego.Juego === "Memoria" ? null : juego.tema
          })),
          titulo: tituloPersonalizacion,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          title: '¡Guardado!',
          text: data.message || "Configuración guardada exitosamente",
          icon: 'success'
        }).then(() => {
          // Redirigir a la lista de personalizaciones
          window.location.href = '/lista-personalizaciones';
        });
      } else {
        Swal.fire("Error", data.error || "No se pudo guardar la configuración", "error");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire("Error", "Hubo un error al guardar la personalización", "error");
    }
  };

  const JuegoCard = ({ index, juego }) => {
    const [selectedImage, setSelectedImage] = useState(juego.tema);

    const openImageModal = () => {
      Swal.fire({
        title: 'Seleccionar Imagen',
        html: `
          <div class="image-gallery" style="display: flex; flex-wrap: wrap; justify-content: center;">
            ${juego.temas.map((tema) => `
              <div style="margin: 10px; cursor: pointer;">
                <img 
                  src="${tema.Contenido}" 
                  alt="Tema" 
                  style="width: 100px; height: 100px; border: ${tema.Tema_Juego_ID_PK === selectedImage ? '3px solid #4CAF50' : '1px solid #ddd'};"
                  data-id="${tema.Tema_Juego_ID_PK}"
                />
              </div>
            `).join('')}
          </div>
        `,
        showConfirmButton: false,
        didOpen: () => {
          document.querySelectorAll('.image-gallery img').forEach(img => {
            img.addEventListener('click', (e) => {
              const temaId = parseInt(e.target.dataset.id);
              setSelectedImage(temaId);
              actualizarJuego(index, "tema", temaId);
              Swal.close();
            });
          });
        }
      });
    };

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
          <i className={`fa-solid ${
            juego.Juego === 'Rompecabezas' ? 'fa-puzzle-piece' : 
            juego.Juego === 'Dibujo' ? 'fa-paintbrush' : 
            juego.Juego === 'Sopa de letras' ? 'fa-a' : 
            'fa-brain'
          }`}></i>
        </div>

        <div className="list__text">
          <div className="list__title">
            <h4>{juego.Juego}</h4>
          </div>
          <div className="list__data">
            <span>Tiempo: </span>
            <span>{
              juego.Juego === 'Rompecabezas' ? '3 minutos' : 
              juego.Juego === 'Dibujo' ? '8 minutos' : 
              '5 minutos'
            }</span>
          </div>
        </div>

        <div className="list__dificulty">
          {juego.Juego === "Dibujo" ? (
            <select
              value={juego.dificultad}
              onChange={(e) => actualizarJuego(index, "dificultad", parseInt(e.target.value))}
            >
              <option value={1}>Fácil (7 min)</option>
              <option value={2}>Medio (5 min)</option>
              <option value={3}>Difícil (3 min)</option>
            </select>
          ) : (
            <select
              value={juego.dificultad}
              onChange={(e) => actualizarJuego(index, "dificultad", parseInt(e.target.value))}
            >
              <option value={1}>Fácil</option>
              <option value={2}>Medio</option>
              <option value={3}>Difícil</option>
            </select>
          )}
        </div>

        <div className="list__dificulty">
          {juego.Juego === 'Rompecabezas' ? (
            <button onClick={openImageModal} className="select-image-button">
              {selectedImage ? "Imagen seleccionada" : "Seleccionar imagen"}
            </button>
          ) : juego.Juego !== 'Memoria' ? (
            <select
              value={selectedImage || ""}
              onChange={(e) => {
                const value = e.target.value === "null" ? null : parseInt(e.target.value);
                setSelectedImage(value);
                actualizarJuego(index, "tema", value);
              }}
            >
              <option value="null">Seleccione un tema</option>
              {juego.temas.map((tema) => (
                <option key={tema.Tema_Juego_ID_PK} value={tema.Tema_Juego_ID_PK}>
                  {tema.Nombre || `Tema ${tema.Tema_Juego_ID_PK}`}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <button 
          onClick={() => eliminarJuego(index)} 
          className="list__action__s"
          style={{ backgroundColor: '#ff4444', color: 'white' }}
        >
          <FaTrash /> Eliminar
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <LayoutProfessor>
        <section className="create__container">
          <div className="container__title">
            <h3>Cargando personalización...</h3>
          </div>
        </section>
      </LayoutProfessor>
    );
  }

  return (
    <LayoutProfessor>
      <section className="create__container">
        <div className="container__title">
          <h3>Editar Personalización</h3>
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
            <button type="submit" onClick={guardarConfiguracion}>
              Guardar Cambios
            </button>
          </div>
        </div>
        <div className="container__content">
          <div className="content__box">
            <div className="box__title">
              <h3>Orden de los juegos</h3>
              <small>Arrastra para cambiar el orden</small>
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
              <small>Máximo 5 juegos</small>
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
                    <i className={`fa-solid ${
                      juego.Juego === 'Rompecabezas' ? 'fa-puzzle-piece' : 
                      juego.Juego === 'Dibujo' ? 'fa-paintbrush' : 
                      juego.Juego === 'Memoria' ? 'fa-brain' : 
                      'fa-circle-question'
                    }`}></i>
                  </div>
                  <div className="game__text">
                    <h4 className="game__title">{juego.Juego}</h4>
                    <div className="game__description">
                      <span>Tiempo:</span>
                      <span>{
                        juego.Juego === 'Rompecabezas' ? '3 minutos' : 
                        juego.Juego === 'Dibujo' ? '8 minutos' : 
                        '5 minutos'
                      }</span>
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

export default EditPersonalization;