import { Router } from "express";
import ReservationController from "../controllers/reservation";
import { auth } from "../middlewares/auth";
import { roles } from "../middlewares/roles";

const router = Router();

// Rutas de Reservas
router.post("/", auth, roles(["donante"]), ReservationController.create);
router.get("/", auth, ReservationController.list);
router.get("/:id", auth, ReservationController.getById);
router.patch("/:id/status", auth, ReservationController.updateStatus);

export default router;
