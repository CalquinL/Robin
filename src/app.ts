import express from "express";
import cors from "cors";
import path from "path";
import errorHandler from "./middlewares/errorHandler";
import UserRoutes from "./routes/user";
import PublicationRoutes from "./routes/publication";
import ReservationRoutes from "./routes/reservation";
import NotificationRoutes from "./routes/notification";

const app = express();

// Middlewares globales
// CORS restringido al origen del frontend (sección 9 de CLAUDE.md). Si la variable
// no está definida, el paquete "cors" refleja el origen de la petición (equivalente
// a no restringir), igual que antes de este cambio.
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Imágenes de publicaciones: servidas como estáticas (igual de públicas que el feed que las muestra)
app.use("/uploads/publications", express.static(path.join(process.cwd(), "uploads", "publications")));

// Cargar rutas (bajo /api/v1)
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/publications", PublicationRoutes);
app.use("/api/v1/reservations", ReservationRoutes);
app.use("/api/v1/notifications", NotificationRoutes);

// Soporte para la ruta anidada /users/{id}/publications
app.use("/api/v1", PublicationRoutes);

// Middleware de manejo de errores (DEBE ir al final)
app.use(errorHandler);

export default app;
