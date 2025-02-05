import React from "react";
import '../styles/styles.css'

const tutorials = [
  {
    title: "¿Cómo agregar participantes a una partida?",
    videoId: "75Ey0Xud9XQ",
    likes: 14,
  },
  {
    title: "¿Cómo iniciar una nueva partida?",
    videoId: "dQw4w9WgXcQ",
    likes: 20,
  },
  {
    title: "¿Cómo gestionar los puntajes?",
    videoId: "3JZ_D3ELwOQ",
    likes: 10,
  },
  {
    title: "¿Cómo finalizar una partida correctamente?",
    videoId: "tgbNymZ7vqY",
    likes: 18,
  },
];

const HelpTutorial = () => {
  return (
    <div className="body">
    <div className="flex">
      {/* Sidebar */}
      <nav className="w-1/5 bg-white p-4 shadow-lg h-screen">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img className="w-10 h-10" src="image/logo.png" alt="Logo" />
            <span className="ml-2 font-bold">Institución</span>
          </div>
          <button className="text-gray-600">❮</button>
        </div>
        <ul>
          <li className="mb-4"><a href="index.html">Centro de ayuda</a></li>
          <li className="mb-4"><a href="dashboard.html">Manual de Usuario</a></li>
          <li className="mb-4 font-bold"><a href="calendar.html">Tutorial</a></li>
          <li><a href="calendar.html">Preguntas frecuentes</a></li>
        </ul>
        <button className="mt-6 text-blue-600">Volver</button>
      </nav>
      
      {/* Main Content */}
      <div className="w-4/5 p-8 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-gray-400">Centro de Ayuda / Tutorial</h2>
            <h1 className="text-xl font-bold text-blue-600">Tutoriales de Uso</h1>
          </div>
          <div className="flex items-center">
            <img
              alt="Imagen de usuario"
              className="rounded-full w-10 h-10"
              src="https://placehold.co/40x40"
            />
            <span className="ml-3">Usuario</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorials.map((tutorial, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <a
                href={`https://youtu.be/${tutorial.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  alt="Miniatura del video"
                  className="w-full rounded-lg mb-4"
                  src={`https://img.youtube.com/vi/${tutorial.videoId}/maxresdefault.jpg`}
                />
              </a>
              <h3 className="text-lg font-semibold mb-2">{tutorial.title}</h3>
              <div className="flex items-center text-gray-500">
                <i className="fas fa-thumbs-up mr-1"></i> {tutorial.likes}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h1 className="text-xl font-bold text-blue-600">Resultados y detalles</h1>
          <div className="mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" id="mostrarResultados">
              📊 Ver Resultados
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded" id="descargarJSON">
              📥 Descargar JSON
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default HelpTutorial;
