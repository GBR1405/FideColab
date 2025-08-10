import React from 'react'; 
import "../styles/simulationComponents.css";


const SimulationProfessor = () => {
  return (
    <body class="bodyProfessor">
        <header class="header">
            <div class="header__heading">
            <div>
                <h1 class="heading__title">Partida Actual</h1>
            </div>
            <div class="heading__text">
                <span>Fecha: </span>
                <span>28/07/2021</span>
            </div>   
            </div>
            <div class="header__profile">
                <img class="profile__img" src="user.png" alt="" />
                <a class="profile__text">Profesor</a>
            </div>
        </header>
        <nav class="sidebar"> 
            <div class="sidebar__top">
                <div class="top__logo">
                    <img class="logo__img" src="logo.png" alt="" />
                </div>
                <div class="top__text">
                    <h3 class="logo__title">Institución</h3> 
                </div>       
            </div>
            <ul class="sidebar__list">
                <li class="list__item">
                    <a class="item__area" href="#">
                        <i class="fa-solid fa-bell"></i>
                        <span class="area__text">Sala de espera</span>
                    </a>
                </li>
                <li class="list__item list__item--active">
                    <a class="item__area" href="#">
                        <i class="fa-solid fa-flag"></i>
                        <span class="area__text area__text--active">Simulacion</span>
                    </a>
                </li> 
                <li class="list__item">
                    <a class="item__area" href="#">
                        <i class="fa-solid fa-chart-pie"></i>
                        <span class="area__text">Resultados</span>
                    </a>
                </li>
            </ul>
            <div class="sidebar__buttom">       
                <button class="buttom__btn">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span class="btn__text">Cerrar sesión</span>
                </button>   
            </div>
        </nav>
        <main class="main">
            <section class="simulation__container">
                <div class="container__information">
                    <div class="content__box">
                        <div class="box__title">
                            <h3>Informacion de la partida</h3>
                        </div>
                        <div class="box__information">  
                            <div class="information__text">
                                <span>Grupo: </span>
                                <span>1</span>
                            </div> 
                            <div class="information__text">
                                <span>Personalizacion: </span>
                                <span>1</span>
                            </div>  
                            <div class="information__text">
                                <span>Juego actual: </span>
                                <span>Rompecabezas</span>
                            </div>    
                        </div>
                    </div>
                </div>
                <div class="container__percentage">
                    <div class="content__box">
                        <div class="box__title">
                            <h3>Porcentajes de completado</h3>
                        </div>
                        <div class="box__percentage">  

                        </div>
                    </div>
                </div>
                <div class="container__options">
                    <div class="content__box">
                        <div class="box__title">
                            <h3>Opciones</h3>
                        </div>
                        <div class="box__options"> 
                            <div class="option__button">
                                <button>Siguiente</button> 
                            </div>
                            <div class="option__button">
                                <button>Pausar</button> 
                            </div>
                            <div class="option__button">
                                <button>Empezar</button> 
                            </div>
                            <div class="option__button">
                                <button>Finalizar</button> 
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </body>
  );
}

export default SimulationProfessor;
