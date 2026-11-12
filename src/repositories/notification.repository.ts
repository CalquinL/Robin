import Notification, { INotification } from "../models/notification";

class NotificationRepository {
    async create(notificationData: Partial<INotification>): Promise<INotification> {
        const notification = new Notification(notificationData);
        return await notification.save();
    }

    async findByUser(
        userId: string,
        options: any,
        read?: boolean
    ): Promise<{ docs: INotification[], totalDocs: number, totalPages: number, page: number, limit: number }> {
        const filter: Record<string, unknown> = { user_id: userId };
        if (read !== undefined) filter.read = read;
        return await (Notification as any).paginate(filter, options);
    }

    async findById(id: string): Promise<INotification | null> {
        return await Notification.findById(id);
    }

    async markAsRead(id: string): Promise<INotification | null> {
        return await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    }
}

export default new NotificationRepository();
