import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, collectionGroup, CollectionReference, doc, Firestore, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Application, Review, Tour } from '../models/tour';
import { combineLatest, firstValueFrom, Observable, of, switchMap } from 'rxjs';
import { NotificationService } from './notification.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TourService {

  private firestore = inject(Firestore);

  constructor(private notificationService: NotificationService) { }

  // REFACTORING METHODS
  async createTour(tour: Tour) {
    return addDoc(collection(this.firestore, 'tours'), tour);
  }

  // returns null if tour does not exist
  async getTour(tourId: string) {
    const tourDoc = await getDoc(doc(this.firestore, 'tours', tourId));
    return tourDoc.exists() ? { id: tourDoc.id, ...tourDoc.data() } : null;
  }

  async getAllTours() {
    const toursCollection = collection(this.firestore, 'tours');
    const querySnapshot = await getDocs(toursCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour));
  }
  
  async getClubTours(clubId: string) {
    const toursCollection = collection(this.firestore, 'tours');
    const q = query(toursCollection, where('clubId', '==', clubId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour));
  }

  // APPLICATIONS SECTION

  async applyForTour(tourId: string, userId: string, userName: string, userPhoto: string) {
    let application: Application  = {
      userId: userId,
      userName: userName,
      userPhoto: userPhoto,
      
      status: "pending",
      timestamp: new Date().toISOString(),
      declinedMessage: ""
    };

    await setDoc(doc(this.firestore, `tours/${tourId}/applications`, userId), application);
  
    // Notify the club
    // const tourDoc = await getDoc(doc(this.firestore, "tours", tourId));
    // if (tourDoc.exists()) {
    //   const { createdBy: clubId, name: tourName } = tourDoc.data();
    //   await addDoc(collection(this.firestore, `users/${clubId}/notifications`), {
    //     message: `New application for "${tourName}"`,
    //     type: "application",
    //     read: false,
    //     createdAt: new Date()
    //   });
    // }
  }

  async getTourApplications(tourId: string) {
    const applicationsCollection = collection(this.firestore, `tours/${tourId}/applications`);
    const querySnapshot = await getDocs(applicationsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // returns null if user did not apply
  async getUserApplication(tourId: string, userId: string) {
    const appDoc = await getDoc(doc(this.firestore, `tours/${tourId}/applications`, userId));
    return appDoc.exists() ? appDoc.data() : null;
  }

  async updateApplicationStatus(tourId: string, userId: string, status: 'pending' | 'accepted' | 'declined' | 'canceled', declinedMessage?: string) {
    await updateDoc(doc(this.firestore, `tours/${tourId}/applications`, userId), { status, declinedMessage });
  
    // Notify user
    // await addDoc(collection(firestore, `users/${userId}/notifications`), {
    //   message: `Your application for tour "${tourId}" was ${status}`,
    //   type: status === "accepted" ? "acceptance" : "decline",
    //   read: false,
    //   createdAt: new Date()
    // });
  }

  // in this case you can just get tour and read participants from there
  // async getAcceptedParticipants(tourId: string) {
  //   const tourRef = doc(this.firestore, `tours/${tourId}`);
  //   const tourSnapshot = await getDoc(tourRef);
  //   return tourSnapshot.exists() ? tourSnapshot.data()?.['participants'] || [] : [];
  // }
  
  async getUserAcceptedTours(userId: string) {
    // ne radi zato sto club id nije u participants nego u objektu
    //throw Error('Not implemented');
    const toursCollection = collection(this.firestore, 'tours');
    const q = query(toursCollection, where('participantsIds', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async createReview(tourId: string, review: Review) {
    await addDoc(collection(this.firestore, `tours/${tourId}/reviews`), review);
  }

  async getTourReviews(tourId: string) {
    const reviewsCollection = collection(this.firestore, `tours/${tourId}/reviews`);
    const querySnapshot = await getDocs(reviewsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getUserReviews(userId: string) {
    const reviewsQuery = query(
      // this will fail until the index is created for all reviews subcollections
      collectionGroup(this.firestore, 'reviews'), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(reviewsQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  //  NOTIFICATION
  async getUserNotifications(userId: string) {
    const snapshot = await getDocs(collection(this.firestore, `users/${userId}/notifications`));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    await updateDoc(doc(this.firestore, `users/${userId}/notifications`, notificationId), { read: true });
  }

  // END OF REFACTORING METHODS

  async getToursUserAppliedFor(userId: string): Promise<Tour[]> {
    const toursRef = collection(this.firestore, 'tours') as CollectionReference;
    const toursSnapshot = await firstValueFrom(collectionData(toursRef, { idField: 'id' }));
    const appliedTours: any[] = [];
    for (const tour of toursSnapshot as Tour[]) {
      const applicationsRef = doc(this.firestore, `tours/${tour.id}/applications/${userId}`);
      const userApplication = await getDoc(applicationsRef);

      if (userApplication.exists()) {
        const reviewRef = doc(this.firestore, `tours/${tour.id}/reviews/${userId}`);
        const userReview = await getDoc(reviewRef);
        appliedTours.push({ id: tour.id, ...tour, application: userApplication.data(),  hasReviewed: userReview.exists() });
      }
    }

    return appliedTours;
  }

  async saveReview(tourId: string, userId: string, review: string, rating: number): Promise<void> {
    const reviewRef = doc(this.firestore, `tours/${tourId}/reviews/${userId}`);
    await setDoc(reviewRef, {
      userId: userId,
      review: review,
      rating: rating,
      date: new Date().toISOString()
    });
  }


}
