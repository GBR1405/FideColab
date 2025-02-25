import React from "react";
import { Link } from "react-router-dom";
import LayoutHelp from "../components/LayoutHelp";
import "../styles/help.css";
import "../styles/tutorial.css";
import fallbackThumbnail from "../image/fallback-thumbnail.jpg"; // Imagen por defecto

const videos = [
  {
    id: "YAgJ9XugGBo",
    title: "¿Qué es FideColab?",
    url: "https://youtu.be/YAgJ9XugGBo?si=X_tLSoRUWVgKzrKI",
  },
  {
    id: "A5CwmEayPxw",
    title: "Taste Eat",
    url: "https://youtu.be/A5CwmEayPxw",
  },
  {
    id: "GwzegAR65dQ",
    title: "Universidad Fidélitas",
    url: "https://youtu.be/GwzegAR65dQ?si=Zsa4diayV3SjyX9Z",
  },
  {
    id: "n1QlW1Qg-e0",
    title: "U Fide, Campus San Pedro",
    url: "https://youtu.be/n1QlW1Qg-e0?si=XakGSV31XkrEjv8p",
  }
];

const Tutorial = () => {
  return (
    <LayoutHelp>
      <div className="container__navegation">
        <Link className="navegation__text" to="/help">
          Centro de Ayuda
        </Link>
        <Link className="navegation__text navegation__text--active" to="/help/tutorial">
          /Tutorial
        </Link>
      </div>

      <div className="container__content">
        <div className="content__heading">
          <h3>Tutoriales de uso</h3>
        </div>

        <div className="content__group">
          {videos.map((video, index) => (
            <div className="group__video" key={index}>
              <div className="video__shape">
                <a href={video.url} target="_blank" rel="noopener noreferrer">
                  <img
                    className="shape__img"
                    alt={`Miniatura de ${video.title}`}
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    onError={(e) => {
                      e.target.onerror = () => {
                        e.target.onerror = null;
                        e.target.src = fallbackThumbnail; // Si todas fallan, usa la imagen por defecto
                      };
                      e.target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`; // Segunda opción
                    }}
                  />
                </a>
              </div>
              <div className="video__title">
                <h3>{video.title}</h3>
              </div>
              <div className="video__btn">
                <i className="fas fa-thumbs-up mr-1"></i> ?
              </div>
            </div>
          ))}
        </div>
      </div>
    </LayoutHelp>
  );
};

export default Tutorial;
