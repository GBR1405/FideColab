import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.cookies.authToken; // Asumiendo que el token está en las cookies

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  // Verificar el token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    // Si es válido, guardar el usuarioId en el objeto de solicitud
    req.usuarioId = decoded.usuarioId; // Asumiendo que 'usuarioId' es parte del payload del token
    next();
  });
};

export default authMiddleware;
