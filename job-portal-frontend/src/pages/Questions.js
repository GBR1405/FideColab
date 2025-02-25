import React from 'react';
import "react-router-dom";
import LayoutHelp from "../components/LayoutHelp";
import "../styles/helpComponents.css";


const Questions = () => {
  

  return (
    <LayoutHelp>
      <section className="help__container">
        <div className="container__navegation">
          <a className="navegation__text" href="/help">Centro de Ayuda</a>
          <a className="navegation__text navegation__text--active" href="/help/preguntasfrecuentes">/Preguntas frecuentes</a>
        </div>

        <div className="container__content">
          <div className="content__heading">
            <h3>Preguntas frecuentes</h3>
            <p className="content__text">
              Aquí podrás encontrar la guía completa de cómo utilizar el sistema FideColab.
            </p>
          </div>
          <div className="content_faq">
            <details className="faq__box">
              <summary className="faq__title">
                ¿Cómo me registro en el sistema?
              </summary>
              <p className="faq__text">
                Para registrarte, completa el formulario de registro con tu nombre, correo y contraseña.
              </p>
            </details>
            <details className="faq__box">
              <summary className="faq__title">
                ¿Olvidé mi contraseña, qué debo hacer?
              </summary>
              <p className="faq__text">
                Haz clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión y sigue las instrucciones.
              </p>
            </details>
            <details className="faq__box">
              <summary className="faq__title">
                ¿Puedo cambiar mi nombre de usuario?
              </summary>
              <p className="faq__text">
                No es posible cambiar tu nombre de usuario, pero puedes actualizar otros datos en la configuración.
              </p>
            </details>
            <details className="faq__box">
              <summary className="faq__title">
                ¿Cómo puedo editar mi perfil?
              </summary>
              <p className="faq__text">
                Para editar tu perfil, ve a la sección de configuración y haz clic en "Editar perfil".
              </p>
            </details>
            <details className="faq__box">
              <summary className="faq__title">
                ¿Qué puedo hacer si en una partida se me va la conexión?
              </summary>
              <p className="faq__text">
                Deberás ponerte en contacto con tu respectivo profesor para que te permita volver a la partida.
              </p>
            </details>
            <details className="faq__box">
              <summary className="faq__title">
                ¿No pasa nada si no me conecto a una partida?
              </summary>
              <p className="faq__text">
                No, no pasa nada. Solo que no podrás participar en la partida.
              </p>
            </details>
            <details className="faq__box">
              <summary className="faq__title">
                ¿A quién contacto si tengo bloqueado mi cuenta?
              </summary>
              <p className="faq__text">
                Deberás ponerte en contacto con tecnologias educativas para que te ayuden a desbloquear tu cuenta.
              </p>
            </details>
            <details className="faq__box">
              <summary className="faq__title">
                ¿Un estudiante puede hacer partidas?
              </summary>
              <p className="faq__text">
                No, solo los profesores pueden crear partidas.
              </p>
            </details>
            <details className="faq__box">
              <summary className="faq__title">
                ¿A quién le pertenece esta aplicación?
              </summary>
              <p className="faq__text">
                Esta aplicación pertenece a la Universidad Fidelitas.
              </p>
            </details>
            <details className="faq__box">
              <summary className="faq__title">
                ¿Todo lo que dibujé se queda guardado?
              </summary>
              <p className="faq__text">
                No, una vez que la partida termina, todo se borra.
              </p>
            </details>
          </div>
        </div>
      </section>
    </LayoutHelp>
  );
};

export default Questions;
