import { inject, Injectable } from '@angular/core';
import { arrayUnion, doc, Firestore, updateDoc } from '@angular/fire/firestore';

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
}
