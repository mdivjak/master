import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
import { Tour } from '../models/tour';
import { combineLatest, Observable, of, switchMap } from 'rxjs';
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

  loadParticipants(tourId: string) {
    const participantsCollection = collection(this.firestore, `tours/${tourId}/applications`);
    return collectionData(participantsCollection, { idField: 'id' }).pipe(
        map((applications: any[]) => applications.map(app => ({ ...app, id: app.id })))
      ) as Observable<any[]>;
  }
}
