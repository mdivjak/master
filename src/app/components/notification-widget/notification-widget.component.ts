import { Component } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notification-widget',
  standalone: true,
  imports: [CommonModule],
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

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  async markAllAsRead(): Promise<void> {
    const unreadNotifications = this.notifications.filter(n => !n.read);
    for (const notification of unreadNotifications) {
      if (notification.id) {
        await this.notificationService.markAsRead(this.authService.currentUser!.uid, notification.id);
        notification.read = true;
      }
    }
    this.unreadNotficationsMarker = false;
  }

  async clearAllNotifications(): Promise<void> {
    // Implementation depends on your notification service
    // For now, just clear locally
    this.notifications = [];
    this.unreadNotficationsMarker = false;
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id || index.toString();
  }

  getNotificationType(notification: Notification): string {
    // Determine notification type based on message content or add a type property to Notification model
    const message = notification.message.toLowerCase();
    if (message.includes('accepted') || message.includes('approved')) {
      return 'success';
    } else if (message.includes('declined') || message.includes('rejected') || message.includes('cancelled')) {
      return 'warning';
    } else if (message.includes('application') || message.includes('request')) {
      return 'info';
    }
    return 'default';
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  }
}
