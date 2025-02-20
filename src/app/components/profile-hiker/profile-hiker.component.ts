import { Component } from '@angular/core';
import { UserData } from '../../models/userdata';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageUtils } from '../../utils/image-utils';

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
  name: string = '';
  photoFile: File | null = null;
  photoString!: string;

  constructor(
    private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
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
}
