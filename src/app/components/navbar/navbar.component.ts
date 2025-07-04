import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationWidgetComponent } from '../notification-widget/notification-widget.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule, NotificationWidgetComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  user$: Observable<User | null>;
  mobileMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router) {

    this.user$ = this.authService.user$;

    // this.userData$.subscribe(userData => {
    //   if (userData && userData.notifications) {
    //     this.notifications = userData.notifications;
    //     this.unreadNotficationsMarker = this.notifications.some(
    //       notification => !notification.read
    //     );
    //   }
    // });
  }

  ngOnInit(): void {}

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }

  goToProfile() {
    if (this.authService.currentUserData) {
      if( this.authService.currentUserData.type === 'hiker') {
        this.router.navigate(['/profile-hiker']);
      } else if (this.authService.currentUserData.type === 'hikingClub') {
        this.router.navigate(['/profile-club']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }
  
}
