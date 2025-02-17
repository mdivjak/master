import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tour } from '../../models/tour';
import { AuthService } from '../../services/auth.service';
import { TourService } from '../../services/tour.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-hiking-tour',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-hiking-tour.component.html',
  styleUrl: './create-hiking-tour.component.css'
})
export class CreateHikingTourComponent {
  tour: Tour = {
    name: '',
    date: '',
    description: '',
    gpxContent: '',
    difficulty: 'easy',
    participants: 0,
    createdBy: '',
    createdAt: '',
    photo: ''
  };
  gpxFile: File | null = null;
  gpxData: string | null = null;
  photoFile: File | null = null;
  photoData: string | null = null;

  message = '';

  constructor(
    private authService: AuthService,
    private tourService: TourService,
    private router: Router) {}

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.gpxFile = file;
    }
  }

  onPhotosChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.photoFile = file;
    }
  }

  async readPhotoFile() {
    if (this.photoFile) {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.photoData = reader.result as string;
          resolve();
        };
        reader.readAsDataURL(this.photoFile!);
      });
    }
  }

  async readGpxFile() {
    if (this.gpxFile) {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.gpxData = reader.result as string;
          resolve();
        };
        reader.readAsText(this.gpxFile!);
      });
    }
  }

  validate(): boolean {
    this.message = '';
    
    if (!this.tour.name) {
      this.message = 'Name is required';
      return false;
    }

    if (!this.tour.date) {
      this.message = 'Date is required';
      return false;
    }

    if (!this.tour.description) {
      this.message = 'Description is required';
      return false;
    }

    if (!this.gpxFile) {
      this.message = 'GPX file is required';
      return false;
    }

    if (!this.photoFile) {
      this.message = 'Photo file is required';
      return false;
    }

    if (!this.tour.difficulty) {
      this.message = 'Difficulty is required';
      return false;
    }

    if (this.tour.participants < 0) {
      this.message = 'Participants must be a positive number';
      return false;
    }

    return true;
  }

  async onSubmit() {
    if (!this.validate()) return;

    const currentUser = this.authService.currentUser;

    await this.readGpxFile();
    await this.readPhotoFile();

    this.tour.gpxContent = this.gpxData!;
    this.tour.photo = this.photoData!;
    this.tour.createdBy = currentUser!.uid;
    this.tour.createdAt = new Date().toISOString();

    // Upload tour
    const docRef = await this.tourService.addTour(this.tour);
    console.log('Tour created with ID:', docRef.id);
  }
}
