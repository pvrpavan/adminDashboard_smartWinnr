import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css',
})
export class UserDashboardComponent implements OnInit {
  loading = true;
  dashboardData: any = null;
  leaderboard: any[] = [];
  completingTask = '';
  showXpPopup = false;
  xpPopupAmount = 0;
  levelUpAnimation = false;

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    private toastService: ToastService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.apiService.getMyDashboard().subscribe({
      next: (data) => {
        this.dashboardData = data.user;
        this.leaderboard = data.leaderboard;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  completeTask(taskId: string): void {
    if (this.completingTask) return;
    this.completingTask = taskId;

    const oldLevel = this.dashboardData?.level || 1;

    this.apiService.completeTask(taskId).subscribe({
      next: (data) => {
        this.xpPopupAmount = data.xpEarned;
        this.showXpPopup = true;
        setTimeout(() => { this.showXpPopup = false; }, 2000);

        if (data.user.level > oldLevel) {
          this.levelUpAnimation = true;
          setTimeout(() => { this.levelUpAnimation = false; }, 3000);
          this.toastService.success(`Level Up! You are now level ${data.user.level}!`);
        }

        this.dashboardData = { ...this.dashboardData, ...data.user };
        this.completingTask = '';
        this.toastService.success(`Task completed! +${data.xpEarned} XP earned`);
        this.notificationService.add('Task Completed', `You earned ${data.xpEarned} XP for completing a task`, 'task_completed');
      },
      error: () => {
        this.completingTask = '';
        this.toastService.error('Failed to complete task. Please try again.');
      },
    });
  }

  getXpProgress(): number {
    if (!this.dashboardData) return 0;
    return (this.dashboardData.currentLevelXp / this.dashboardData.xpForNextLevel) * 100;
  }

  getIncompleteTasks(): any[] {
    if (!this.dashboardData?.tasks) return [];
    return this.dashboardData.tasks.filter((t: any) => !t.completed);
  }

  getCompletedTasks(): any[] {
    if (!this.dashboardData?.tasks) return [];
    return this.dashboardData.tasks.filter((t: any) => t.completed);
  }

  getUnlockedAchievements(): any[] {
    if (!this.dashboardData?.achievements) return [];
    return this.dashboardData.achievements.filter((a: any) => a.unlockedAt);
  }

  getLockedAchievements(): any[] {
    if (!this.dashboardData?.achievements) return [];
    return this.dashboardData.achievements.filter((a: any) => !a.unlockedAt);
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      onboarding: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
      daily: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
      weekly: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z',
      challenge: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z',
      milestone: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm7 14l7-7-1.41-1.41L12 14.17l-3.59-3.58L7 12l5 5z',
    };
    return icons[category] || icons['daily'];
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      onboarding: '#6366f1',
      daily: '#10b981',
      weekly: '#3b82f6',
      challenge: '#f59e0b',
      milestone: '#8b5cf6',
    };
    return colors[category] || '#6366f1';
  }

  getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
      common: '#94a3b8',
      rare: '#3b82f6',
      epic: '#8b5cf6',
      legendary: '#f59e0b',
    };
    return colors[rarity] || '#94a3b8';
  }

  getRarityGradient(rarity: string): string {
    const gradients: Record<string, string> = {
      common: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
      rare: 'linear-gradient(135deg, #dbeafe, #93c5fd)',
      epic: 'linear-gradient(135deg, #ede9fe, #c4b5fd)',
      legendary: 'linear-gradient(135deg, #fef3c7, #fcd34d)',
    };
    return gradients[rarity] || gradients['common'];
  }

  getAchievementIcon(icon: string): string {
    const icons: Record<string, string> = {
      rocket: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
      sword: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
      trophy: 'M6 9H4.5a2.5 2.5 0 010-5H6m12 5h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22h10c0-2-0.85-3.25-2.03-3.79A1.07 1.07 0 0114 17v-2.34',
      crown: 'M2 4l3 12h14l3-12-6 7-4-9-4 9-6-7z',
      fire: 'M12 23c-3.6 0-8-3.07-8-9.54C4 7.54 8.54 2 12.07 1c0 0 .86 3.11 3.27 5.43C17.7 8.85 20 10.76 20 13.46 20 19.93 15.6 23 12 23z',
      lightning: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
      star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      diamond: 'M12 2L2 7l10 15L22 7l-10-5z',
      zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
      gem: 'M12 2L2 7l10 15L22 7l-10-5z',
    };
    return icons[icon] || icons['star'];
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
