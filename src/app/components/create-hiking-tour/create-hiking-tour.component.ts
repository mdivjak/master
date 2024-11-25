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
    createdAt: ''
  };
  gpxFile: File | null = null;

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

  async onSubmit() {
    if (this.gpxFile) {
      const currentUser = this.authService.currentUser;
      if (currentUser) {
        const reader = new FileReader();
        reader.onload = async () => {
          const gpxContent = reader.result as string;

          this.tour.gpxContent = gpxContent;
          this.tour.createdBy = currentUser.uid;
          this.tour.createdAt = new Date().toISOString();

          try {
            const docRef = await this.tourService.addTour(this.tour);
            console.log('Tour created with ID:', docRef.id);
            this.router.navigate(['/']);
          } catch (error) {
            console.error('Error adding document:', error);
          }
        };
        reader.readAsText(this.gpxFile);
      } else {
        console.error('User is not authenticated');
      }
    } else {
      console.error('GPX file is required');
    }
  }
}
