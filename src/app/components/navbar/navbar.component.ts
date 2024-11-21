import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from 'firebase/auth';
import { Observable, take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  user$: Observable<User | null>;
  userType$: Observable<string | null>;

  constructor(private authService: AuthService, private router: Router) {
    this.user$ = this.authService.user$;
    this.userType$ = this.authService.userType$;
  }

  ngOnInit(): void {}

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }

  goToProfile() {
    this.userType$.pipe(take(1)).subscribe(userType => {
      if (userType === 'hiker') {
        this.router.navigate(['/profile-hiker']);
      } else if (userType === 'hikingClub') {
        this.router.navigate(['/profile-club']);
      }
    });
  }
}
