import { useState, useEffect } from "react";
import axios from "axios";
import { uploadImageToImgBB } from "../LN/uploadImage";

const apiURL = process.env.REACT_APP_API_URL;

const PersonalizeGame = () => {
  const [tipoJuegos, setTipoJuegos] = useState([]);
  const [contenido, setContenido] = useState("");
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
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
  }, []);

  const handleTabChange = (juegoID) => {
    setActiveTab(juegoID);
    setContenido("");
    setFile(null);

    const selectedGame = tipoJuegos.find(g => g.Tipo_Juego_ID_PK === juegoID);
    const placeholders = {
      "Rompecabezas": "Ejemplo: Imagen del rompecabezas",
      "Dibujo": "Ejemplo: Atardecer en la playa.",
      "Ahorcado": "Ejemplo: Vida"
    };
    setPlaceholder(placeholders[selectedGame?.Juego] || "Ejemplo: Imagen del rompecabezas");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSave = async () => {
    if (!activeTab) {
      alert("Selecciona un juego.");
      return;
    }

    let requestData = { tipoJuegoID: activeTab, contenido: contenido || "" };

    // Si es "Rompecabezas" y hay imagen, subirla a ImgBB
    if (activeTab === 1 && file) {
      try {
        const imageUrl = await uploadImageToImgBB(file);
        if (imageUrl) {
          requestData.contenido = imageUrl;
        } else {
          alert("Error al subir la imagen.");
          return;
        }
      } catch (error) {
        console.error("Error subiendo la imagen:", error);
        alert("Hubo un problema al subir la imagen.");
        return;
      }
    }

    try {
      const response = await axios.post(`${apiURL}/agregar_contenido`, requestData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success) {
        alert("Tema guardado correctamente.");
        setContenido("");
        setFile(null);
        setActiveTab(null);
      } else {
        alert("Error al guardar el tema.");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error en el guardado.");
    }
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Personalizar Tema de Juego</h2>

      {/* Tabs: Mostrar las pestañas con los juegos */}
      <div className="tabs mb-4">
        {tipoJuegos.map((juego) => (
          <button
            key={juego.Tipo_Juego_ID_PK}
            className={`tab ${activeTab === juego.Tipo_Juego_ID_PK ? "active" : ""}`}
            onClick={() => handleTabChange(juego.Tipo_Juego_ID_PK)} // Cambiar la pestaña con el ID del juego
          >
            {juego.Juego}
          </button>
        ))}
      </div>

      {/* Formulario dinámico basado en la pestaña activa */}
      {activeTab && (
        <div>
          {tipoJuegos
            .filter((juego) => juego.Tipo_Juego_ID_PK === activeTab)
            .map((juego) => (
              <div key={juego.Tipo_Juego_ID_PK}>
                {juego.Juego === "Rompecabezas" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Subir Imagen (Rompecabezas):</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="border p-2 w-full rounded"
                      onChange={handleFileChange} // Manejar el archivo
                    />
                  </div>
                )}

                {juego.Juego === "Dibujo" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Contenido (Oración):</label>
                    <input
                      type="text"
                      className="border p-2 w-full rounded"
                      placeholder={placeholder}
                      value={contenido}
                      onChange={(e) => setContenido(e.target.value)}
                    />
                  </div>
                )}

                {juego.Juego === "Ahorcado" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Contenido (Palabra):</label>
                    <input
                      type="text"
                      className="border p-2 w-full rounded"
                      placeholder={placeholder}
                      value={contenido}
                      onChange={(e) => setContenido(e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      <button
        onClick={handleSave}
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded w-full transition-all"
      >
        Guardar Tema
      </button>
    </div>
  );
};

export default PersonalizeGame;
