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
      this.gpxFile = file;
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
        reader.readAsText(this.photoFile!);
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

  async onSubmit() {
    if (this.gpxFile) {
      const currentUser = this.authService.currentUser;
      if (currentUser) {
        await this.readGpxFile();

        this.tour.gpxContent = this.gpxData!;
        this.tour.createdBy = currentUser.uid;
        this.tour.createdAt = new Date().toISOString();

        // Read photo files and store results in photoData array
        await this.readPhotoFile();

        this.tour.photo = this.photoData!;

        // Upload tour
        const docRef = await this.tourService.addTour(this.tour);
        console.log('Tour created with ID:', docRef.id);

      } else {
        console.error('User is not authenticated');
      }
    } else {
      console.error('GPX file is required');
    }
  }
}
