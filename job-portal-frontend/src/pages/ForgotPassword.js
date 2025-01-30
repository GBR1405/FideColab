import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Mostrar el SweetAlert antes de enviar el correo
      Swal.fire({
        title: 'Enviando correo...',
        text: 'Por favor espera mientras enviamos el correo de recuperación.',
        icon: 'info',
        allowOutsideClick: false, // Evitar que el usuario cierre el modal
        didOpen: () => {
          Swal.showLoading(); // Muestra el indicador de carga
        }
      });
  
      try {
        await axios.post("http://localhost:3000/api/auth/forgot-password", { email });
        Swal.fire({
          title: 'Correo enviado',
          text: 'Revisa tu bandeja de entrada para continuar con la recuperación de tu contraseña.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        navigate("/login");
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || "Error al enviar el correo.",
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    };
  
    return (
      <div className="container">
        <h2>Recuperar Contraseña</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar correo</button>
        </form>
      </div>
    );
  }
