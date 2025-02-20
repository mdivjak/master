import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserData } from '../../models/userdata';
import { NgFor, NgIf } from '@angular/common';
import { Tour } from '../../models/tour';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { ImageUtils } from '../../utils/image-utils';

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
  name: string = '';
  photoFile: File | null = null;
  photoString!: string;

  constructor(
    private authService: AuthService,
    private tourService: TourService) {}

  async ngOnInit() {
    this.clubProfile = this.authService.currentUserData!;
    this.tours = await this.tourService.getClubTours(this.authService.currentUser!.uid);
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  onFileSelected(event: any) {
    this.photoFile = event.target.files[0];
  }

  async saveProfile() {
    if(this.name != '' && this.name != undefined)
      this.clubProfile.name = this.name;

    if(this.photoFile != null) {
      this.photoString = await ImageUtils.readAndResizeImage(this.photoFile, 200, 200) as string;
      this.clubProfile.photo = this.photoString;
    }

    this.authService.updateUser(this.authService.currentUser!.uid, this.clubProfile.name, this.clubProfile.photo);

    this.toggleEditMode();
  }
}
