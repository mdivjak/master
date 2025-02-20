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
    const q = query(toursCollection, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  async getClubTours(clubId: string) {
    const toursCollection = collection(this.firestore, 'tours');
    const q = query(toursCollection, where('clubId', '==', clubId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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


  async loadTour(tourId: string) {
    const tourDoc = await getDoc(doc(this.firestore, 'tours', tourId));
    if (tourDoc.exists()) {
      const tourData = tourDoc.data() as Tour;
      return { ...tourData, id: tourDoc.id };
    } else {
      console.error('Tour not found');
    }
    return undefined;
  }

  async loadTours(userId: string) {
    const toursCollection = collection(this.firestore, 'tours');
    const q = query(toursCollection, where('createdBy', '==', userId));
    const querySnapshot = await getDocs(q);
    const tours = querySnapshot.docs.map(doc => {
      const tour = doc.data() as Tour;
      tour.id = doc.id;
      return tour;
    });
    return tours;
  }

  getTours() {
    const toursCollection = collection(this.firestore, 'tours');
    let tours$ = collectionData(toursCollection, { idField: 'id' }).pipe(
      switchMap((tours: Tour[]) => {
        if (tours.length === 0) {
          return of([]);
        }

        const userObservables = tours.map(tour =>
          getDoc(doc(this.firestore, 'users', tour.clubId)).then(userDoc => ({
            ...tour,
            createdByName: userDoc.exists() ? userDoc.data()?.['firstName'] : 'Unknown'
          }))
        );

        return combineLatest(userObservables);
      })
    ) as Observable<(Tour & { createdByName: string })[]>;

    return tours$;
  }

  async addTour(tour: Tour) {
    return addDoc(collection(this.firestore, 'tours'), tour);
  }

  async applyForTour2(tourId: string, tourName: string, tourOwner: string, userId: string, userName: string): Promise<void> {
    // Check if tourId or userId is invalid
    if (!tourId || !userId) {
      throw new Error('Invalid tourId or userId');
    }

    // Reference to the participant's application document in Firestore
    const participantRef = doc(this.firestore, `tours/${tourId}/applications/${userId}`);
    // Fetch the participant's application document
    const participantDoc = await getDoc(participantRef);
    
    // If the application does not exist, create a new application
    if (!participantDoc.exists()) {
      await setDoc(participantRef, {
        status: 'pending',
        appliedAt: new Date().toISOString()
      });
      // Send a notification to the tour owner about the new application
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString();
      const formattedTime = currentDate.toLocaleTimeString();
      const notificationMessage = `User ${userName} applied for tour ${tourName} on ${formattedDate} at ${formattedTime}`;
      await this.notificationService.sendNotification(tourOwner, 'application', notificationMessage);
    } else {
      // If the user has already applied, throw an error
      throw new Error('You have already applied for this tour.');
    }
  }

  async updateApplicationStatus2(tourId: string, userId: string, status: 'accepted' | 'rejected'): Promise<void> {
    if (!tourId || !userId) {
      throw new Error('Invalid tourId or userId');
    }
    const participantRef = doc(this.firestore, `tours/${tourId}/applications/${userId}`);
    const participantDoc = await getDoc(participantRef);
    if (participantDoc.exists()) {
      await setDoc(participantRef, {
        status: status,
        updatedAt: new Date().toISOString()
      });
      await this.notificationService.sendNotification(userId, 'statusUpdate', `Your application for the tour has been ${status}`);
    } else {
      throw new Error('User has not applied for this tour.');
    }
  }

  async hasUserApplied(tourId: string, userId: string): Promise<boolean> {
    const participantRef = doc(this.firestore, `tours/${tourId}/applications/${userId}`);
    const participantDoc = await getDoc(participantRef);
    return participantDoc.exists();
  }

  async loadAllApplications(tourId: string): Promise<any[]> {
    const applicationsCollection = collection(this.firestore, `tours/${tourId}/applications`);
    const applicationsSnapshot = await getDocs(applicationsCollection);
    const applications = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return applications;
  }

  rejectApplication(tourId: string, applicationId: string) {
    const applicationRef = doc(this.firestore, `tours/${tourId}/applications/${applicationId}`);
    return setDoc(applicationRef, { status: 'rejected'}, { merge: true });
  }

  acceptApplication(tourId: string, applicationId: any) {
    const applicationRef = doc(this.firestore, `tours/${tourId}/applications/${applicationId}`);
    return setDoc(applicationRef, { status: 'accepted'}, { merge: true });
  }

  cancelApplication(tourId: string, applicationId: any) {
    const applicationRef = doc(this.firestore, `tours/${tourId}/applications/${applicationId}`);
    return setDoc(applicationRef, { status: 'canceled'}, { merge: true });
  }

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
