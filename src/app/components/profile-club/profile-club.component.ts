import { Component, inject } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { UserData } from '../../models/userdata';
import { NgFor, NgIf } from '@angular/common';
import { Tour } from '../../models/tour';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-club',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, RouterLink],
  templateUrl: './profile-club.component.html',
  styleUrl: './profile-club.component.css'
})
export class ProfileClubComponent {
  clubProfile: UserData | null = null;
  private firestore = inject(Firestore);
  tours!: Tour[];

  editMode: boolean = false;
  firstName: string = '';
  lastName: string = '';

  constructor(private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      const userDoc = await getDoc(doc(this.firestore, 'users', currentUser.uid));
      if (userDoc.exists()) {
        this.clubProfile = userDoc.data() as UserData;
        this.firstName = this.clubProfile.firstName;
        this.lastName = this.clubProfile.lastName;
        await this.loadTours(currentUser.uid);
      } else {
        console.error('User not found');
      }
    } else {
      console.error('User is not authenticated');
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  async loadTours(userId: string): Promise<void> {
    const toursCollection = collection(this.firestore, 'tours');
    const q = query(toursCollection, where('createdBy', '==', userId));
    const querySnapshot = await getDocs(q);
    this.tours = querySnapshot.docs.map(doc => {
      const tour = doc.data() as Tour;
      tour.id = doc.id;
      return tour;
    });
  }

  async saveProfile() {
    if(this.clubProfile) {
      this.clubProfile.firstName = this.firstName;
      this.clubProfile.lastName = this.lastName;
  
      this.authService.updateUserData(this.clubProfile);
  
      this.toggleEditMode();
    }
  }
}
