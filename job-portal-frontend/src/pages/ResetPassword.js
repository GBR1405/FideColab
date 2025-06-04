import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/login.css";

const apiUrl = process.env.REACT_APP_API_URL;

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const validatePassword = (password) => {
    if (password.length <= 8) {
      return "Formato de contraseña invalido, debe tener minimo 8 caracteres y minimo un numero";
    }
    if (!/\d/.test(password)) {
      return "Formato de contraseña invalido, debe tener minimo 8 caracteres y minimo un numero";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    try {
      console.info(token);
      console.info(newPassword);
      await axios.post(`${apiUrl}/auth/reset-password`, { token, newPassword });
      toast.success("Contraseña cambiada con éxito");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al cambiar la contraseña");
    }
  };

  return (
    <>
    <div className="body-login">
    <header className="header-login">
        <img className="header__img-login" src="logo.png" alt="" />
        <span className="header__text-login">FideColab</span>
      </header>

      <main className="main-login">
        <div className="login-right-login">
          <form onSubmit={handleSubmit} className="login-form-login">
            <div className="form__heading-login">
              <h2 className="heading__title-login">Cambiar contraseña</h2>
              <span className="heading__text-login">Agrega una contraseña nueva</span>
            </div>
            <div className="form__input-login">
              <label className="input__label-login" htmlFor="contraseña">Nueva contraseña</label>
              <input
                className="input__shape-login"
                type="password"
                id="contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña"
              />
            </div>
            <div className="form__input-login">
              <label className="input__label-login" htmlFor="confirmar-contraseña">Confirmar contraseña</label>
              <input
                className="input__shape-login"
                type="password"
                id="confirmar-contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita la contraseña"
              />
            </div>
            <div className="form__button-login">
              <button className="button__shape-login" type="submit">Cambiar la contraseña</button>
            </div>
            <div className="form__link-login">
              <a className="link__text-login" href="/login">Volver</a>
            </div>
          </form>
        </div>
      </main>

      <aside className="aside-login">
          <article className="aside__article-login">
            <img className="article__quote-login" src="quote.svg" alt="" />
            <span className="article__text-login">
              El éxito del equipo radica en la colaboración, no en la competencia
            </span>
            <span className="article__author-login">— Anónimo</span>
            <img className="article__square-login" src="vector.svg" alt="" />
          </article>
        </aside>

      <script src="https://kit.fontawesome.com/fa4744a987.js" crossOrigin="anonymous"></script>
      </div>
    </>
  );
}
