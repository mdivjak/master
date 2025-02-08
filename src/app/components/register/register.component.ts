import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ FormsModule, RouterModule, CommonModule ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email!: string;
  name!: string;
  password!: string;
  confirmPassword!: string;
  userType!: string;
  profilePhoto?: File;
  photoString?: string;
  isLoading = false;
  invalidPhoto = false;

  constructor(private authService: AuthService,private router: Router) {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.router.navigate(['/']);
      }
    });
  }

  async onRegister(form: NgForm) {
    this.invalidPhoto = false;
    if (form.invalid) {
      return;
    }

    if(this.profilePhoto == undefined) {
      this.invalidPhoto = true;
      return;
    }

    this.loadPhoto();

    if(this.photoString == undefined) {
      this.invalidPhoto = true;
      return;
    }

    this.isLoading = true; // Show loading spinner

    await this.authService.register(this.photoString, this.email, this.password, this.name, this.userType);

    this.invalidPhoto = false;
    this.isLoading = false; // Hide loading spinner
    this.router.navigate(['/']);
  }

  onFileChange(event: any) {
    if(event.target.files.length > 0) {
      this.profilePhoto = event.target.files[0];
    }
  }

  loadPhoto() {
    if(this.profilePhoto == undefined)
      throw new Error("Profile photo is not set!");
    const reader = new FileReader();
    reader.onload = () => {
      this.photoString = reader.result as string;
    };
    reader.readAsDataURL(this.profilePhoto);
  }
}
