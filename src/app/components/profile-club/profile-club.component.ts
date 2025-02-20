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
    private tourService: TourService) {}

  async ngOnInit() {
    this.clubProfile = this.authService.currentUserData!;

    let tours = await this.tourService.getClubTours(this.authService.currentUser!.uid);
    console.log(tours);
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  async saveProfile() {
    this.clubProfile.name = this.name;
    this.clubProfile.photo = this.photoString;

    this.authService.updateUser(this.authService.currentUser!.uid, this.clubProfile.name, this.clubProfile.photo);
    //this.authService.updateUserData(this.clubProfile);

    this.toggleEditMode();
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
