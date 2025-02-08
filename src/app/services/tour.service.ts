import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, doc, Firestore, getDoc, getDocs, query, setDoc, where } from '@angular/fire/firestore';
import { Tour } from '../models/tour';
import { combineLatest, firstValueFrom, Observable, of, switchMap } from 'rxjs';
import { NotificationService } from './notification.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TourService {

  private firestore = inject(Firestore);

  constructor(private notificationService: NotificationService) { }

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
          getDoc(doc(this.firestore, 'users', tour.createdBy)).then(userDoc => ({
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

  async applyForTour(tourId: string, tourOwner: string, userId: string): Promise<void> {
    if (!tourId || !userId) {
      throw new Error('Invalid tourId or userId');
    }
    const participantRef = doc(this.firestore, `tours/${tourId}/applications/${userId}`);
    const participantDoc = await getDoc(participantRef);
    if (!participantDoc.exists()) {
      await setDoc(participantRef, {
        status: 'pending',
        appliedAt: new Date().toISOString()
      });
      await this.notificationService.sendNotification(tourOwner, 'application', 'User applied for a tour!');
    } else {
      throw new Error('You have already applied for this tour.');
    }
  }

  async updateApplicationStatus(tourId: string, userId: string, status: 'accepted' | 'rejected'): Promise<void> {
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
