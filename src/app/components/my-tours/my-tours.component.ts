import { Component } from '@angular/core';
import { TourService } from '../../services/tour.service';
import { AuthService } from '../../services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { ReviewModalComponent } from "../review-modal/review-modal.component";
import { Review } from '../../models/tour';

@Component({
  selector: 'app-my-tours',
  standalone: true,
  imports: [NgFor, NgIf, ReviewModalComponent],
  templateUrl: './my-tours.component.html',
  styleUrl: './my-tours.component.css'
})
export class MyToursComponent {
  tours: any[] = [];
  showReviewModal: boolean = false;
  selectedTourId!: string;

  constructor(private tourService: TourService, private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        this.loadToursUserAppliedFor();
      }
    });
  }

  cancelApplication(tourId: string) {
    this.tourService.updateApplicationStatus(tourId, this.authService.currentUser?.uid!, "canceled", "");
    this.loadToursUserAppliedFor();
  }

  async loadToursUserAppliedFor() {
    if (this.authService.currentUser) {
      this.tours = await this.tourService.getUserAcceptedTours(this.authService.currentUser.uid);
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
      this.loadToursUserAppliedFor();
    }
    this.closeReviewModal();
  }
}
