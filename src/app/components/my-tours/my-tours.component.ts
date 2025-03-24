import { Component } from '@angular/core';
import { TourService } from '../../services/tour.service';
import { AuthService } from '../../services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { ReviewModalComponent } from "../review-modal/review-modal.component";
import { Application, Review, Tour } from '../../models/tour';
import { LoggingService } from '../../services/logging-service.service';

@Component({
  selector: 'app-my-tours',
  standalone: true,
  imports: [NgFor, NgIf, ReviewModalComponent],
  templateUrl: './my-tours.component.html',
  styleUrl: './my-tours.component.css'
})
export class MyToursComponent {
  tours: Tour[] = [];
  applications: Application[] = [];
  showReviewModal: boolean = false;
  selectedTourId!: string;

  constructor(
    private tourService: TourService,
    private authService: AuthService,
    private loggingService: LoggingService) {}

  async ngOnInit(): Promise<void> {
    this.getUserAppliedTours();
  }

  async getUserAppliedTours() {
    let results = await this.tourService.getUserAppliedTours(this.authService.currentUser!.uid);
    this.tours = results.tours;
    this.applications = results.applications;
  }

  cancelApplication(tourId: string) {
    this.tourService.updateApplicationStatus(tourId, this.authService.currentUser?.uid!, "canceled", "");
    this.tourService.removeTourParticipant(tourId, this.authService.currentUser?.uid!);
    this.getUserAppliedTours();
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

  async handleReviewSubmission(event: { tourId: string, review: string, rating: number }) {
    if (this.authService.currentUser) {
      let review: Review = {
        userId: this.authService.currentUser.uid,
        review: event.review,
        rating: event.rating,
        userName: this.authService.currentUser.displayName!,
        userPhoto: this.authService.currentUser.photoURL!,
        timestamp: new Date().toISOString()
      };
      await this.tourService.createReview(event.tourId, review);
      this.getUserAppliedTours();
    }
    this.closeReviewModal();
  }
}
