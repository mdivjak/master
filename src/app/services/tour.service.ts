import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, collectionGroup, CollectionReference, doc, Firestore, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Application, Review, Tour } from '../models/tour';
import { combineLatest, firstValueFrom, Observable, of, switchMap } from 'rxjs';
import { NotificationService } from './notification.service';
import { map } from 'rxjs/operators';
import { LoggingService } from './logging-service.service';

@Injectable({
  providedIn: 'root'
})
export class TourService {

  private firestore = inject(Firestore);

  constructor(
    private loggingService: LoggingService
  ) { }

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
    this.loggingService.debug('TourService Getting user application for tour:', tourId, 'and user:', userId);
    const appDoc = await getDoc(doc(this.firestore, `tours/${tourId}/applications`, userId));
    if(appDoc.exists()) {
      this.loggingService.debug('TourService Application data:', appDoc.data());
      return appDoc.data();
    } else {
      this.loggingService.debug('TourService No application found');
      return null;
    }
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

  async addTourParticipant(tourId: string, userId: string, userName: string, userPhoto: string) {
    const tourDocRef = doc(this.firestore, 'tours', tourId);
    const tourDoc = await getDoc(tourDocRef);

    if (tourDoc.exists()) {
      const tourData = tourDoc.data() as Tour;
      const participantsIds = tourData.participantsIds || [];
      const participantsNames = tourData.participantsNames || [];
      const participantsPhotos = tourData.participantsPhotos || [];

      participantsIds.push(userId);
      participantsNames.push(userName);
      participantsPhotos.push(userPhoto);

      await updateDoc(tourDocRef, {
        participantsIds,
        participantsNames,
        participantsPhotos
      });
    } else {
      throw new Error('Tour not found');
    }
  }

  async removeTourParticipant(tourId: string, userId: string) {
    const tourDocRef = doc(this.firestore, 'tours', tourId);
    const tourDoc = await getDoc(tourDocRef);

    if (tourDoc.exists()) {
      const tourData = tourDoc.data() as Tour;
      const participantsIds = tourData.participantsIds || [];
      const participantsNames = tourData.participantsNames || [];
      const participantsPhotos = tourData.participantsPhotos || [];

      const index = participantsIds.indexOf(userId);
      if (index > -1) {
        participantsIds.splice(index, 1);
        participantsNames.splice(index, 1);
        participantsPhotos.splice(index, 1);

        await updateDoc(tourDocRef, {
          participantsIds,
          participantsNames,
          participantsPhotos
        });
      } else {
        throw new Error('Participant not found');
      }
    } else {
      throw new Error('Tour not found');
    }
  }

  // in this case you can just get tour and read participants from there
  // async getAcceptedParticipants(tourId: string) {
  //   const tourRef = doc(this.firestore, `tours/${tourId}`);
  //   const tourSnapshot = await getDoc(tourRef);
  //   return tourSnapshot.exists() ? tourSnapshot.data()?.['participants'] || [] : [];
  // }
  
  async getUserAppliedTours(userId: string) {
    const applicationsQuery = query(
      collectionGroup(this.firestore, 'applications'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(applicationsQuery);
  
    const applications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Application));
    const tourIds = querySnapshot.docs.map(doc => doc.ref.parent.parent?.id).filter(id => id !== undefined) as string[];
  
    const tours = await Promise.all(tourIds.map(async tourId => {
      const tourDoc = await getDoc(doc(this.firestore, 'tours', tourId));
      return tourDoc.exists() ? { id: tourDoc.id, ...tourDoc.data() } as Tour : null;
    }));
  
    return {
      tours: tours.filter(tour => tour !== null) as Tour[],
      applications
    };
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
  
}
