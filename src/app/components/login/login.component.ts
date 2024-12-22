import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email!: string;
  password!: string;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.router.navigate(['/']);
      }
    });
  }

  async onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }

    await this.authService.login(this.email, this.password);
    this.router.navigate(['/']);
  }

}
