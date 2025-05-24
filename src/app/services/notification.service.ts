import { inject, Injectable } from '@angular/core';
import { addDoc, collection, doc, Firestore, getDocs, orderBy, query, updateDoc } from '@angular/fire/firestore';
import { Notification } from '../models/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private firestore = inject(Firestore);

  constructor() { }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const notificationsRef = collection(this.firestore, `users/${userId}/notifications`);
    // Assuming 'timestamp' is the field to order by, matching the Notification model
    const q = query(notificationsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as Omit<Notification, 'id'>; // Cast data to Notification, excluding id
      return { id: doc.id, ...data };
    });
  }

  async sendNotification(userId: string, type: 'application' | 'statusUpdate', message: string): Promise<void> {
    const notificationsRef = collection(this.firestore, `users/${userId}/notifications`);
    const notification: Omit<Notification, 'id'> = { // Ensure it matches the Notification model, excluding id
      userId: userId, // Add userId as per model
      senderId: type, // Use 'type' as 'senderId'
      message: message,
      read: false,
      timestamp: new Date().toISOString() // Use 'timestamp' as per model
    };
    await addDoc(notificationsRef, notification);
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    // This method replaces the old markAsRead and the existing markNotificationAsRead
    // The comment "TODO: notifications might not have an id" is resolved as we now expect an id.
    const notificationRef = doc(this.firestore, `users/${userId}/notifications`, notificationId);
    await updateDoc(notificationRef, { read: true });
  }
}
