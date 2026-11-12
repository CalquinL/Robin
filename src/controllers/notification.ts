import { Request, Response, NextFunction } from "express";
import notificationService from "../services/notification.service";
import { sendSuccess } from "../utils/response";
import AppError from "../utils/AppError";

class NotificationController {
    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

            const options = {
                page,
                limit,
                sort: { created_at: -1 }
            };

            const requestedRead = req.query.read;
            const read =
                requestedRead === "true" ? true : requestedRead === "false" ? false : undefined;

            const result = await notificationService.listUserNotifications(req.user!.id, options, read);

            sendSuccess(res, result.docs, 200, {
                page: result.page,
                limit: result.limit,
                total: result.totalDocs,
                pages: result.totalPages
            });
        } catch (error) {
            next(error);
        }
    }

    async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { read } = req.body;
            if (read !== true) {
                throw new AppError("VALIDATION_ERROR", 400, "Solo se admite marcar la notificación como leída");
            }

            const notification = await notificationService.markAsRead(req.params.id as string, req.user!.id);

            sendSuccess(res, {
                _id: notification._id,
                user_id: notification.user_id,
                type: notification.type,
                message: notification.message,
                read: notification.read,
                created_at: notification.created_at
            }, 200);
        } catch (error) {
            next(error);
        }
    }
}

export default new NotificationController();
