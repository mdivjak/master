import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Added
import { Review } from '../../models/tour'; // Added - Assuming Review model exists and includes these fields

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgFor],
  templateUrl: './review-modal.component.html',
  styleUrl: './review-modal.component.css'
})
export class ReviewModalComponent {
  @Input() tourId!: string;
  @Output() reviewSubmitted = new EventEmitter<{ tourId: string, reviewPayload: Review }>(); // Updated
  @Output() modalClosed = new EventEmitter<void>();
  
  reviewForm: FormGroup;
  selectedRating: number = 0;
  hoveredRating: number = 0;
  private authService = inject(AuthService);

  constructor(private fb: FormBuilder) {
    this.reviewForm = this.fb.group({
      review: ['', [Validators.required, Validators.maxLength(500)]],
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
    this.reviewForm.patchValue({ rating });
  }

  getRatingText(rating: number): string {
    const ratingTexts = {
      0: 'Select a rating',
      1: 'Poor - Not recommended',
      2: 'Fair - Below expectations',
      3: 'Good - Met expectations',
      4: 'Very Good - Exceeded expectations',
      5: 'Excellent - Outstanding experience!'
    };
    return ratingTexts[rating as keyof typeof ratingTexts] || 'Select a rating';
  }

  closeModal(): void {
    this.modalClosed.emit();
  }

  submitReview() {
    if (this.reviewForm.valid) {
      const firebaseUser = this.authService.currentUser; // Get Firebase User
      const currentUserDetails = this.authService.currentUserData; // Get UserData (name, photo)

      if (firebaseUser && currentUserDetails) {
        const reviewPayload: Review = {
          userId: firebaseUser.uid, // Corrected: Use uid from Firebase User
          userName: currentUserDetails.name,
          userPhoto: currentUserDetails.photo,
          tourId: this.tourId, // Added tourId
          review: this.reviewForm.value.review,
          rating: this.reviewForm.value.rating,
          timestamp: new Date().toISOString()
        };
        this.reviewSubmitted.emit({ tourId: this.tourId, reviewPayload });
      } else {
        console.error('User not logged in or user details not loaded, cannot submit review.');
      }
    }
  }
}
