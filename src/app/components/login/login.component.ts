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

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }

    let userCredential = await this.authService.login(this.email, this.password);
    localStorage.setItem('userCredential', JSON.stringify(userCredential));
    this.router.navigate(['/']);
  }

}
