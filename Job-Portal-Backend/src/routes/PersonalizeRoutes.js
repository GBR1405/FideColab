import express from "express";
import {
  getTipoJuegos,
  getTemasPorJuego,
  guardarPersonalizacion,
  getConfiguracionPersonalizada,
  editarPersonalizacion,
  saveTemaJuego,
  getTemasPorJuegoTotal
} from "../controllers/PersonalizeController.js";

const router = express.Router();

router.get("/tipo-juegos", getTipoJuegos); 
router.get("/temas-juego/:juegoId", getTemasPorJuego);
router.post("/personalizacion", guardarPersonalizacion); 
router.get("/personalizacion", getConfiguracionPersonalizada); 
router.post("/editar_personalizacion", editarPersonalizacion);
router.post("/agregar_contenido", saveTemaJuego);
router.get("/gettemas", getTemasPorJuegoTotal)

export default router;
