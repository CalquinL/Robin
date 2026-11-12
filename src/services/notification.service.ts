import NotificationRepository from "../repositories/notification.repository";
import { INotification } from "../models/notification";
import { NotificationType } from "../types/domain";
import AppError from "../utils/AppError";

class NotificationService {
    async createNotification(userId: string, type: NotificationType, message: string): Promise<INotification | null> {
        try {
            return await NotificationRepository.create({ user_id: userId as any, type, message });
        } catch (error) {
            console.error(`[Notification Error]: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }

    async listUserNotifications(userId: string, options: any, read?: boolean): Promise<any> {
        return await NotificationRepository.findByUser(userId, options, read);
    }

    async markAsRead(id: string, userId: string): Promise<INotification> {
        const notification = await NotificationRepository.findById(id);
        if (!notification) {
            throw new AppError("NOT_FOUND", 404, "La notificación no existe");
        }

        if (notification.user_id.toString() !== userId) {
            throw new AppError("FORBIDDEN", 403, "No tienes permiso para modificar esta notificación");
        }

        const updated = await NotificationRepository.markAsRead(id);
        return updated!;
    }
}

export default new NotificationService();
