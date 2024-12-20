import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  
  constructor() { }

  loadUserData(userId: string) {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    return getDoc(userDocRef).then(docSnapshot => {
      if (docSnapshot.exists()) {
        return docSnapshot.data();
      } else {
        throw new Error('User not found');
      }
    });
  }
}
