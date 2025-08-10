import React from 'react'; 
import "../styles/simulationComponents.css";
import "../styles/simulationLayout.css";

const DescribeDrawing = () => {
  return (
    <div className="describe__body">
        <header className="header">
            <div className="header__logo">
                <div className="logo__image">
                    <img className="image__source" src="logo.png" alt="" />
                </div>
                <div className="logo__text">
                    <h2>Institución</h2> 
                </div>
            </div>
            <div className="header__title">
                <h1 className="title__text">Juego de dibujo</h1>
            </div>
            <div className="header__profile">
                <img className="profile__img" src="user.png" alt="" />
                <a className="profile__text">Usuario</a>
            </div>
        </header>
        <main className="main">
            <section className="describe__container">
                <div className="container__top">
                    <div className="top__title">
                        <h3>Describa su dibujo</h3>
                    </div>
                    <div className="top__text">
                        <span>Tema: </span>
                        <span>Naturaleza</span>
                    </div>             
                </div>
                <div className="container__content">
                    <div className="content__box">
                        <div className="box__shape">

                        </div>
                        <div className="box__text">
                            <span>Grupo: </span>
                            <span>1</span>
                        </div>
                    </div>
                    <div className="content__box box--active">
                        <div className="box__shape">
                        </div>
                        <div className="box__text">
                            <span>Grupo: </span>
                            <span>2</span>
                        </div>
                    </div>
                    <div className="content__box">
                        <div className="box__shape">

                        </div>
                        <div className="box__text">
                            <span>Grupo: </span>
                            <span>3</span>
                        </div>
                    </div>
                </div>
                <div className="container__bottom">
                    <div className="bottom__text">
                        <span>Tiempo restante: </span>
                        <span>0:30</span>
                    </div>
                    <div className="bottom__button">
                        <button className="button__help">Ayuda</button>
                    </div>              
                </div>
            </section>
        </main>
        <script src="https://kit.fontawesome.com/fa4744a987.js" crossorigin="anonymous"></script>
    </div>
  );
}

export default DescribeDrawing;
