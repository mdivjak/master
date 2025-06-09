import { Component } from '@angular/core';
import { TourService } from '../../services/tour.service';
import { AuthService } from '../../services/auth.service';
import { NgFor, NgIf, NgClass, DatePipe, TitleCasePipe } from '@angular/common';
import { ReviewModalComponent } from "../review-modal/review-modal.component";
import { Application, Review, Tour } from '../../models/tour';
import { LoggingService } from '../../services/logging-service.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-tours',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, DatePipe, TitleCasePipe, ReviewModalComponent, RouterLink],
  templateUrl: './my-tours.component.html',
  styleUrl: './my-tours.component.css'
})
export class MyToursComponent {
  appliedTours: Application[] = []; // Combined data source
  showReviewModal: boolean = false;
  selectedTourId!: string; // Still needed for review modal if passing only tourId

  constructor(
    private tourService: TourService,
    private authService: AuthService,
    private loggingService: LoggingService) {}

  async ngOnInit(): Promise<void> {
    this.loadUserAppliedTours();
  }

  async loadUserAppliedTours() {
    if (this.authService.currentUser) {
      this.appliedTours = await this.tourService.getUserAppliedTours(this.authService.currentUser.uid);
      this.loggingService.debug('Loaded applied tours:', this.appliedTours);
    } else {
      this.loggingService.warn('No current user found, cannot load applied tours.');
      this.appliedTours = [];
    }
  }

  openReviewModal(tourId: string) {
    this.selectedTourId = tourId;
    this.showReviewModal = true;
  }

  isPastTour(tourDate: string): boolean {
    return new Date(tourDate) < new Date();
  }

  closeReviewModal() {
    this.showReviewModal = false;
  }

  async handleReviewSubmission(event: { tourId: string, reviewPayload: Review }) { // Updated event type
    // The reviewPayload already contains all necessary user info and timestamp from ReviewModalComponent
    await this.tourService.createReview(event.tourId, event.reviewPayload);
    this.loadUserAppliedTours(); // Refresh the list
    this.closeReviewModal();
  }

  getAcceptedTours(): Application[] {
    return this.appliedTours.filter(tour => tour.status === 'accepted');
  }

  getPendingTours(): Application[] {
    return this.appliedTours.filter(tour => tour.status === 'pending');
  }

  getCompletedTours(): Application[] {
    return this.appliedTours.filter(tour =>
      tour.status === 'accepted' && this.isPastTour(tour.tourDate)
    );
  }

  trackByTourId(index: number, tour: Application): string {
    return tour.tourId || index.toString();
  }
}
