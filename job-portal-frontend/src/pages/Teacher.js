import React from 'react';
import "../styles/adminComponents.css";
import LayoutAdmin from "../components/LayoutAdmin";

const Professor = () => {
  return (
    <>
      <LayoutAdmin>
        <section className="data__container">
            <div className="data__top">
                <h3>Profesores</h3>
                <div className="option__button">
                    <button type="submit">Agregar</button>
                </div>
            </div>            
            <div className="data__content">
                <table id="myTable">
                    <thead>
                        <tr>
                            <th>Codigo</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Edad</th>
                            <th>Correo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>123456789</td>
                            <td>ejemplo</td>
                            <td>ejemplo</td>
                            <td>20</td>
                            <td>ejemplo@gmail.com</td>
                        </tr>
                        <tr>
                            <td>123456789</td>
                            <td>ejemplo</td>
                            <td>ejemplo</td>
                            <td>20</td>
                            <td>ejemplo@gmail.com</td>
                        </tr>
                        <tr>
                            <td>123456789</td>
                            <td>ejemplo</td>
                            <td>ejemplo</td>
                            <td>20</td>
                            <td>ejemplo@gmail.com</td>
                        </tr>
                        <tr>
                            <td>123456789</td>
                            <td>ejemplo</td>
                            <td>ejemplo</td>
                            <td>20</td>
                            <td>ejemplo@gmail.com</td>
                        </tr>
                        <tr>
                            <td>123456789</td>
                            <td>ejemplo</td>
                            <td>ejemplo</td>
                            <td>20</td>
                            <td>ejemplo@gmail.com</td>
                        </tr>
                        <tr>
                            <td>123456789</td>
                            <td>ejemplo</td>
                            <td>ejemplo</td>
                            <td>20</td>
                            <td>ejemplo@gmail.com</td>
                        </tr>
                        <tr>
                            <td>123456789</td>
                            <td>ejemplo</td>
                            <td>ejemplo</td>
                            <td>20</td>
                            <td>ejemplo@gmail.com</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
      </LayoutAdmin>
    </>
  );
};

export default Professor;