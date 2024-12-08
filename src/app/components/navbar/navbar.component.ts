import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from 'firebase/auth';
import { Observable, take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { UserData, Notification } from '../../models/userdata';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  user$: Observable<User | null>;
  user: User | null = null;
  userType$: Observable<string | null>;
  userData$: Observable<UserData | null>;
  notifications: Notification[] = [];
  showNotifications: boolean = false;
  unreadNotficationsMarker: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService) {
    this.user$ = this.authService.user$;
    this.user$.subscribe(user => {
      if (user) {
        this.user = user;
      }
    });

    this.userType$ = this.authService.userType$;

    this.userData$ = this.authService.userData$;
    this.userData$.subscribe(userData => {
      if (userData && userData.notifications) {
        this.notifications = userData.notifications;
        this.unreadNotficationsMarker = this.notifications.some(
          notification => !notification.read
        );
      }
    });
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

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  async markAsRead(notification: Notification) {
    const index = this.notifications.findIndex(n => n.date === notification.date);
    await this.notificationService.markAsRead(this.user!.uid, index);
    notification.read = true;
    this.unreadNotficationsMarker = this.notifications.some(
      notification => !notification.read
    );
  }
}
