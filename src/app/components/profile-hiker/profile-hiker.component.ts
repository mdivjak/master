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

  name!: string;
  photoString!: string;

  constructor(
    private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    this.authService.userData$.subscribe(userData => {
      const cUserData = userData;
      if(cUserData) {
        this.userProfile = cUserData;
      }

      this.name = this.userProfile.name;
    });
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  async saveProfile() {
    this.userProfile.name = this.name;
    this.userProfile.photo = this.photoString;

    this.authService.updateUserData(this.userProfile);

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
