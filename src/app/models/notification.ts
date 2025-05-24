export interface Notification {
    id?: string; // Firestore document ID
    userId: string;
    senderId: string;
    message: string;
    read: boolean;
    timestamp: string;
}