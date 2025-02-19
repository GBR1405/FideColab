import React from 'react';
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";

const Depuration = () => {
  return (
    <>
      <LayoutAdmin>
        <section className="personalization__container">
            <div className="personalization__title">
                <h3>Personalizar</h3>
            </div>
            <div className="personalization__content">
                <div className="personalization__left">
                    <div className="personalization__top">
                        <div className="personalization__options">
                            <div className="options__above">
                                <div className="option__shape">
                                    <select>
                                        <option value="0" disabled selected>Filtrar por tipo:</option>
                                        <option value="1">Opción 1</option>
                                        <option value="2">Opción 2</option>
                                        <option value="3">Opción 3</option>
                                    </select>
                                </div>
                                <div className="option__shape">
                                    <input type="date" id="fecha" />
                                </div>
                            </div>
                            <div className="options__bellow">
                                <div className="option__search">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <input type="search" placeholder="Escriba el elemento a buscar" />
                                </div>
                                <div className="option__button">
                                    <button type="submit">Buscar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="depuration__bottom">
                        <div className="bottom__title">
                            <h3>Lista de personalizaciones disponibles</h3>
                        </div>
                        <div className="bottom__content">
                            <span>
                                Aún no has descargado nada.
                            </span>
                        </div>
                    </div>
                </div>
                <div className="personalization__right">
                    <div className="personalization__box">   
                        <div className="box__title">
                            <h3>Agregar Palabra</h3>
                        </div>                             
                        <form className="box__content" id="uploadForm" action="/upload" method="POST" enctype="multipart/form-data" >  
                            <div className="box__input">
                                <input type="text" placeholder="Agregue una palabra." />                             
                            </div>         
                            <div className="box__button">                              
                                <button type="submit">Agregar</button>
                            </div>    
                        </form>                                                                       
                    </div>
                    <div className="personalization__box">   
                        <div className="box__title">
                            <h3>Agregar Tema</h3>
                        </div>                         
                        <form className="box__content" id="uploadForm" action="/upload" method="POST" enctype="multipart/form-data">  
                            <div className="box__input">
                                <input type="text" placeholder="Agregue un tema." />                             
                            </div>         
                            <div className="box__button">                              
                                <button type="submit">Agregar</button>
                            </div>      
                        </form>                                                                      
                    </div>
                    <div className="personalization__box box--bottom">   
                        <div className="box__title">
                            <h3>Agregar Imagen</h3>
                        </div>      
                        <form className="box__content" id="uploadForm" action="/upload" method="POST" enctype="multipart/form-data">  
                            <div className="box__image">
                                <input type="file" id="imageInput" accept="image/*" />                              
                                <img id="preview" src="#" alt="" />
                            </div>         
                            <div className="box__buttons">                                
                                <label className="box__button" for="imageInput">Cargar</label>                                                                   
                                <div className="box__button">
                                    <button type="submit">Aceptar</button>
                                </div>                     
                            </div>    
                        </form>                                             
                    </div>                    
                </div>
            </div>
        </section>
      </LayoutAdmin>
    </>
  );
};

export default Depuration;
