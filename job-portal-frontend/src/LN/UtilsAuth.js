import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

const secretKey = process.env.REACT_APP_SECRET_KEY; // La clave secreta

export const isAuthenticated = () => {
  const userInfoCookie = Cookies.get('IFUser_Info');
  return !!userInfoCookie; // Si existe la cookie, el usuario está autenticado
};

export const getRole = () => {
    const userInfoCookie = Cookies.get('IFUser_Info');
    if (!userInfoCookie) return null;
  
    try {
      const bytes = CryptoJS.AES.decrypt(userInfoCookie, secretKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      return decryptedData.rol;
    } catch (err) {
      console.error("Error al obtener el rol del usuario desde la cookie:", err);
      return null;
    }
  };
  
