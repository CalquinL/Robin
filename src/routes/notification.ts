import { Router } from "express";
import NotificationController from "../controllers/notification";
import { auth } from "../middlewares/auth";

const router = Router();

router.get("/", auth, NotificationController.list);
router.patch("/:id", auth, NotificationController.markRead);

export default router;
