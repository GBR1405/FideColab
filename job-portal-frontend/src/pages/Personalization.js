import React, { useState, useEffect } from "react";
import axios from "axios";
import { uploadImageToImgBB } from "../LN/uploadImage";
import Swal from 'sweetalert2'; // Asegúrate de tener SweetAlert2 instalado
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";

const apiURL = process.env.REACT_APP_API_URL;

const Depuration = () => {
  const [tipoJuegos, setTipoJuegos] = useState([]);
  const [contenidoAhorcado, setContenidoAhorcado] = useState("");
  const [contenidoDibujo, setContenidoDibujo] = useState("");
  const [contenidoRompecabezas, setContenidoRompecabezas] = useState("");
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  const [temas, setTemas] = useState([]); // Estado para almacenar los temas
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [itemsPerPage] = useState(5); // Número de elementos por página
  const [filterTipoJuego, setFilterTipoJuego] = useState(""); // Filtro de tipo de juego
  const [filterEstado, setFilterEstado] = useState(""); // Filtro de estado
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Obtener los tipos de juegos
    axios.get(`${apiURL}/tipo-juegos`)
      .then((res) => {
        if (res.data.success) {
          const filteredGames = res.data.juegos.filter(juego =>
            ["Rompecabezas", "Dibujo", "Ahorcado"].includes(juego.Juego)
          );
          setTipoJuegos(filteredGames);
        } else {
          console.error("Error: La respuesta de la API no es exitosa");
        }
      })
      .catch(error => console.error("Error al obtener los juegos:", error));
  
    // Obtener los temas de juegos
    axios.get(`${apiURL}/gettemas`)
      .then((res) => {
        if (res.data.success) {
          setTemas(res.data.temas); 
        } else {
          console.error("Error: La respuesta de la API no es exitosa");
        }
      })
      .catch(error => console.error("Error al obtener los temas:", error));
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const filteredTemas = temas.filter(tema => {
    const matchesTipoJuego = filterTipoJuego ? tema.Tipo_Juego === filterTipoJuego : true;
    const matchesEstado = filterEstado !== "" ? tema.Estado === (filterEstado === "true") : true;
    const matchesSearchTerm = searchTerm
      ? ((tema.Nombre && tema.Nombre.toLowerCase().includes(searchTerm.toLowerCase())) || 
         (tema.Contenido && tema.Contenido.toLowerCase().includes(searchTerm.toLowerCase())))
      : true; // Buscar en el nombre o contenido del tema
  
    return matchesTipoJuego && matchesEstado && matchesSearchTerm;
  });
  
  
  // Calcular los elementos actuales para la página
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTemas.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleImageClick = (url) => {
    Swal.fire({
      imageUrl: url,
      imageAlt: "Vista previa de la imagen",
      showCloseButton: true,
      showConfirmButton: false,
      width: "800px",
    });
  };

  const handleSave = async (tipoJuego, contenido) => {
    if (!tipoJuego) {
      alert("Selecciona un tipo de juego.");
      return;
    }

    let requestData = { tipoJuegoID: tipoJuego.Tipo_Juego_ID_PK, contenido: contenido || "" };

    // Si es "Rompecabezas" y hay imagen, subirla a ImgBB
    if (tipoJuego.Juego === "Rompecabezas" && file) {
      try {
        setIsLoading(true); // Activar el estado de carga
        Swal.fire({
          title: 'Cargando...',
          text: 'Por favor espera mientras se sube la imagen.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading(); // Muestra el indicador de carga
          }
        });

        const imageUrl = await uploadImageToImgBB(file);
        if (imageUrl) {
          requestData.contenido = imageUrl;
        } else {
          Swal.fire("Error", "Error al subir la imagen.", "error");
          setIsLoading(false); // Desactivar el estado de carga
          return;
        }
      } catch (error) {
        console.error("Error subiendo la imagen:", error);
        Swal.fire("Error", "Hubo un problema al subir la imagen.", "error");
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await axios.post(`${apiURL}/agregar_contenido`, requestData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success) {
        Swal.fire("¡Éxito!", "Contenido guardado correctamente.", "success").then(() => {
          window.location.reload(); // Recarga la página después de cerrar la alerta
        });
        setContenidoAhorcado("");
        setContenidoDibujo("");
        setContenidoRompecabezas("");
        setFile(null);
        setImagePreview(null);
      } else {
        Swal.fire("Error", "Error al guardar el contenido.", "error");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire("Error", "Hubo un error en el guardado.", "error");
    } finally {
      setIsLoading(false); // Desactivar el estado de carga
    }
  };

  return (
    <LayoutAdmin>
      <section className="personalization__container">
        <div className="personalization__title">
          <h3>Personalizar</h3>
        </div>
        <div className="personalization__content">
          <div className="personalization__left">
            <div className="personalization__top">
              <div className="personalization__options">
                <div className="options__above">
                  <div className="option__shape">
                    <select
                      onChange={(e) => setFilterTipoJuego(e.target.value)}
                      value={filterTipoJuego}
                    >
                      <option value="">Filtrar por tipo:</option>
                      {tipoJuegos.map((juego) => (
                        <option key={juego.Tipo_Juego_ID_PK} value={juego.Juego}>
                          {juego.Juego}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="option__shape">
                    <select
                      onChange={(e) => setFilterEstado(e.target.value)}
                      value={filterEstado}
                    >
                      <option value="">Filtrar por estado:</option>
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div className="options__bellow">
                <div className="option__search">
  <i className="fa-solid fa-magnifying-glass"></i>
  <input
    type="search"
    placeholder="Escriba el elemento a buscar"
    value={searchTerm}
    onChange={handleSearchChange}
  />
</div>
                </div>
              </div>
            </div>
      <div className="depuration__bottom">
              <div className="bottom__title">
                <h3>Lista de personalizaciones disponibles</h3>
              </div>
              <div className="personalization__table-container">
                <table className="personalization__table">
                  <thead>
                    <tr>
                      <th>ID Tema</th>
                      <th>Tipo de Juego</th>
                      <th>Contenido</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((tema) => (
                      <tr key={tema.Tema_Juego_ID_PK}>
                        <td>{tema.Tema_Juego_ID_PK}</td>
                        <td>{tema.Tipo_Juego}</td>
                        <td>
                          {tema.Contenido.startsWith("http") && (tema.Contenido.endsWith(".jpg") || tema.Contenido.endsWith(".png") || tema.Contenido.endsWith(".jpeg"))
                            ? <span className="image-link" onClick={() => handleImageClick(tema.Contenido)} style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}>Ver Imagen</span>
                            : tema.Contenido}
                        </td>
                        <td>{tema.Estado === true ? "Activo" : "Inactivo"}</td>
                        <td className="personalization__actions">
                          <button>✏️</button>
                          <button>❌</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pagination-container">
                  <button className="pagination-button" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
                  {[...Array(Math.ceil(temas.length / itemsPerPage))].map((_, index) => (
                    <button key={index + 1} className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => paginate(index + 1)}>{index + 1}</button>
                  ))}
                  <button className="pagination-button" onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(temas.length / itemsPerPage)}>Siguiente</button>
                </div>
              </div>
            </div>
    </div>

          {/* Sección derecha con inputs */}
          <div className="personalization__right">
            {/* Ahorcado */}
            <div className="personalization__box">
              <div className="box__title">
                <h3>Juego de Ahorcado</h3>
              </div>
              <form className="box__content" onSubmit={(e) => { e.preventDefault(); handleSave(tipoJuegos.find(j => j.Juego === "Ahorcado"), contenidoAhorcado); }}>
                <div className="box__input">
                  <input
                    type="text"
                    placeholder="Agregue una palabra."
                    value={contenidoAhorcado}
                    onChange={(e) => setContenidoAhorcado(e.target.value)}
                  />
                </div>
                <div className="box__button">
                  <button type="submit" disabled={isLoading}>Agregar</button>
                </div>
              </form>
            </div>

            {/* Dibujo */}
            <div className="personalization__box">
              <div className="box__title">
                <h3>Juego de Dibujo</h3>
              </div>
              <form className="box__content" onSubmit={(e) => { e.preventDefault(); handleSave(tipoJuegos.find(j => j.Juego === "Dibujo"), contenidoDibujo); }}>
                <div className="box__input">
                  <input
                    type="text"
                    placeholder="Agregue un tema."
                    value={contenidoDibujo}
                    onChange={(e) => setContenidoDibujo(e.target.value)}
                  />
                </div>
                <div className="box__button">
                  <button type="submit" disabled={isLoading}>Agregar</button>
                </div>
              </form>
            </div>

            {/* Rompecabezas */}
            <div className="personalization__box box--bottom">
              <div className="box__title">
                <h3>Agregar Imagen</h3>
              </div>
              <form className="box__content" onSubmit={(e) => { e.preventDefault(); handleSave(tipoJuegos.find(j => j.Juego === "Rompecabezas"), contenidoRompecabezas); }}>
                <div className="box__image">
                  <input type="file" id="imageInput" accept="image/*" onChange={handleImageChange} />
                  {imagePreview && <img id="preview" src={imagePreview} alt="Vista previa" />}
                </div>
                <div className="box__buttons">
                  <label className="box__button" htmlFor="imageInput">
                    Cargar
                  </label>
                  <div className="box__button">
                    <button type="submit" disabled={isLoading}>Aceptar</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </LayoutAdmin>
  );
};

export default Depuration;
