import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  user: User | null = null;
  activeTab = 'profile';

  profileForm = {
    name: '',
    email: '',
  };

  notificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: true,
    securityAlerts: true,
    marketingEmails: false,
  };

  appearanceSettings = {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
  };

  saveSuccess = false;

  constructor(private authService: AuthService, private toastService: ToastService, private notificationService: NotificationService) {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.profileForm.name = user.name;
        this.profileForm.email = user.email;
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.saveSuccess = false;
  }

  saveProfile(): void {
    this.saveSuccess = true;
    this.toastService.success('Profile settings saved successfully');
    this.notificationService.add('Settings Updated', 'Profile settings were updated', 'settings_updated');
    setTimeout(() => {
      this.saveSuccess = false;
    }, 3000);
  }

  saveNotifications(): void {
    this.saveSuccess = true;
    this.toastService.success('Notification preferences saved successfully');
    this.notificationService.add('Settings Updated', 'Notification preferences were updated', 'settings_updated');
    setTimeout(() => {
      this.saveSuccess = false;
    }, 3000);
  }

  saveAppearance(): void {
    this.saveSuccess = true;
    this.toastService.success('Appearance settings saved successfully');
    this.notificationService.add('Settings Updated', 'Appearance settings were updated', 'settings_updated');
    setTimeout(() => {
      this.saveSuccess = false;
    }, 3000);
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
}
