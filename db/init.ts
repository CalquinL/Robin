// Script de creación de la base desde cero (sección 6 de CLAUDE.md).
// Uso: npm run db:init — ADVERTENCIA: borra las colecciones existentes antes de recrearlas.
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../src/models/user";
import Publication from "../src/models/publication";
import Reservation from "../src/models/reservation";
import Notification from "../src/models/notification";

const MONGODB_URI = process.env.MONGODB_URI;

async function initDB(): Promise<void> {
    if (!MONGODB_URI) {
        console.error("La variable de entorno MONGODB_URI no está definida");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Conectado a MongoDB para inicialización...");

        // Limpiar colecciones: esto es una base "desde cero", no una migración incremental.
        await User.deleteMany({});
        await Publication.deleteMany({});
        await Reservation.deleteMany({});
        await Notification.deleteMany({});
        console.log("Colecciones limpiadas.");

        // Sincroniza los índices definidos en los esquemas (ej. email y nick únicos).
        await User.syncIndexes();
        await Publication.syncIndexes();
        await Reservation.syncIndexes();
        await Notification.syncIndexes();
        console.log("Índices sincronizados.");

        // Admin inicial: el rol admin no se puede crear por registro público (sección 5).
        const adminPassword = await bcrypt.hash("admin123", 10);
        await User.create({
            name: "Administrador",
            surname: "Sistema",
            nick: "admin",
            email: "admin@robin.com",
            password: adminPassword,
            role: "admin",
            verified: true
        });
        console.log("Usuario admin creado: admin@robin.com / admin123");

        // Datos de prueba: un beneficiario, un donante y una publicación ya aprobada,
        // para que el manual de uso (Hito 3) tenga un flujo probable sin registrarse a mano.
        const beneficiarioPassword = await bcrypt.hash("beneficiario123", 10);
        const beneficiario = await User.create({
            name: "Beneficiario",
            surname: "Demo",
            nick: "beneficiario_demo",
            email: "beneficiario@robin.com",
            password: beneficiarioPassword,
            role: "beneficiario",
            verified: true
        });
        console.log("Usuario beneficiario de prueba creado: beneficiario@robin.com / beneficiario123");

        const donantePassword = await bcrypt.hash("donante123", 10);
        await User.create({
            name: "Donante",
            surname: "Demo",
            nick: "donante_demo",
            email: "donante@robin.com",
            password: donantePassword,
            role: "donante",
            verified: true
        });
        console.log("Usuario donante de prueba creado: donante@robin.com / donante123");

        await Publication.create({
            user_id: beneficiario._id,
            text: "Necesito ayuda para equipar la sala de mi hijo, que empieza el colegio este año.",
            status: "aprobada",
            necesidades: [
                { name: "Mochila escolar", status: "disponible" },
                { name: "Set de cuadernos y lápices", status: "disponible" }
            ]
        });
        console.log("Publicación de prueba creada (aprobada, con dos necesidades disponibles).");

        process.exit(0);
    } catch (error) {
        console.error("Error inicializando DB:", error);
        process.exit(1);
    }
}

initDB();
