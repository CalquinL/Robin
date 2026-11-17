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

// Necesidad: nombre y el estado con el que nace en el seed (no todas "disponible",
// para que "Mis donaciones" y las notificaciones tengan algo real que mostrar).
interface SeedNeed {
    name: string;
    status: "disponible" | "reservado" | "entregado";
}

interface SeedPublication {
    text: string;
    file: string;
    necesidades: SeedNeed[];
}

const SEED_PUBLICATIONS: SeedPublication[] = [
    {
        text: "Un incendio destruyó nuestra casa hace unos días y perdimos casi todo. Necesitamos ayuda para volver a tener lo básico mientras reconstruimos.",
        file: "images.jpg", // casa incendiada
        necesidades: [
            { name: "Colchones y frazadas", status: "entregado" },
            { name: "Ropa de abrigo", status: "reservado" },
            { name: "Artículos de aseo personal", status: "disponible" }
        ]
    },
    {
        text: "Mi madre está postrada y necesita cuidados especiales en casa. Agradecemos cualquier ayuda con insumos médicos y alimentación.",
        file: "paciente-1.jpg", // persona enferma
        necesidades: [
            { name: "Pañales para adulto", status: "disponible" },
            { name: "Leche y alimentos nutricionales", status: "reservado" },
            { name: "Medicamentos básicos", status: "entregado" }
        ]
    },
    {
        text: "Encontramos a este perrito en la calle, muy flaco y asustado. Lo estamos cuidando en casa, pero necesitamos ayuda para alimentarlo y llevarlo al veterinario.",
        file: "perro.jpg", // perro callejero
        necesidades: [
            { name: "Alimento para perro", status: "reservado" },
            { name: "Frazada para su cama", status: "disponible" },
            { name: "Consulta veterinaria", status: "entregado" }
        ]
    }
];

// Publicaciones que nacen "pendiente" (sin moderar), para que la pantalla de
// moderación del admin tenga algo real que aprobar o rechazar desde el primer
// arranque. Sin foto a propósito: también cubre el caso de publicación sin imagen.
interface SeedPendingPublication {
    text: string;
    necesidades: string[];
}

const SEED_PENDING_PUBLICATIONS: SeedPendingPublication[] = [
    {
        text: "Hace unos días nació mi segunda hija y no contamos con lo necesario para recibirla bien. Cualquier ayuda es bienvenida.",
        necesidades: ["Pañales recién nacido", "Leche de fórmula", "Ropa de bebé 0-3 meses"]
    },
    {
        text: "Nos notificaron el desalojo de la vivienda que arrendábamos y no tenemos dónde dormir esta semana. Necesitamos algo para pasar las próximas noches.",
        necesidades: ["Saco de dormir", "Colchoneta inflable", "Alimentos no perecibles"]
    },
    {
        text: "Mi hijo empieza el año escolar y no alcanzamos a comprarle lo básico para ir a clases.",
        necesidades: ["Zapatos escolares", "Uniforme completo", "Útiles escolares"]
    },
    {
        text: "Vivo solo y mi movilidad se ha reducido mucho últimamente. Necesito ayuda para desplazarme dentro y fuera de la casa.",
        necesidades: ["Silla de ruedas", "Bastón ortopédico", "Rampa portátil"]
    }
];

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
        const admin = await User.create({
            name: "Administrador",
            surname: "Sistema",
            nick: "admin",
            email: "admin@robin.com",
            password: adminPassword,
            role: "admin",
            verified: true
        });
        console.log("Usuario admin creado: admin@robin.com / admin123");

        // Datos de prueba: un beneficiario, un donante y publicaciones ya aprobadas,
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
        const donante = await User.create({
            name: "Donante",
            surname: "Demo",
            nick: "donante_demo",
            email: "donante@robin.com",
            password: donantePassword,
            role: "donante",
            verified: true
        });
        console.log("Usuario donante de prueba creado: donante@robin.com / donante123");

        // Tres publicaciones del mismo beneficiario, cada una con una necesidad en cada
        // estado posible (disponible, reservado, entregado), para poblar el feed, "Mis
        // donaciones" (de ambos roles) y las notificaciones desde el primer arranque.
        for (const seed of SEED_PUBLICATIONS) {
            const publication = await Publication.create({
                user_id: beneficiario._id,
                text: seed.text,
                file: seed.file,
                status: "aprobada",
                necesidades: seed.necesidades
            });

            const resumen = seed.text.slice(0, 40) + "...";
            await Notification.create({
                user_id: admin._id,
                type: "confirmación",
                message: `Aprobaste la publicación: "${resumen}"`
            });
            // Coincide con publicationService.moderatePublication: al aprobar, se notifica al beneficiario.
            await Notification.create({
                user_id: beneficiario._id,
                type: "confirmación",
                message: "Tu publicación fue aprobada y ya es visible en el feed."
            });

            for (const need of publication.necesidades) {
                if (need.status === "disponible") continue;

                const isEntregado = need.status === "entregado";
                await Reservation.create({
                    publication_id: publication._id,
                    item_id: need._id as any,
                    donor_id: donante._id,
                    status: need.status,
                    delivered_at: isEntregado ? new Date() : undefined
                });

                // Coincide con reservationService.createReservation / confirmDelivery: el
                // beneficiario es quien recibe la notificación real en la app.
                await Notification.create({
                    user_id: beneficiario._id,
                    type: "confirmación",
                    message: isEntregado
                        ? `Se ha confirmado la entrega del ítem: ${need.name}`
                        : `Un donante ha reservado el ítem: ${need.name}`
                });

                // El donante nunca recibe notificaciones en la app real (ningún service se las
                // envía); estas son solo para poblar la demo, no representan un flujo real.
                await Notification.create({
                    user_id: donante._id,
                    type: "confirmación",
                    message: isEntregado
                        ? `Se confirmó la entrega de: ${need.name}`
                        : `Reservaste el ítem: ${need.name}`
                });
            }

            console.log(`Publicación creada: "${resumen}" (${seed.file})`);
        }

        // Publicaciones "pendiente": sin notificaciones ni reservas, porque todavía
        // no les pasa nada (la app real tampoco notifica nada al crearlas).
        for (const seed of SEED_PENDING_PUBLICATIONS) {
            await Publication.create({
                user_id: beneficiario._id,
                text: seed.text,
                status: "pendiente",
                necesidades: seed.necesidades.map((name) => ({ name, status: "disponible" }))
            });
            console.log(`Publicación pendiente creada: "${seed.text.slice(0, 40)}..."`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error inicializando DB:", error);
        process.exit(1);
    }
}

initDB();
