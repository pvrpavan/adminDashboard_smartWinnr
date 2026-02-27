import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: User | null = null;
  showDropdown = false;
  showNotifications = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    public authService: AuthService,
    public notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.authService.currentUser$.subscribe((user) => {
        this.user = user;
      }),
      this.notificationService.notifications$.subscribe((notifications) => {
        this.notifications = notifications;
        this.unreadCount = this.notificationService.getUnreadCount();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-area') && !target.closest('.notification-panel')) {
      this.showNotifications = false;
    }
    if (!target.closest('.user-menu') && !target.closest('.dropdown')) {
      this.showDropdown = false;
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    this.showNotifications = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showDropdown = false;
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead();
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id);
  }

  removeNotification(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationService.remove(id);
  }

  clearAll(): void {
    this.notificationService.clear();
  }

  logout(): void {
    this.authService.logout();
  }

  getInitials(): string {
    if (!this.user?.name) return 'A';
    return this.user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'task_assigned': return 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2';
      case 'task_created': return 'M9 11l3 3L22 4';
      case 'task_completed': return 'M22 11.08V12a10 10 0 1 1-5.93-9.14';
      case 'user_updated': return 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7';
      case 'user_deleted': return 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2';
      case 'settings_updated': return 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z';
      default: return 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9';
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
}
