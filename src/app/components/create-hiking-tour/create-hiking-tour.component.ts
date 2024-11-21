import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tour } from '../../models/tour';
import { AuthService } from '../../services/auth.service';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';

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
    gpxFile: null,
    difficulty: 'easy',
    participants: 0
  };

  private firestore = inject(Firestore);

  constructor(private authService: AuthService) {}

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.tour.gpxFile = file;
    }
  }

  async onSubmit() {
    if (this.tour.gpxFile) {
      const currentUser = this.authService.currentUser;
      if (currentUser) {
        const reader = new FileReader();
        reader.onload = async () => {
          const gpxContent = reader.result as string;

          const tourData = {
            name: this.tour.name,
            date: this.tour.date,
            description: this.tour.description,
            gpxContent: gpxContent,
            difficulty: this.tour.difficulty,
            participants: this.tour.participants,
            createdBy: currentUser.uid,
            createdAt: new Date().toISOString()
          };

          try {
            const docRef = await addDoc(collection(this.firestore, 'tours'), tourData);
            console.log('Tour created with ID:', docRef.id);
          } catch (error) {
            console.error('Error adding document:', error);
          }
        };
        reader.readAsText(this.tour.gpxFile);
      } else {
        console.error('User is not authenticated');
      }
    } else {
      console.error('GPX file is required');
    }
  }
}
