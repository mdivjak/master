import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import { doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { UserData } from '../models/userdata';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private userSubject = new BehaviorSubject<User | null>(null);
  private userTypeSubject = new BehaviorSubject<string | null>(null);
  private userDataSubject = new BehaviorSubject<UserData | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, async (user) => {
      if(user) {
        const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
        
        const userData = userDoc.data() as UserData;
        this.userDataSubject.next(userData);

        const userType = userData?.type ?? null;
        this.userTypeSubject.next(userType);
      } else {
        this.userTypeSubject.next(null);
      }
      this.userSubject.next(user);
    });
  }

  get user$() {
    return this.userSubject.asObservable();
  }

  get userType$() {
    return this.userTypeSubject.asObservable();
  }

  get userData$() {
    return this.userDataSubject.asObservable();
  }

  get currentUser() {
    return this.auth.currentUser;
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

  updateUserData(userProfile: UserData) {
    if(this.currentUser) {
      return setDoc(doc(this.firestore, 'users', this.currentUser.uid), userProfile);
    } else {
      throw new Error('User is not logged in');
    }
  }
}
