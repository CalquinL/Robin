import bcrypt from "bcrypt";
import userRepository from "../repositories/user.repository";
import publicationRepository from "../repositories/publication.repository";
import AppError from "../utils/AppError";
import { IUser } from "../models/user";
import { IPublication } from "../models/publication";

class UserService {
    async getUserById(id: string): Promise<IUser | null> {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new AppError("NOT_FOUND", 404, "El usuario no existe");
        }
        return user;
    }

    async updateProfile(id: string, updateData: any): Promise<IUser | null> {
        // Solo estos campos son editables por el propio usuario (sección 7 de CLAUDE.md).
        // Sin este filtro, cualquiera podía mandar { role: "admin" } y quedaba guardado.
        const allowedFields = ["name", "surname", "nick", "address", "phone"] as const;
        const sanitizedData: Partial<IUser> = {};
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                sanitizedData[field] = updateData[field];
            }
        }

        // Cambio de contraseña: mismo endpoint, campos opcionales. Exige la contraseña
        // actual para evitar que una sesión robada se quede con la cuenta para siempre.
        if (updateData.new_password) {
            if (!updateData.current_password) {
                throw new AppError("VALIDATION_ERROR", 400, "Debes indicar tu contraseña actual para cambiarla");
            }

            const userWithPassword = await userRepository.findByIdWithPassword(id);
            if (!userWithPassword) {
                throw new AppError("NOT_FOUND", 404, "El usuario no existe");
            }

            const isCurrentPasswordValid = await bcrypt.compare(updateData.current_password, userWithPassword.password);
            if (!isCurrentPasswordValid) {
                throw new AppError("INVALID_CREDENTIALS", 401, "La contraseña actual no es correcta");
            }

            sanitizedData.password = await bcrypt.hash(updateData.new_password, 10);
        }

        const updatedUser = await userRepository.update(id, sanitizedData);
        if (!updatedUser) {
            throw new AppError("NOT_FOUND", 404, "El usuario no existe");
        }
        return updatedUser;
    }

    async getAllUsers(page: number, limit: number): Promise<{ users: IUser[], total: number }> {
        return await userRepository.findAll(page, limit);
    }

    // Separado de updateProfile a propósito: el nombre de archivo viene de multer
    // (UserController.upload), nunca de texto libre del usuario, así que no pasa
    // por el whitelist de campos editables.
    async updateAvatar(userId: string, fileName: string): Promise<IUser | null> {
        return await userRepository.update(userId, { image: fileName });
    }

    async savePublication(userId: string, publicationId: string): Promise<void> {
        const publication = await publicationRepository.findById(publicationId);
        if (!publication) {
            throw new AppError("NOT_FOUND", 404, "La publicación no existe");
        }
        await userRepository.addSavedPublication(userId, publicationId);
    }

    async unsavePublication(userId: string, publicationId: string): Promise<void> {
        await userRepository.removeSavedPublication(userId, publicationId);
    }

    async listSavedPublications(userId: string, page: number, limit: number): Promise<{ docs: IPublication[], total: number }> {
        const savedIds = await userRepository.findSavedPublicationIds(userId);
        const orderedIds = [...savedIds].reverse(); // más reciente primero
        const total = orderedIds.length;

        const start = (page - 1) * limit;
        const pageIds = orderedIds.slice(start, start + limit);

        const publications = await publicationRepository.findByIds(pageIds);
        const byId = new Map(publications.map((p) => [(p._id as any).toString(), p]));
        const docs = pageIds.map((id) => byId.get(id)).filter((p): p is IPublication => Boolean(p));

        return { docs, total };
    }
}

export default new UserService();
