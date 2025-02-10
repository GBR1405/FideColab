import { useEffect, useState } from "react";
import "../styles/ErrorWindowSize.css"; // Importa el CSS

function ErrorWindowSize() {
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 768);
        };
        
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    if (!isSmallScreen) return null;

    return (
        <div className="error-container">
            <div className="error-box">
                <div className="error-header">
                    <img src="https://i.postimg.cc/NGzXwBp6/logo.png" alt="Fidecola Logo" className="error-logo" />
                    <h1 className="error-title">Fidecolab</h1>
                </div>
                <h2 className="error-warning">Lo sentimos</h2>
                <p className="error-message">
                    El tamaño de la pantalla es muy pequeño para el uso del sistema. <br />
                    Por favor, opta por ampliar la pantalla o usa un dispositivo de sobremesa o laptop.
                </p>
            </div>
        </div>
    );
}

export default ErrorWindowSize;
