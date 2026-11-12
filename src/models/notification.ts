import { Schema, model, Document } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { NotificationType, NOTIFICATION_TYPE } from "../types/domain";

export interface INotification extends Document {
    user_id: Schema.Types.ObjectId;
    type: NotificationType;
    message: string;
    read: boolean;
    created_at: Date;
}

const NotificationSchema = new Schema<INotification>({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: NOTIFICATION_TYPE,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

NotificationSchema.plugin(mongoosePaginate);

export default model<INotification>("Notification", NotificationSchema, "notifications");
