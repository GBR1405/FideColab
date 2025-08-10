import Swal from 'sweetalert2';
import { useEffect } from 'react';
import sound from '../docs/login.mp3';
import 'animate.css';

const useDebugMode = () => {
  useEffect(() => {
    // Código Konami
    const KONAMI_CODE = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA', 'Enter'
    ];
    
    let inputSequence = [];
    let konamiTimeoutId = null;
    const TIME_LIMIT = 5000;
    const audio = new Audio(sound);

    // Easter Egg de texto "fidecolab"
    let textInput = '';
    let textTimeoutId = null;
    const TEXT_TIMEOUT = 3000;

    const resetKonamiSequence = () => {
      inputSequence = [];
      if (konamiTimeoutId) {
        clearTimeout(konamiTimeoutId);
        konamiTimeoutId = null;
      }
    };

    const resetTextInput = () => {
      textInput = '';
      if (textTimeoutId) {
        clearTimeout(textTimeoutId);
        textTimeoutId = null;
      }
    };

    const showDedicationCard = () => {
        // Importar confetti (asegúrate de tener canvas-confetti instalado)
        import('canvas-confetti').then((confetti) => {
            // Efecto de confeti al abrir
            confetti.default({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
            });
        });

        Swal.fire({
            title: '<img src="https://i.postimg.cc/NGzXwBp6/logo.png" style="width: 100px; height: auto; margin-bottom: 20px;">',
            html: `
            <div style="
                max-height: 60vh;
                overflow-y: auto;
                padding: 0 10px;
                text-align: justify;
                font-family: 'Arial', sans-serif;
            ">
                <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                Carta de un desarrollador
                </h2>
                
                <div class="animate__animated animate__fadeIn" style="margin-bottom: 20px;">
                <p>Esta carta va para quienes, con su ayuda, se logró completar este sistema. FideColab empezó siendo una propuesta difícil, retadora, que no sabíamos si aceptar o rechazar, pero todo lo que habíamos hecho en el pasado nos dio la respuesta de decir "sí".</p>
                
                <p>Este "sí" abrió un camino gigante de retos. Todo el sistema estaba hecho con lenguajes poco conocidos, nuevos para nosotros en su gran mayoría. No obstante, cuando caminas, llegas a un final, aquel que tanto anhelabas alcanzar.</p>
                
                <p>Mi equipo de trabajo fue increíble, siempre estuvo unido. Aun con dificultades al inicio, logramos caminar todos paso a paso hasta el final. Quiero destacar la gran ayuda de nuestra profesora y guía en el desarrollo del proyecto, <strong>Maribel Solís</strong>, quien fue un apoyo enorme para nosotros en la toma de decisiones y tiempos.</p>
                </div>
                
                <div class="animate__animated animate__fadeIn animate__delay-1s" style="margin-bottom: 20px;">
                <p>Dicho lo anterior, ahora me dispongo a mencionar a mis compañeros de trabajo. De mi parte, agradezco el apoyo que tuve de ellos y, propiamente, el aporte que le dieron a este proyecto. <strong>Nicole Gómez, Andrés Canul, Sebastián Barboza, Yiqi Xie Lei y Nazareth Zúñiga</strong> son ese equipo, uno que estuvo en las buenas y en las malas, aquellos que me acompañaron por casi un año entero, y algunos aún mucho más tiempo.</p>
                
                <p>De todos ellos, felicito especialmente a <strong>Andrés</strong> por ser quien hizo posible el gran diseño que tenemos actualmente. Aunque al inicio no estuvo con nosotros, su ingreso al grupo fue fundamental y súper importante.</p>
                </div>
                
                <div class="animate__animated animate__fadeIn animate__delay-2s" style="margin-bottom: 20px;">
                <p>Por último, agradezco a la <strong>Universidad Fidelitas</strong> por la oportunidad de empezar, estudiar y finalizar mi carrera de Ingeniería en Sistemas que tanto he querido, por los grandes hallazgos y la diversión que he tenido.</p>
                
                <p style="font-style: italic; text-align: center; padding: 15px; background: #f8f9fa; border-left: 4px solid #3498db;">
                    "La vida te abre varios caminos, pero las amistades son quienes te ayudan a encontrar la mejor opción"
                </p>
                
                <p>Con esto finalizo esta carta. Espero que les esté gustando el sistema y que pueda seguir evolucionando y avanzando.</p>
                
                <p style="text-align: right; font-weight: bold; margin-top: 30px;">Atentamente:<br>GBR</p>
                </div>
            </div>
            
            <audio autoplay>
                <source src="https://www.soundjay.com/misc/sounds/magic-chime-01.mp3" type="audio/mpeg">
            </audio>
            `,
            width: '800px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            backdrop: `
            rgba(0,0,0,0.5)
            url("https://media.giphy.com/media/3o7TKsQ8UQ4D7GRkcg/giphy.gif")
            center center
            no-repeat
            `,
            showConfirmButton: false,
            showCloseButton: true,
            customClass: {
            container: 'animate__animated animate__fadeIn',
            popup: 'special-card',
            closeButton: 'close-button'
            },
            willOpen: () => {
            document.querySelector('.special-card').classList.add('animate__animated', 'animate__zoomIn');
            },
            willClose: () => {
            document.querySelector('.special-card').classList.add('animate__animated', 'animate__zoomOut');
            // Más confeti al cerrar
            import('canvas-confetti').then((confetti) => {
                confetti.default({
                particleCount: 100,
                spread: 60,
                origin: { y: 0.4 }
                });
            });
            }
        });
        };

    const handleKeyDown = (event) => {
      if (event.repeat) return;

      // Procesamiento del código Konami
      const currentKey = event.code;
      const expectedKey = KONAMI_CODE[inputSequence.length];
      const isCorrectKey = currentKey === expectedKey;

      if (isCorrectKey) {
        inputSequence.push(currentKey);
      } else {
        resetKonamiSequence();
      }

      if (konamiTimeoutId) clearTimeout(konamiTimeoutId);
      konamiTimeoutId = setTimeout(resetKonamiSequence, TIME_LIMIT);

      if (inputSequence.length === KONAMI_CODE.length) {
        resetKonamiSequence();
        audio.play().catch(e => console.error("Error al reproducir sonido:", e));
        Swal.fire({
          title: 'Secreto encontrado!',
          html: '⭐ FELICIDADES ⭐',
          icon: 'success',
          confirmButtonText: '¡Entendido!',
          background: '#1a1a2e',
          color: '#ffffff',
          allowEnterKey: false,
          backdrop: `
            rgba(0,0,123,0.4)
            url("https://media.tenor.com/8VMZ6wWu70IAAAAM/fish.gif")
            center top
            no-repeat
          `,
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        });
      }

      // Procesamiento del texto "fidecolab"
      if (event.key.length === 1) {
        textInput += event.key.toLowerCase();
        if (textTimeoutId) clearTimeout(textTimeoutId);
        textTimeoutId = setTimeout(resetTextInput, TEXT_TIMEOUT);
        
        if (textInput.includes('fidecolab')) {
          resetTextInput();
          showDedicationCard();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      resetKonamiSequence();
      resetTextInput();
    };
  }, []);
};

export default useDebugMode;