import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { UserData } from '../../models/userdata';

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

    try {
      await this.loadPhoto();
    } catch (error) {
      this.invalidPhoto = true;
      return;
    }

    if(this.photoString == undefined) {
      this.invalidPhoto = true;
      return;
    }

    this.isLoading = true; // Show loading spinner

    let userData: UserData = {
      name: this.name,
      email: this.email,
      type: this.userType,
      photo: this.photoString
    };

    await this.authService.register(userData, this.password);

    this.invalidPhoto = false;
    this.isLoading = false; // Hide loading spinner
    this.router.navigate(['/']);
  }

  onFileChange(event: any) {
    if(event.target.files.length > 0) {
      this.profilePhoto = event.target.files[0];
    }
  }

  loadPhoto(): Promise<void> {
    return new Promise((resolve, reject) => {
      if(this.profilePhoto == undefined) {
        reject(new Error("Profile photo is not set!"));
        return;
      }
  
      const reader = new FileReader();
      reader.onload = () => {
        this.photoString = reader.result as string;
        resolve();
      };
      reader.onerror = reject;
  
      reader.readAsDataURL(this.profilePhoto);
    });
  }
}
