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
    private loggingService: LoggingService,
    private notificationService: NotificationService
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
    const tourDocRef = doc(this.firestore, 'tours', tourId);
    const tourDoc = await getDoc(tourDocRef);

    if (!tourDoc.exists()) {
      this.loggingService.error(`Tour with ID ${tourId} not found.`);
      throw new Error(`Tour with ID ${tourId} not found.`);
      // Or return an appropriate response/status
    }

    const tourData = tourDoc.data() as Tour;

    let application: Application  = {
      userId: userId,
      userName: userName,
      userPhoto: userPhoto,
      status: "pending",
      timestamp: new Date().toISOString(),
      declinedMessage: "",
      // Denormalized fields
      tourId: tourId,
      tourName: tourData.name,
      tourDate: tourData.date, // Ensure this matches the type in Tour model, adjust if Firestore Timestamp
      tourPhoto: tourData.photo,
      clubName: tourData.clubName,
      clubId: tourData.clubId,
    };

    await setDoc(doc(this.firestore, `tours/${tourId}/applications`, userId), application);
  
    // Notify the club using denormalized data
    if (tourData.clubId && tourData.name) {
      try {
        await this.notificationService.sendNotification(
          tourData.clubId,
          'application',
          `New application for your tour: ${tourData.name} from ${userName}`
        );
        this.loggingService.info(`Notification sent to club ${tourData.clubId} for tour ${tourData.name}`);
      } catch (error) {
        this.loggingService.error('Error sending notification to club:', error);
      }
    } else {
      this.loggingService.warn(`ClubId or TourName missing in tourData for tour ${tourId}. ClubId: ${tourData.clubId}, TourName: ${tourData.name}`);
    }
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
async cancelUserApplication(tourId: string, userId: string): Promise<void> {
    const appRef = doc(this.firestore, `tours/${tourId}/applications/${userId}`);
    const appSnap = await getDoc(appRef);

    let wasAccepted = false;
    if (appSnap.exists()) {
      const applicationData = appSnap.data() as { status?: string }; // Adjust type as needed
      if (applicationData.status === 'accepted') {
        wasAccepted = true;
      }
    } else {
      console.warn(`Application with ID ${userId} for tour ${tourId} not found during cancellation.`);
      // For now, let's proceed to ensure status update is attempted if app was created between get and update.
    }

    // Update application status to 'canceled'
    // It's important this is called regardless of whether the app was found initially,
    // as it might have been created between the getDoc and this point,
    // or to handle cases where an application record needs to be explicitly marked 'canceled' even if not fully processed.
    await this.updateApplicationStatus(tourId, userId, "canceled", "");

    // If user was accepted, remove them from the tour's participant list
    if (wasAccepted) {
      try {
        await this.removeTourParticipant(tourId, userId);
      } catch (error) {
        console.error(`Error removing accepted participant ${userId} from tour ${tourId} during cancellation:`, error);
        // Decide if this error should be re-thrown or if cancellation is still "successful"
        // For this iteration, we log the error and continue, considering the cancellation of application status primary.
      }
    }
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
  
  async getUserAppliedTours(userId: string): Promise<Application[]> {
    const applicationsQuery = query(
      collectionGroup(this.firestore, 'applications'),
      where('userId', '==', userId)
    );
    const applicationsSnap = await getDocs(applicationsQuery);

    const userReviewsQuery = query(collectionGroup(this.firestore, 'reviews'), where('userId', '==', userId));
    const userReviewsSnap = await getDocs(userReviewsQuery);
    const reviewedTourIds = new Set(userReviewsSnap.docs.map(doc => {
      const data = doc.data();
      return data['tourId'];
    }));
  
    const appliedTours = applicationsSnap.docs.map(applicationDoc => {
      const appData = applicationDoc.data() as Application;
      const hasReviewed = reviewedTourIds.has(appData.tourId as string);
      return {
        ...appData,
        id: applicationDoc.id, // Ensure application ID is included
        hasBeenReviewed: hasReviewed,
      };
    });
  
    return appliedTours;
  }

  async createReview(tourId: string, reviewData: Review) {
    // const reviewToSave = { ...reviewData, tourId: tourId }; // Add tourId here
    // The tourId is already part of reviewData due to changes in ReviewModalComponent
    const reviewsCol = collection(this.firestore, `tours/${tourId}/reviews`);
    return addDoc(reviewsCol, reviewData);
  }

  async getTourReviews(tourId: string): Promise<Review[]> {
    const reviewsCollection = collection(this.firestore, `tours/${tourId}/reviews`);
    const q = query(reviewsCollection, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review));
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
