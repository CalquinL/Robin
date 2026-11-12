import publicationRepository from "../repositories/publication.repository";
import userRepository from "../repositories/user.repository";
import reservationRepository from "../repositories/reservation.repository";
import AppError from "../utils/AppError";
import { IPublication, INeed } from "../models/publication";
import { PublicationStatus } from "../types/domain";
import NotificationService from "./notification.service";

class PublicationService {
    async createPublication(userId: string, data: any): Promise<IPublication> {
        const publicationData = {
            ...data,
            user_id: userId,
            status: "pendiente" as PublicationStatus
        };

        return await publicationRepository.create(publicationData);
    }

    async getPublicationById(id: string): Promise<IPublication> {
        const publication = await publicationRepository.findById(id);
        if (!publication) {
            throw new AppError("NOT_FOUND", 404, "La publicación no existe");
        }
        return publication;
    }

    // Para mostrar en pantalla (con el autor poblado). No usar para chequeos de propiedad.
    async getPublicationWithAuthor(id: string): Promise<IPublication> {
        const publication = await publicationRepository.findByIdWithAuthor(id);
        if (!publication) {
            throw new AppError("NOT_FOUND", 404, "La publicación no existe");
        }
        return publication;
    }

    async listPublications(
        options: any,
        status: PublicationStatus = "aprobada",
        searchText?: string
    ): Promise<{ docs: IPublication[], totalDocs: number, totalPages: number, page: number, limit: number }> {
        if (!searchText || !searchText.trim()) {
            return await publicationRepository.findByStatus(status, options);
        }

        const trimmedSearch = searchText.trim();
        const matchingUserIds = await userRepository.findIdsByNameMatch(trimmedSearch);

        return await publicationRepository.findByStatus(status, options, {
            text: trimmedSearch,
            matchingUserIds
        });
    }

    async listUserPublications(userId: string, options: any): Promise<{ docs: IPublication[], totalDocs: number, totalPages: number, page: number, limit: number }> {
        return await publicationRepository.findByUserId(userId, options);
    }

    async updatePublication(id: string, userId: string, data: any): Promise<IPublication | null> {
        const publication = await this.getPublicationById(id);

        if (publication.user_id.toString() !== userId) {
            throw new AppError("FORBIDDEN", 403, "No tienes permiso para editar esta publicación");
        }

        return await publicationRepository.update(id, data);
    }

    async deletePublication(id: string, userId: string): Promise<IPublication | null> {
        const publication = await this.getPublicationById(id);

        if (publication.user_id.toString() !== userId) {
            throw new AppError("FORBIDDEN", 403, "No tienes permiso para eliminar esta publicación");
        }

        const hasActiveReservations = await reservationRepository.hasActiveReservations(id);
        if (hasActiveReservations) {
            throw new AppError("PUBLICATION_HAS_ACTIVE_RESERVATIONS", 409, "No se puede eliminar una publicación con reservas activas");
        }

        const deleted = await publicationRepository.delete(id, userId);
        if (!deleted) {
            throw new AppError("NOT_FOUND", 404, "No se pudo encontrar la publicación para eliminar");
        }
        return deleted;
    }

    async moderatePublication(id: string, status: PublicationStatus): Promise<IPublication | null> {
        const publication = await this.getPublicationById(id);

        if (publication.status !== "pendiente") {
            throw new AppError("INVALID_STATE_TRANSITION", 409, "La publicación ya ha sido moderada");
        }

        const moderated = await publicationRepository.updateStatus(id, status);

        if (status === "aprobada") {
            await NotificationService.createNotification(
                publication.user_id.toString(),
                "confirmación",
                "Tu publicación fue aprobada y ya es visible en el feed."
            );
        } else if (status === "rechazada") {
            await NotificationService.createNotification(
                publication.user_id.toString(),
                "alerta pendiente",
                "Tu publicación fue rechazada por un administrador."
            );
        }

        return moderated;
    }

    async updatePublicationImage(id: string, userId: string, filename: string): Promise<IPublication | null> {
        const publication = await this.getPublicationById(id);

        if (publication.user_id.toString() !== userId) {
            throw new AppError("FORBIDDEN", 403, "No tienes permiso para cambiar la imagen");
        }

        return await publicationRepository.updateImage(id, userId, filename);
    }
}

export default new PublicationService();
