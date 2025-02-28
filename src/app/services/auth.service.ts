import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from '@angular/fire/auth';
import { doc, Firestore, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
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

  private _currentUserData: UserData | null = null;
  private userDataSubject = new BehaviorSubject<UserData | null>(null);

  private userTypeSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    onAuthStateChanged(this.auth, async (user) => {
      if(user) {
        const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));

        this._currentUserData = userDoc.data() as UserData;
        this.userDataSubject.next(this._currentUserData);
        this.userTypeSubject.next(this._currentUserData.type ?? null);
      } else {
        this._currentUserData = null;
        this.userDataSubject.next(null);
        this.userTypeSubject.next(null);
      }
      this.userSubject.next(user);
    });
  }

  get user$() {
    return this.userSubject.asObservable();
  }

  get userData$() {
    return this.userDataSubject.asObservable();
  }

  get userType$() {
    return this.userTypeSubject.asObservable();
  }

  get currentUser() {
    return this.auth.currentUser;
  }

  get currentUserData() {
    return this._currentUserData;
  }

  async register(userData: UserData, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, userData.email, password);
    const user = userCredential.user;

    // Save user details in Firestore
    await setDoc(doc(this.firestore, 'users', user.uid), userData);

    return userCredential;
  }

  async login(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    return await signOut(this.auth);
  }

  async getUserData(userId: string) {
    const userDoc = await getDoc(doc(this.firestore, "users", userId));
    return userDoc.exists() ? userDoc.data() : null;
  }

  async updateUser(userId: string, name?: string, photo?: string) {
    const updates: any = {};
    if (name) updates.name = name;
    if (photo) updates.photo = photo;
  
    await updateDoc(doc(this.firestore, "users", userId), updates);
  }
}
