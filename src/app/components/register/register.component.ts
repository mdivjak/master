import { Component, inject } from '@angular/core';
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
  firstName!: string;
  lastName!: string;
  password!: string;
  confirmPassword!: string;
  userType!: string;
  isLoading = false;

  constructor(private authService: AuthService,private router: Router) {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.router.navigate(['/']);
      }
    });
  }

  async onRegister(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.isLoading = true; // Show loading spinner

    await this.authService.register(this.email, this.password, this.firstName, this.lastName, this.userType);

    this.isLoading = false; // Hide loading spinner
    this.router.navigate(['/']);
  }
}
