import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useDrag, useDrop } from "react-dnd";
import "../styles/Personalizacion.css";
import Cookies from "js-cookie"; 
import CryptoJS from "crypto-js";

const apiURL = process.env.REACT_APP_API_URL;
const secretKey = process.env.REACT_APP_SECRET_KEY;

const Personalizacion = ({ personalizacionId }) => {
  const [juegosDisponibles, setJuegosDisponibles] = useState([]);
  const [juegosSeleccionados, setJuegosSeleccionados] = useState([]);
  const [tituloPersonalizacion, setTituloPersonalizacion] = useState("");

  useEffect(() => {
    // Solo obtener los juegos disponibles si hay un usuarioId
    axios.get(`${apiURL}/tipo-juegos`).then((res) => {
      if (res.data.success) {
        setJuegosDisponibles(res.data.juegos);
      }
    });

    // Solo hacer la llamada si tenemos un personalizacionId
    if (personalizacionId) {
      // Si se pasa un ID de personalización, lo utilizamos para obtener los datos
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
    if (juegosSeleccionados.length >= 5) return;
  
    const temas = await obtenerTemas(juego.Tipo_Juego_ID_PK);
  
    // Mapear los tiempos de Dibujo a los valores de dificultad (1, 2, 3)
    const dificultad = juego.Juego === "Dibujo" ? 1 : 1; // 7 min para Dibujo se asigna a "Fácil" (ID 1)
  
    setJuegosSeleccionados((prev) => [
      ...prev,
      {
        ...juego,
        orden: prev.length + 1,
        dificultad: dificultad, // Ahora asignamos dificultad usando los IDs
        tema: juego.Juego === "Memoria" ? null : (temas.length > 0 ? temas[0].Tema_Juego_ID_PK : ""),
        temas,
      },
    ]);
  };

  const actualizarJuego = (index, campo, valor) => {
    setJuegosSeleccionados((prev) => {
      const updatedJuegos = [...prev];
      updatedJuegos[index][campo] = valor;
      updatedJuegos[index].orden = index + 1; // Aseguramos que el orden se actualice
      return updatedJuegos;
    });
  };

  const eliminarJuego = (index) => {
    setJuegosSeleccionados((prev) => {
      const updatedJuegos = [...prev];
      updatedJuegos.splice(index, 1);
      return updatedJuegos.map((juego, idx) => ({
        ...juego,
        orden: idx + 1 // Reajustamos los ordenes de los juegos restantes
      }));
    });
  };

  const guardarConfiguracion = () => {
    if (tituloPersonalizacion.trim() === "") {
      Swal.fire("Error", "Por favor ingrese un título para la personalización", "error");
      return;
    }
  
    // Obtener el usuarioId desde la cookie
    const userInfoCookie = Cookies.get("IFUser_Info");
    if (!userInfoCookie) {
      Swal.fire("Error", "No se pudo obtener la información del usuario.", "error");
      return;
    }
  
    try {
      // Desencriptar la cookie para obtener los datos
      const bytes = CryptoJS.AES.decrypt(userInfoCookie, secretKey);
      const userData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)); // Aquí convertimos a UTF-8 antes de parsear
  
      if (!userData) {
        Swal.fire("Error", "No se pudo procesar la información del usuario.", "error");
        return;
      }
  
      // Aquí puedes acceder a los datos desencriptados, por ejemplo:
      console.log(userData);
      
      // Obtener el usuarioId desde los datos desencriptados
      const usuarioId = userData.id;
  
      // Verificar qué datos se están enviando
      console.log("Datos a enviar al backend:", {
        personalizacionId,
        usuarioId,
        juegos: juegosSeleccionados,
        titulo: tituloPersonalizacion,
      });
  
      const token = Cookies.get("authToken");  // Obtener el token de la cookie
  
      axios
        .post(`${apiURL}/personalizacion`, {
          personalizacionId,  // Se envía el ID de personalización si está disponible
          usuarioId,          // Enviar el usuarioId desde los datos desencriptados
          juegos: juegosSeleccionados.map(juego => ({
            ...juego,
            tema: juego.Juego === "Memoria" ? null : juego.temas.find(t => t.Tema_Juego_ID_PK === juego.tema)?.Tema_Juego_ID_PK || juego.tema
          })),
          titulo: tituloPersonalizacion,
        }, {
          headers: {
            "Authorization": `Bearer ${token}`,  // Enviar el token en las cabeceras
            "Content-Type": "application/json",
          },
          credentials: "include"  // Asegúrate de incluir las cookies si es necesario
        })
        .then((res) => {
          if (res.data.success) {
            Swal.fire("¡Guardado!", "Configuración guardada exitosamente", "success");
          }
        })
        .catch((err) => {
          console.error("Error al guardar configuración:", err);
          Swal.fire("Error", "No se pudo guardar la configuración", "error");
        });
  
    } catch (error) {
      Swal.fire("Error", "Hubo un error al desencriptar la información del usuario.", "error");
      console.error(error);
    }
  };
  

  const moveCard = (dragIndex, hoverIndex) => {
    const draggedItem = juegosSeleccionados[dragIndex];
    const updatedJuegos = [...juegosSeleccionados];
    updatedJuegos.splice(dragIndex, 1);
    updatedJuegos.splice(hoverIndex, 0, draggedItem);
    setJuegosSeleccionados(updatedJuegos.map((juego, idx) => ({
      ...juego,
      orden: idx + 1 // Aseguramos que el orden se actualice
    })));
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
      <div ref={(node) => ref(drop(node))} className="juego-seleccionado" key={`juego-${juego.Tipo_Juego_ID_PK}-${index}`}>
        <div className="juego-header">
          <span>{`${index + 1}. ${juego.Juego}`}</span>
          <button onClick={() => eliminarJuego(index)} className="eliminar-juego">Eliminar</button>
        </div>
        <div>
          <label>Dificultad:</label>
          {juego.Juego === "Dibujo" ? (
            <select
              value={juego.dificultad}
              onChange={(e) => actualizarJuego(index, "dificultad", e.target.value)}
            >
              <option value="1">Fácil (7 min)</option>
              <option value="2">Medio (5 min)</option>
              <option value="3">Difícil (3 min)</option>
            </select>
          ) : (
            <select
              value={juego.dificultad}
              onChange={(e) => actualizarJuego(index, "dificultad", e.target.value)}
            >
              <option value="1">Fácil</option>
              <option value="2">Medio</option>
              <option value="3">Difícil</option>
            </select>
          )}
        </div>
        <div>
          <label>Personalización:</label>
          {juego.Juego === "Rompecabezas" ? (
            <div className="tema-imagenes">
              {juego.temas.length > 0 ? (
                juego.temas.map((tema) => (
                  <button
                    key={tema.Tema_Juego_ID_PK}
                    onClick={() => actualizarJuego(index, "tema", tema.Tema_Juego_ID_PK)}
                    style={{
                      backgroundImage: `url(${tema.Contenido})`,
                      backgroundSize: "cover",
                      width: "200px",
                      height: "200px",
                    }}
                    className={juego.tema === tema.Tema_Juego_ID_PK ? "seleccionado" : ""}
                  />
                ))
              ) : (
                <div>No hay imágenes disponibles</div>
              )}
            </div>
          ) : (
            <select
              value={juego.tema}
              onChange={(e) => actualizarJuego(index, "tema", e.target.value)}
            >
              {juego.temas.length > 0 ? (
                juego.temas.map((tema) => (
                  <option key={tema.Tema_Juego_ID_PK} value={tema.Tema_Juego_ID_PK}>
                    {tema.Contenido}
                  </option>
                ))
              ) : (
                <option value="null">Ningún tema</option>
              )}
            </select>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="contenedor">
      <h1>Configuración de la partida</h1>
      <div className="titulo">
        <label>Título de la personalización:</label>
        <input
          type="text"
          value={tituloPersonalizacion}
          onChange={(e) => setTituloPersonalizacion(e.target.value)}
          placeholder="Ingresa un título"
        />
      </div>

      <div className="juegos-disponibles">
        <h3>Juegos Disponibles</h3>
        {juegosDisponibles.map((juego) => (
          <button
            key={juego.Tipo_Juego_ID_PK}
            onClick={() => agregarJuego(juego)}
            className="boton-juego"
          >
            {juego.Juego}
          </button>
        ))}
      </div>

      <div className="juegos-seleccionados">
        <h3>Juegos Seleccionados</h3>
        {juegosSeleccionados.map((juego, index) => (
          <JuegoCard key={`juego-${juego.Tipo_Juego_ID_PK}-${index}`} index={index} juego={juego} />
        ))}
      </div>

      <button onClick={guardarConfiguracion} className="guardar-configuracion">
        Guardar Configuración
      </button>
    </div>
  );
};

export default Personalizacion;
