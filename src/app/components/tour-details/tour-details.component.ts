import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Application, Review, Tour } from '../../models/tour';
import { TourService } from '../../services/tour.service';
import { DatePipe, NgClass, NgFor, NgIf, DecimalPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MapComponent } from "../map/map.component";
import { LoggingService } from '../../services/logging-service.service';

@Component({
  selector: 'app-tour-details',
  standalone: true,
  imports: [NgIf, NgClass, MapComponent, NgFor, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './tour-details.component.html',
  styleUrl: './tour-details.component.css'
})
export class TourDetailsComponent {
  tour!: Tour;
  userId!: string;
  isHiker: boolean = false;
  hasApplied: boolean = false;
  application!: Application;
  reviews: Review[] = [];
  averageRating: number = 0;
  tourId!: string;

  constructor(
    private loggingService: LoggingService,
    private route: ActivatedRoute, 
    private tourService: TourService,
    private authService: AuthService,
    private router: Router) {}

  async ngOnInit(): Promise<void> {
    const tourIdFromRoute = this.route.snapshot.paramMap.get('id');
    this.loggingService.debug('TourDetailsComponent Tour ID from route:', tourIdFromRoute);

    if (tourIdFromRoute) {
      this.tourId = tourIdFromRoute;
      await this.getTour(this.tourId);
      // Ensure tour is loaded before trying to load reviews
      if (this.tour) {
        await this.loadTourReviews();
      }
    } else {
      this.router.navigate(['/']);
    }

    this.authService.user$.subscribe(async user => {
      this.loggingService.debug('TourDetailsComponent Current user:', user);
      const userId = user?.uid;

      if (userId && this.tourId) { // ensure tourId is available
        this.userId = userId;
        this.hasApplied = await this.checkApplication(this.tourId, this.userId);
        this.loggingService.debug('TourDetailsComponent User has applied:', this.hasApplied);
      }
    });

    this.authService.userType$.subscribe(userType => {
      this.loggingService.debug('TourDetailsComponent User type:', userType);
      if (userType === 'hiker') {
        this.isHiker = true;
      }
    });
  }

  async getTour(tourId: string) {
    const tour = await this.tourService.getTour(tourId) as Tour ?? null;
    if(!tour) {
      this.loggingService.error('TourDetailsComponent Tour not found:', tourId);
      this.router.navigate(['/']);
    } else {
      this.loggingService.debug('TourDetailsComponent Tour successfully retrieved:', tour);
      this.tour = tour;
    }
  }

  async applyForTour() {
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      this.loggingService.debug('TourDetailsComponent Applying for tour:', this.tourId, 'User ID:', currentUser.uid);
      await this.tourService.applyForTour(this.tourId, currentUser.uid, this.authService.currentUserData?.name!, this.authService.currentUserData?.photo!);
      this.checkApplication(this.tourId, currentUser.uid);
    } else {
      this.loggingService.error('TourDetailsComponent User not logged in, cannot apply for tour');
      this.router.navigate(['/']);
    }
  }

  async checkApplication(tourId: string, userId: string): Promise<boolean> {
    this.loggingService.debug('TourDetailsComponent Checking if user has applied for tour:', tourId, 'User ID:', userId);
    let application = await this.tourService.getUserApplication(tourId, userId);
    this.loggingService.debug('TourDetailsComponent Applications:', application);
    if (application == null) {
      this.loggingService.debug('TourDetailsComponent User has not applied for this tour');
      return false;
    } else {
      this.loggingService.debug('TourDetailsComponent User has applied for this tour');
      this.application = application as Application;
      return true;
    }
  }

async cancelMyApplication() {
    const currentUser = this.authService.currentUser;
    if (currentUser && this.tourId && this.application && (this.application.status === 'pending' || this.application.status === 'accepted')) {
      try {
        this.loggingService.debug('TourDetailsComponent Canceling application for tour:', this.tourId, 'User ID:', currentUser.uid);
        await this.tourService.cancelUserApplication(this.tourId, currentUser.uid);

        // Update local state to reflect cancellation
        this.hasApplied = false;
        // this.applicationStatus = 'canceled'; // Or fetch fresh status
        this.application = null!; // Clear the local application object
        // Or call this.checkApplication(this.tourId, currentUser.uid) again to refresh state from DB.
        // Let's use checkApplication for consistency:
        await this.checkApplication(this.tourId, currentUser.uid);

        // Optionally, show a success message/toast
        this.loggingService.info('Application canceled successfully.');

      } catch (error) {
        this.loggingService.error('Failed to cancel application:', error);
        // Optionally, show an error message/toast
      }
    } else {
      this.loggingService.warn('Cannot cancel application. Conditions not met or user not logged in.');
    }
  }
  private async loadTourReviews(): Promise<void> {
    if (this.tourId) {
      this.loggingService.debug('TourDetailsComponent Loading reviews for tour:', this.tourId);
      try {
        const reviews = await this.tourService.getTourReviews(this.tourId);
        this.reviews = reviews;
        this.loggingService.debug('TourDetailsComponent Reviews loaded:', this.reviews);
        if (this.reviews && this.reviews.length > 0) {
          const sum = this.reviews.reduce((acc, review) => acc + Number(review.rating), 0);
          this.averageRating = sum / this.reviews.length;
        } else {
          this.averageRating = 0;
        }
        this.loggingService.debug('TourDetailsComponent Average rating calculated:', this.averageRating);
      } catch (error) {
        this.loggingService.error('TourDetailsComponent Error loading tour reviews:', error);
        this.reviews = [];
        this.averageRating = 0;
      }
    }
  }
}
