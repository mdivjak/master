import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  constructor() { }

  async register(email: string, password: string, firstName: string, lastName: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

    // Save user details in Firestore
    await setDoc(doc(this.firestore, 'users', user.uid), {
      firstName: firstName,
      lastName: lastName,
      email: email
    });

    return userCredential;
  }
}
