export type NotificationType = "Event" | "Result" | "Placement";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface RankedNotification extends Notification {
  typeWeight: number;
}
