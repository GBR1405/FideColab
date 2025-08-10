import React, { useState } from "react";
import Layout from "../components/Layout-Test";

function UserHomeScreen() {
  const [userData] = useState({
    userData: {
      name: "NA", // De acuerdo a la solicitud, muestra 'NA' como el nombre
    },
  });

  return (
    <Layout userData={userData}>
      <section className="main__container">
        <h1>Bienvenido a FideColab</h1>
        <p>FideColab es una plataforma diseñada para facilitar la colaboración entre equipos de trabajo. Aquí, los usuarios pueden interactuar y colaborar en tareas y proyectos de manera eficiente.
        Este espacio está destinado a optimizar la comunicación, organizar las actividades del equipo y ofrecer herramientas que faciliten el trabajo colaborativo.
        Si tienes alguna duda o necesitas más información sobre cómo utilizar la plataforma, no dudes en consultar el Centro de Ayuda o el Manual de Usuario.</p>
      </section>
    </Layout>
  );
}

export default UserHomeScreen;
