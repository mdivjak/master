import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth'; // Import AngularFireAuth
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ FormsModule, RouterModule ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email!: string;
  password!: string;
  confirmPassword!: string;

  private auth = inject(Auth);

  constructor(private router: Router) {}

  onRegister() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    createUserWithEmailAndPassword(this.auth, this.email, this.password)
      .then((userCredential) => {
        // Registration successful
        this.router.navigate(['']); // Navigate to welcome page or any other page
      })
      .catch((error) => {
        // Handle registration errors
        alert(error.message);
      });
  }
}
