import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faBrain, 
  faFlagCheckered,
  faPaintBrush,
  faTint,
  faEraser,
  faVoteYea,
  faHeart,
  faComments,
  faSearch,
  faArrowsAlt,
  faHandPaper,
  faPlay
} from '@fortawesome/free-solid-svg-icons';
import "../styles/TransicionesSimulacion.css";

const GameTransition = ({ 
  transitionPhase, 
  transitionGame, 
  onStart,
  currentGameInfo
}) => {
  const getInstructions = () => {
    if (!transitionGame) return null;
    
    const gameType = transitionGame.name.toLowerCase();
    
    if (gameType.includes('memoria')) {
      return [
        { icon: faUsers, text: 'Trabajen en equipo para decidir cual mover' },
        { icon: faBrain, text: 'Recuerden donde están las parejas' },
        { icon: faFlagCheckered, text: 'Encuentren todos para ganar' }
      ];
    }
    
    if (gameType.includes('dibujo')) {
      return [
        { icon: faPaintBrush, text: 'Dibujen el tema especifico' },
        { icon: faTint, text: 'Tienen tanque de tinta limitado' },
        { icon: faEraser, text: 'Si borran, pierden todos los trazos' }
      ];
    }
    
    if (gameType.includes('ahorcado')) {
      return [
        { icon: faVoteYea, text: 'Voten por la letra ganadora' },
        { icon: faHeart, text: 'Eviten llegar a 0 intentos' },
        { icon: faComments, text: 'La comunicación es importante' }
      ];
    }
    
    if (gameType.includes('rompecabezas')) {
      return [
        { icon: faSearch, text: 'Revisen las referencias' },
        { icon: faArrowsAlt, text: 'Tienen límite de movimientos' },
        { icon: faHandPaper, text: 'Tengan cuidado con lo que mueven' }
      ];
    }
    
    return [];
  };

  return (
    <div className={`game-transition-overlay ${transitionPhase !== 'idle' ? 'active' : ''}`}>
      {/* Previsualización del juego de fondo */}
      <div className={`game-preview ${transitionPhase === 'instructions' || transitionPhase === 'ready' ? 'visible' : ''}`}>
        {/* El juego se renderizará aquí pero semi-transparente */}
      </div>

      {/* Línea horizontal */}
      {(transitionPhase === 'line' || transitionPhase === 'text') && (
        <div className="center-line"></div>
      )}

      {/* Texto emergente */}
      {transitionPhase === 'text' && (
        <div className="text-emerge">
          <div className="next-text">Siguiente Juego</div>
          <div className="game-name">{transitionGame?.name}</div>
        </div>
      )}

      {/* Instrucciones */}
      {(transitionPhase === 'instructions' || transitionPhase === 'ready') && (
        <div className="instructions-container">
          <h2 className="instruction-title">Instrucciones</h2>
          <div className="instructions-grid">
            {getInstructions().map((item, index) => (
              <div key={index} className="instruction-card">
                <div className="instruction-icon">
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <p className="instruction-text">{item.text}</p>
              </div>
            ))}
          </div>

          {transitionPhase === 'ready' && (
            <button 
              className="start-btn"
              onClick={onStart}
            >
              <FontAwesomeIcon icon={faPlay} /> Comenzar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GameTransition;