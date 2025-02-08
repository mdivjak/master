export interface UserData {
    email: string;
    name: string;
    photo: string;
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