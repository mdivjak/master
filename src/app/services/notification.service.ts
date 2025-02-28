import { inject, Injectable } from '@angular/core';
import { arrayUnion, collection, doc, Firestore, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private firestore = inject(Firestore);

  constructor() { }

  async getUserNotifications(userId: string) {
    const snapshot = await getDocs(collection(this.firestore, `users/${userId}/notifications`));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    // TODO: notifications might not have an id
    await updateDoc(doc(this.firestore, `users/${userId}/notifications`, notificationId), { read: true });
  }

  async sendNotification(userId: string, type: 'application' | 'statusUpdate', message: string) {
    const userRef = doc(this.firestore, 'users', userId);
    const notification = {
      type: type,
      message: message,
      read: false,
      createdAt: new Date().toISOString()
    };
    await updateDoc(userRef, {
      notifications: arrayUnion(notification)
    });
  }

  async markAsRead(uid: string, index: number) {
    const userRef = doc(this.firestore, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const notifications = userSnap.data()['notifications'];
      if (notifications && notifications[index]) {
        notifications[index].read = true;
        await updateDoc(userRef, { notifications: notifications });
      }
    }
  }
}
