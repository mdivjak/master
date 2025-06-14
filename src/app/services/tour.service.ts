import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, collectionGroup, CollectionReference, doc, Firestore, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Application, Review, Tour } from '../models/tour';
import { SearchCriteria } from '../models/search';
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

  // SEARCH AND FILTERING METHODS

  /**
   * Main search method that combines all filters
   */
  async searchTours(criteria: SearchCriteria): Promise<Tour[]> {
    const allTours = await this.getAllTours();
    let filteredTours = [...allTours];

    // Apply text search
    if (criteria.searchText && criteria.searchText.trim().length >= 2) {
      filteredTours = this.filterToursByText(filteredTours, criteria.searchText);
    }

    // Apply difficulty filter
    if (criteria.difficulty && criteria.difficulty !== 'all') {
      filteredTours = this.filterToursByDifficulty(filteredTours, criteria.difficulty);
    }

    // Apply date range filter
    if (criteria.dateFrom || criteria.dateTo) {
      filteredTours = this.filterToursByDateRange(filteredTours, criteria.dateFrom, criteria.dateTo);
    }

    // Apply available spots filter
    if (criteria.hasAvailableSpots) {
      filteredTours = this.filterByAvailableSpots(filteredTours);
    }

    // Apply club name filter
    if (criteria.clubName && criteria.clubName.trim()) {
      filteredTours = this.filterToursByClubName(filteredTours, criteria.clubName);
    }

    // Apply sorting
    if (criteria.sortBy) {
      filteredTours = this.sortTours(filteredTours, criteria.sortBy, criteria.sortOrder || 'asc');
    }

    return filteredTours;
  }

  /**
   * Filter tours by text search in name, description, and club name
   */
  private filterToursByText(tours: Tour[], searchText: string): Tour[] {
    const query = searchText.toLowerCase().trim();
    return tours.filter(tour =>
      tour.name.toLowerCase().includes(query) ||
      tour.description.toLowerCase().includes(query) ||
      tour.clubName.toLowerCase().includes(query)
    );
  }

  /**
   * Filter tours by difficulty level
   */
  private filterToursByDifficulty(tours: Tour[], difficulty: string): Tour[] {
    return tours.filter(tour => tour.difficulty === difficulty);
  }

  /**
   * Filter tours by date range
   */
  private filterToursByDateRange(tours: Tour[], startDate?: Date, endDate?: Date): Tour[] {
    return tours.filter(tour => {
      const tourDate = new Date(tour.date);
      const isAfterStart = !startDate || tourDate >= startDate;
      const isBeforeEnd = !endDate || tourDate <= endDate;
      return isAfterStart && isBeforeEnd;
    });
  }

  /**
   * Filter tours that have available spots
   */
  private filterByAvailableSpots(tours: Tour[]): Tour[] {
    return tours.filter(tour =>
      tour.maxParticipants - tour.participantsIds.length > 0
    );
  }

  /**
   * Filter tours by club name
   */
  private filterToursByClubName(tours: Tour[], clubName: string): Tour[] {
    const query = clubName.toLowerCase().trim();
    return tours.filter(tour =>
      tour.clubName.toLowerCase().includes(query)
    );
  }

  /**
   * Sort tours by specified criteria
   */
  private sortTours(tours: Tour[], sortBy: string, order: string): Tour[] {
    return tours.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'difficulty':
          const difficultyOrder = { 'easy': 1, 'moderate': 2, 'hard': 3 };
          aValue = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0;
          bValue = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0;
          break;
        case 'participants':
          aValue = a.participantsIds.length;
          bValue = b.participantsIds.length;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'clubName':
          aValue = a.clubName.toLowerCase();
          bValue = b.clubName.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (order === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  }
  
}
