import multer from "multer";
import path from "path";
import fs from "fs";

// Asegurar que la carpeta de uploads existe
const uploadDir = "uploads/users/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, _file, cb) => {
        // Nombre único: timestamp + extensión original
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, _file.fieldname + "-" + uniqueSuffix + path.extname(_file.originalname));
    }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Forzamos el tipo para evitar el error de Multer en TS
        cb(null as any, false);
    }
};

export const uploadMiddleware = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Límite de 2MB
    fileFilter: fileFilter
}).single("file");
