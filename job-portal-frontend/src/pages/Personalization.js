import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { uploadImageToImgBB } from "../LN/uploadImage";
import Swal from 'sweetalert2'; // Asegúrate de tener SweetAlert2 instalado
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";
import Cookies from "js-cookie";

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
  
  const navigate = useNavigate();
  const token = Cookies.get("authToken");

  const handleDelete = (id) => {
    navigate(`/admin/personalize_editor/delete/${id}`);
  };

  useEffect(() => {
    // Obtener los tipos de juegos
    axios.get(`${apiURL}/tipo-juegos`, {
      method: "GET",
        credentials: "include", 
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
      }
    })
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
    axios.get(`${apiURL}/gettemas`, {
      method: "GET",
      credentials: "include", 
      headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
    }
    })
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

  const handleDeactivate = async (temaId) => {
    const result = await Swal.fire({
      title: '¿Desactivar personalización?',
      text: "Esta acción desactivará la personalización seleccionada",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });
  
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${apiURL}/delete-p`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            temaId: temaId
          }),
        });
  
        if (!response.ok) {
          throw new Error('Error al desactivar la personalización');
        }
  
        const data = await response.json();
        
        Swal.fire(
          '¡Desactivada!',
          data.message || 'La personalización ha sido desactivada.',
          'success'
        );
        
        // Recargar los datos
        const temasResponse = await axios.get(`${apiURL}/gettemas`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        setTemas(temasResponse.data.temas);
  
      } catch (error) {
        console.error('Error:', error);
        Swal.fire(
          'Error',
          'No se pudo desactivar la personalización',
          'error'
        );
      }
    }
  };

  const handleActivate = async (temaId) => {
    try {
      const response = await fetch(`${apiURL}/activate-p`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ temaId }),
      });
  
      if (!response.ok) throw new Error('Error al activar');
      
      const data = await response.json();
      Swal.fire('¡Activado!', data.message || 'Personalización activada', 'success');
      
      // Recargar datos
      const temasResponse = await axios.get(`${apiURL}/gettemas`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      setTemas(temasResponse.data.temas);
  
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudo activar', 'error');
    }
  };

  const handleEdit = async (tema) => {
    const { value: newContent } = await Swal.fire({
      title: 'Editar Contenido',
      input: 'text',
      inputLabel: 'Edita el contenido',
      inputPlaceholder: 'Escribe el nuevo contenido',
      inputValue: tema.Contenido,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'El contenido no puede estar vacío';
        }
      }
    });
  
    if (newContent) {
      try {
        const response = await fetch(`${apiURL}/edit-p`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            temaId: tema.Tema_Juego_ID_PK,
            contenido: newContent
          }),
        });
  
        if (!response.ok) {
          throw new Error('Error al editar el contenido');
        }
  
        const data = await response.json();
        
        Swal.fire(
          '¡Editado!',
          data.message || 'El contenido ha sido actualizado.',
          'success'
        );
        
        // Recargar los datos
        const temasResponse = await axios.get(`${apiURL}/gettemas`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        setTemas(temasResponse.data.temas);
  
      } catch (error) {
        console.error('Error:', error);
        Swal.fire(
          'Error',
          'No se pudo editar el contenido',
          'error'
        );
      }
    }
  };
  
  
  // Calcular los elementos actuales para la página
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTemas.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];
    
    if (!selectedFile) return;
  
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      Swal.fire('Error', 'Solo se permiten archivos JPG, JPEG o PNG', 'error');
      return;
    }
  
    // Validar tamaño si lo necesitas (ejemplo 2MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      Swal.fire('Error', 'La imagen no debe exceder 2MB', 'error');
      return;
    }
  
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(selectedFile);
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
      const response = await axios({
        method: "POST",  // Definir el método como POST
        url: `${apiURL}/agregar_contenido`,  // La URL a la que se hace la solicitud
        data: requestData,  // Los datos a enviar en el cuerpo de la solicitud
        withCredentials: true,  // Incluir cookies, similar a credentials: 'include'
        headers: {
          "Authorization": `Bearer ${token}`,  // Añadir el token de autorización al encabezado
          "Content-Type": "application/json"  // Establecer el tipo de contenido como JSON
        }
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

  const totalPages = Math.ceil(filteredTemas.length / itemsPerPage);

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
            <div className="personalization__bottom">
              <div className="bottom__title">
                <h3>Lista de personalizaciones disponibles</h3>
              </div>            
              <table className="bottom__table">
                <thead className="table__head">
                  <th className="disapear">ID Tema</th>
                  <th className="table__header">Tipo de Juego</th>
                  <th className="table__header">Contenido</th>
                  <th className="table__header">Estado</th>
                  <th className="table__header">Acciones</th>
                </thead>
                <tbody className="table__body">
                  {currentItems.map((tema) => (
                    <tr className="table__row" key={tema.Tema_Juego_ID_PK}>
                      <td className="disapear">{tema.Tema_Juego_ID_PK}</td>
                      <td className="table__data">{tema.Tipo_Juego}</td>
                      <td className="table__data">
                        {tema.Contenido.startsWith("http") && (tema.Contenido.endsWith(".jpg") || tema.Contenido.endsWith(".png") || tema.Contenido.endsWith(".jpeg"))
                          ? <span className="data__image" onClick={() => handleImageClick(tema.Contenido)}>Ver Imagen</span>
                          : tema.Contenido}
                      </td>
                      <td className="table__data">{tema.Estado === true ? "Activo" : "Inactivo"}</td>
                      <td className={`table__data ${tema.Tipo_Juego === "Rompecabezas" ? "only-delete" : ""}`}>
                        {tema.Tipo_Juego !== "Rompecabezas" && (
                          <button className="button__blue" onClick={() => handleEdit(tema)}>
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                        )}
                        
                        {tema.Estado ? (
                          <button 
                            className="button__orange button--deactivate" 
                            onClick={() => handleDeactivate(tema.Tema_Juego_ID_PK)} 
                          >
                            <i className="fa-solid fa-ban"></i>
                          </button>
                        ) : (
                          <button 
                            className="button__blue button--activate" 
                            onClick={() => handleActivate(tema.Tema_Juego_ID_PK)} 
                            style={{ cursor: "pointer" }}
                          >
                            <i className="fa-solid fa-check"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
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
              <div className="box__image" style={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                maxHeight: '200px' /* Ajusta según necesites */
              }}>
                <input 
                  type="file" 
                  id="imageInput" 
                  accept=".jpg,.jpeg,.png" 
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                {imagePreview && (
                  <img 
                    id="preview" 
                    src={imagePreview} 
                    alt="Vista previa" 
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      height: 'auto',
                      width: 'auto'
                    }} 
                  />
                )}
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