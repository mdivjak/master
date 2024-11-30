import { Component } from '@angular/core';
import { UserData } from '../../models/userdata';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-hiker',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './profile-hiker.component.html',
  styleUrl: './profile-hiker.component.css'
})
export class ProfileHikerComponent {
  userProfile!: UserData;
  editMode: boolean = false;
  firstName: string = '';
  lastName: string = '';

  constructor(
    private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    this.authService.userData$.subscribe(userData => {
      const cUserData = userData;
      if(cUserData) {
        this.userProfile = cUserData;
      }

      this.firstName = this.userProfile.firstName;
      this.lastName = this.userProfile.lastName;
    });
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  async saveProfile() {
    this.userProfile.firstName = this.firstName;
    this.userProfile.lastName = this.lastName;

    this.authService.updateUserData(this.userProfile);

    this.toggleEditMode();
  }
}
