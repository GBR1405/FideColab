import React from 'react';
import Countdown from 'react-countdown';
import "../styles/countdown.css";

const CountdownTimer = ({ onComplete }) => {
  // Renderizar el temporizador con un diseño personalizado
  const renderer = ({ seconds, completed }) => {
    if (completed) {
      // Cuando el temporizador termina, ejecutar la función onComplete
      onComplete();
      return null;
    } else {
      // Mostrar el número actual del temporizador
      return (
        <div className="countdown-timer">
          <div className="countdown-number">{seconds}</div>
        </div>
      );
    }
  };

  return (
    <Countdown
      date={Date.now() + 3000} // 3 segundos (3000 ms)
      renderer={renderer}
      intervalDelay={0}
      precision={1}
    />
  );
};

export default CountdownTimer;