import { Component } from '@angular/core';
import { TourService } from '../../services/tour.service';
import { AuthService } from '../../services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { ReviewModalComponent } from "../review-modal/review-modal.component";

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
    this.tourService.cancelApplication(tourId, this.authService.currentUser?.uid);
    this.loadToursUserAppliedFor();
  }

  async loadToursUserAppliedFor() {
    if (this.authService.currentUser) {
      this.tours = await this.tourService.getToursUserAppliedFor(this.authService.currentUser.uid);
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
      await this.tourService.saveReview(event.tourId, this.authService.currentUser.uid, event.review, event.rating);
      this.loadToursUserAppliedFor();
    }
    this.closeReviewModal();
  }
}
