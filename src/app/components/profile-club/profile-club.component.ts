import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserData } from '../../models/userdata';
import { NgFor, NgIf, NgClass, DatePipe } from '@angular/common';
import { Tour } from '../../models/tour';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { ImageUtils } from '../../utils/image-utils';

@Component({
  selector: 'app-profile-club',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe, FormsModule, RouterLink],
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

  getTotalParticipants(): number {
    return this.tours.reduce((total, tour) => total + tour.participantsIds.length, 0);
  }

  getAverageRating(): string {
    // This would normally come from a service call to get tour reviews
    // For now, return a placeholder value
    return "4.8";
  }

  getUpcomingTours(): number {
    const now = new Date();
    return this.tours.filter(tour => new Date(tour.date) > now).length;
  }

  isUpcoming(dateString: string): boolean {
    const tourDate = new Date(dateString);
    const now = new Date();
    return tourDate > now;
  }

  trackByTourId(index: number, tour: Tour): string {
    return tour.id || index.toString();
  }
}
