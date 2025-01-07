import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgFor],
  templateUrl: './review-modal.component.html',
  styleUrl: './review-modal.component.css'
})
export class ReviewModalComponent {
  @Input() tourId!: string;
  @Output() reviewSubmitted = new EventEmitter<{ tourId: string, review: string, rating: number }>();
  reviewForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.reviewForm = this.fb.group({
      review: ['', Validators.required],
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  submitReview() {
    if (this.reviewForm.valid) {
      this.reviewSubmitted.emit({ tourId: this.tourId, ...this.reviewForm.value });
    }
  }
}
