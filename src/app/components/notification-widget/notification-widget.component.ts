import { Component } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notification-widget',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './notification-widget.component.html',
  styleUrl: './notification-widget.component.css'
})
export class NotificationWidgetComponent {
  showNotifications: boolean = false;
  notifications: Notification[] = [];
  unreadNotficationsMarker: boolean = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService) {}

  async ngOnInit() {
    // The cast to unknown as Notification[] might be hiding potential type issues.
    // It's better to ensure NotificationService.getUserNotifications returns Notification[] directly
    // or to map the result explicitly if the shapes differ.
    // For now, assuming the service returns the correct shape including 'id'.
    this.notifications = await this.notificationService.getUserNotifications(this.authService.currentUser!.uid);
    this.unreadNotficationsMarker = this.notifications.some(n => !n.read);
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  async markAsRead(notification: Notification) {
    if (!notification.id) {
      console.error('Notification ID is missing, cannot mark as read.');
      return;
    }
    await this.notificationService.markAsRead(this.authService.currentUser!.uid, notification.id);
    // Optimistically update the UI
    const foundNotification = this.notifications.find(n => n.id === notification.id);
    if (foundNotification) {
      foundNotification.read = true;
    }
    this.unreadNotficationsMarker = this.notifications.some(
      n => !n.read
    );
  }
}
