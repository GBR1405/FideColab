import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET;

// Middleware para verificar el token JWT en las cookies
export const authMiddleware = (req, res, next) => {
  try {
      const token = req.cookies.authToken;

      if (!token) {
          console.log("No se recibió la cookie authToken.");
          return res.status(401).json({ message: "No autorizado" });
      }

      const decoded = jwt.verify(token, secretKey);

      req.user = decoded;
      next();
  } catch (error) {
      console.log("Error al verificar el token:", error); 
      return res.status(403).json({ message: "Token inválido o expirado" });
  }
};


export default authMiddleware;
