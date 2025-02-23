import React from 'react';
import "../styles/professorComponents.css";
import LayoutProfessor from "../components/LayoutProfessor";

const CreatePersonalization = () => {
  return (
    <>
      <LayoutProfessor>        
        <section className="create__container">
            <div className="container__title">
                <h3>Personalizar</h3>
            </div>
            <div className="container__options">
                <div className="option__text">
                    <span>Nombre:</span>
                    <input className="text__input" type="text" placeholder="Ingrese un nombre." />
                </div>
                <div className="option__button">                              
                    <button type="submit">Guardar para mas tarde</button>
                </div> 
                <div className="option__button button--second">                              
                    <button type="submit">Guardar Personalizacion</button>
                </div>   
            </div>
            <div className="container__content">
                <div className="content__box">
                    <div className="box__title">
                        <h3>Orden de los juegos</h3>
                    </div>
                    <div className="box__order">
                        <div className="order__list">
                            <div className="list__shape">
                                <div className="list__image">
                                    <i className="fa-solid fa-puzzle-piece"></i>
                                </div>
                                <div className="list__text">
                                    <div className="list__title">
                                        <h4>Rompecabezas</h4>                                                         
                                    </div>
                                    <div className="list__data">
                                        <span>Tiempo: </span>
                                        <span>3 minutos</span>
                                    </div>
                                </div>
                                <div className="list__dificulty">
                                    <select>
                                        <option value="0" disabled selected>Dificultad:</option>
                                        <option value="1">Facil</option>
                                        <option value="2">Normal</option>
                                        <option value="3">Dificil</option>
                                    </select>
                                </div>
                                <label className="list__action" for="actionImage">Agregar imagen</label>    
                                <input className="action__file" type="file" id="actionImage" accept="image/*" />
                            </div>
                            <div className="list__shape">
                                <div className="list__image">
                                    <i className="fa-solid fa-circle-question"></i>
                                </div>
                                <div className="list__text">
                                    <div className="list__title">
                                        <h4>Adivinanza</h4>                                                         
                                    </div>
                                    <div className="list__data">
                                        <span>Tiempo: </span>
                                        <span>2 minutos</span>
                                    </div>
                                </div>
                                <div className="list__dificulty">
                                    <select>
                                        <option value="0" disabled selected>Dificultad:</option>
                                        <option value="1">Facil</option>
                                        <option value="2">Normal</option>
                                        <option value="3">Dificil</option>
                                    </select>
                                </div>
                                <input className="list__action" type="text" placeholder="Ingrese una palabra" />
                            </div>
                            <div className="list__shape">
                                <div className="list__image">
                                    <i className="fa-solid fa-puzzle-piece"></i>
                                </div>
                                <div className="list__text">
                                    <div className="list__title">
                                        <h4>Rompecabezas</h4>                                                         
                                    </div>
                                    <div className="list__data">
                                        <span>Tiempo: </span>
                                        <span>3 minutos</span>
                                    </div>
                                </div>
                                <div className="list__dificulty">
                                    <select>
                                        <option value="0" disabled selected>Dificultad:</option>
                                        <option value="1">Facil</option>
                                        <option value="2">Normal</option>
                                        <option value="3">Dificil</option>
                                    </select>
                                </div>
                                <label className="list__action" for="actionImage">Agregar imagen</label>    
                                <input className="action__file" type="file" id="actionImage" accept="image/*" />
                            </div>
                            <div className="list__shape">
                                <div className="list__image">
                                    <i className="fa-solid fa-circle-question"></i>
                                </div>
                                <div className="list__text">
                                    <div className="list__title">
                                        <h4>Adivinanza</h4>                                                         
                                    </div>
                                    <div className="list__data">
                                        <span>Tiempo: </span>
                                        <span>2 minutos</span>
                                    </div>
                                </div>
                                <div className="list__dificulty">
                                    <select>
                                        <option value="0" disabled selected>Dificultad:</option>
                                        <option value="1">Facil</option>
                                        <option value="2">Normal</option>
                                        <option value="3">Dificil</option>
                                    </select>
                                </div>
                                <input className="list__action" type="text" placeholder="Ingrese una palabra" />
                            </div>
                            <div className="list__shape">
                                <div className="list__image">
                                    <i className="fa-solid fa-puzzle-piece"></i>
                                </div>
                                <div className="list__text">
                                    <div className="list__title">
                                        <h4>Rompecabezas</h4>                                                         
                                    </div>
                                    <div className="list__data">
                                        <span>Tiempo: </span>
                                        <span>3 minutos</span>
                                    </div>
                                </div>
                                <div className="list__dificulty">
                                    <select>
                                        <option value="0" disabled selected>Dificultad:</option>
                                        <option value="1">Facil</option>
                                        <option value="2">Normal</option>
                                        <option value="3">Dificil</option>
                                    </select>
                                </div>
                                <label className="list__action" for="actionImage">Agregar imagen</label>    
                                <input className="action__file" type="file" id="actionImage" accept="image/*" />
                            </div>
                            <div className="list__shape">
                                <div className="list__image">
                                    <i className="fa-solid fa-circle-question"></i>
                                </div>
                                <div className="list__text">
                                    <div className="list__title">
                                        <h4>Adivinanza</h4>                                                         
                                    </div>
                                    <div className="list__data">
                                        <span>Tiempo: </span>
                                        <span>2 minutos</span>
                                    </div>
                                </div>
                                <div className="list__dificulty">
                                    <select>
                                        <option value="0" disabled selected>Dificultad:</option>
                                        <option value="1">Facil</option>
                                        <option value="2">Normal</option>
                                        <option value="3">Dificil</option>
                                    </select>
                                </div>
                                <input className="list__action" type="text" placeholder="Ingrese una palabra" />
                            </div>
                            <button className="list__button">
                                <i className="fa-solid fa-plus"></i>
                            </button>
                        </div>                        
                    </div>
                </div>
                <div className="content__box">
                    <div className="box__title">
                        <h3>Juegos</h3>
                    </div>
                    <div className="box__games">
                        <button className="game__shape">
                            <div className="game__image">
                                <i className="fa-solid fa-puzzle-piece"></i>
                            </div>
                            <div className="game__text">
                                <h4 className="game__title">Rompecabezas</h4>
                                <div className="game__description">
                                    <span>Tiempo:</span>
                                    <span>3 minutos</span>
                                </div>                                
                            </div>
                        </button>
                        <button className="game__shape">
                            <div className="game__image">
                                <i className="fa-solid fa-paintbrush"></i>
                            </div>
                            <div className="game__text">
                                <h4 className="game__title">Dibujo</h4>
                                <div className="game__description">
                                    <span>Tiempo:</span>
                                    <span>8 minutos</span>
                                </div>                                
                            </div>
                        </button>
                        <button className="game__shape">
                            <div className="game__image">
                                <i className="fa-solid fa-a"></i>
                            </div>
                            <div className="game__text">
                                <h4 className="game__title">Sopa de letras</h4>
                                <div className="game__description">
                                    <span>Tiempo:</span>
                                    <span>5 minutos</span>
                                </div>                                
                            </div>
                        </button>
                        <button className="game__shape">
                            <div className="game__image">
                                <i className="fa-solid fa-brain"></i>
                            </div>
                            <div className="game__text">
                                <h4 className="game__title">Memoria</h4>
                                <div className="game__description">
                                    <span>Tiempo:</span>
                                    <span>5 minutos</span>
                                </div>                                
                            </div>
                        </button>
                        <button className="game__shape">
                            <div className="game__image">
                                <i className="fa-solid fa-circle-question"></i>
                            </div>
                            <div className="game__text">
                                <h4 className="game__title">Adivinanza</h4>
                                <div className="game__description">
                                    <span>Tiempo:</span>
                                    <span>2 minutos</span>
                                </div>                                
                            </div>
                        </button>
                    </div>                    
                </div>
            </div>
        </section>
      </LayoutProfessor>
    </>
  );
};

export default CreatePersonalization;
