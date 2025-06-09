import { Component } from '@angular/core';
import { UserData } from '../../models/userdata';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageUtils } from '../../utils/image-utils';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-hiker',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink],
  templateUrl: './profile-hiker.component.html',
  styleUrl: './profile-hiker.component.css'
})
export class ProfileHikerComponent {
  userProfile!: UserData;

  editMode: boolean = false;
  name: string = '';
  photoFile: File | null = null;
  photoString!: string;

  constructor(
    private authService: AuthService) {}

  ngOnInit() {
    this.userProfile = this.authService.currentUserData!;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  onFileSelected(event: any) {
    this.photoFile = event.target.files[0];
  }

  async saveProfile() {
    if(this.name != '' && this.name != undefined)
      this.userProfile.name = this.name;

    if(this.photoFile != null) {
      this.photoString = await ImageUtils.readAndResizeImage(this.photoFile, 200, 200) as string;
      this.userProfile.photo = this.photoString;
    }

    this.authService.updateUser(this.authService.currentUser!.uid, this.userProfile.name, this.userProfile.photo);

    this.toggleEditMode();
  }

  getToursCount(): number {
    // This would normally come from a service call
    // For now, return a placeholder value
    return 5;
  }

  getMilesHiked(): number {
    // This would normally come from a service call
    // For now, return a placeholder value
    return 127;
  }

  getMemberSince(): string {
    // This would normally come from the user's creation date
    // For now, return a placeholder value
    const memberSince = new Date('2023-01-15');
    return memberSince.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }
}
