// verifica que el usuario tenga uno de los roles permitidos para acceder a la ruta
export const roleMiddleware = (allowedRoles) => (req, res, next) => {
    try {

        if (!req.user) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }
        
        const { rol } = req.user;  

        if (!allowedRoles.includes(rol)) {
            return res.status(403).json({ message: "No tienes permiso para acceder a esta ruta" });
        }

        next();
    } catch (error) {
        console.error("Error en roleMiddleware:", error);
        res.status(500).json({ message: "Error en la validación de roles" });
    }
};

export default roleMiddleware;
