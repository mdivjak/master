import { Component } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification';
import { NgClass, NgFor, NgIf } from '@angular/common';

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
  user: any;
  unreadNotficationsMarker: boolean = false;

  constructor(
    private notificationService: NotificationService) {}

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  async markAsRead(notification: Notification) {
    const index = this.notifications.findIndex(n => n.timestamp === notification.timestamp);
    await this.notificationService.markAsRead(this.user!.uid, index);
    notification.read = true;
    this.unreadNotficationsMarker = this.notifications.some(
      notification => !notification.read
    );
  }
}
