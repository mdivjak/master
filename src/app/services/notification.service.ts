import { inject, Injectable } from '@angular/core';
import { arrayUnion, doc, Firestore, getDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private firestore = inject(Firestore);

  constructor() { }

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
