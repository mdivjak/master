import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private userSubject = new BehaviorSubject<User | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, user => {
      this.userSubject.next(user);
    });
  }

  get user$() {
    return this.userSubject.asObservable();
  }

  async register(email: string, password: string, firstName: string, lastName: string, userType: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

    // Save user details in Firestore
    await setDoc(doc(this.firestore, 'users', user.uid), {
      firstName: firstName,
      lastName: lastName,
      email: email,
      type: userType
    });

    return userCredential;
  }

  async login(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    return await signOut(this.auth);
  }
}
