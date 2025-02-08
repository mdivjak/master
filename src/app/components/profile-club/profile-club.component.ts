import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserData } from '../../models/userdata';
import { NgFor, NgIf } from '@angular/common';
import { Tour } from '../../models/tour';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TourService } from '../../services/tour.service';

@Component({
  selector: 'app-profile-club',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, RouterLink],
  templateUrl: './profile-club.component.html',
  styleUrl: './profile-club.component.css'
})
export class ProfileClubComponent {
  clubProfile!: UserData;
  tours!: Tour[];

  editMode: boolean = false;
  name!: string;
  photoString!: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private tourService: TourService) {}

  ngOnInit() {
    const currentUser = this.authService.currentUser;
    if(!currentUser) {
      this.router.navigate(['/login']);
    }

    this.authService.userData$.subscribe(async userData => {
      const cUserData = userData;
      if(cUserData) {
        this.clubProfile = cUserData;
        this.name = this.clubProfile.name;
        this.tours = await this.tourService.loadTours(currentUser!.uid);
      }
    });
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  async saveProfile() {
    if(this.clubProfile) {
      this.clubProfile.name = this.name;
      this.clubProfile.photo = this.photoString;
  
      this.authService.updateUserData(this.clubProfile);
  
      this.toggleEditMode();
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.photoString = reader.result as string;
    };

    reader.readAsDataURL(file);
  }
}
