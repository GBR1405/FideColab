import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const WindowSizeChecker = ({ children, minWidth = 768, minHeight = 600 }) => {
  const [windowSizeValid, setWindowSizeValid] = useState(false);

  const checkWindowSize = () => {
    const widthValid = window.innerWidth >= minWidth;
    const heightValid = window.innerHeight >= minHeight;
    
    // Verificación más precisa para desarrollo (F12)
    const isDevToolsOpen = window.outerWidth - window.innerWidth > 160 || 
                          window.outerHeight - window.innerHeight > 160;
    
    // Si las herramientas de desarrollo están abiertas, solo verificamos el viewport
    const isValid = isDevToolsOpen 
      ? (widthValid && heightValid)
      : (widthValid && heightValid && window.innerWidth >= window.outerWidth * 0.9);
    
    setWindowSizeValid(isValid);
    
    if (!isValid) {
      showSizeWarning(!widthValid, !heightValid);
    }
  };

  const showSizeWarning = (widthTooSmall, heightTooSmall) => {
    let message = `Requerimos una ventana de al menos ${minWidth}×${minHeight} px.<br>
                  Tamaño actual: ${window.innerWidth}×${window.innerHeight} px`;
    
    if (widthTooSmall && heightTooSmall) {
      message += `<br><br>Tu ventana es demasiado pequeña en ancho y alto.`;
    } else if (widthTooSmall) {
      message += `<br><br>El ancho de tu ventana es insuficiente.`;
    } else if (heightTooSmall) {
      message += `<br><br>El alto de tu ventana es insuficiente.`;
    }

    Swal.fire({
      title: 'Ventana demasiado pequeña',
      html: message,
      icon: 'warning',
      confirmButtonText: 'Entendido',
      allowOutsideClick: false,
      backdrop: true
    });
  };

  useEffect(() => {
    // Verificación inicial
    checkWindowSize();
    
    // Verificar cada 500ms para detectar cambios con F12
    const intervalId = setInterval(checkWindowSize, 500);
    const resizeListener = () => checkWindowSize();
    
    window.addEventListener('resize', resizeListener);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', resizeListener);
    };
  }, [minWidth, minHeight]);

  if (!windowSizeValid) {
    return (
      <div className="window-size-error">
        <h2>❌ Tamaño de ventana insuficiente</h2>
        <p>Para continuar necesitas:</p>
        <ul>
          <li>Ancho mínimo: {minWidth}px (actual: {window.innerWidth}px)</li>
          <li>Alto mínimo: {minHeight}px (actual: {window.innerHeight}px)</li>
        </ul>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-button"
        >
          Volver a verificar
        </button>
      </div>
    );
  }

  return children;
};

export default WindowSizeChecker;