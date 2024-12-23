export interface UserData {
    email: string;
    firstName: string;
    lastName: string;
    type: string;
    notifications: Notification[];
}

export interface Notification {
    type: string;
    message: string;
    read: boolean;
    date: Date;
    createdAt: string;
}