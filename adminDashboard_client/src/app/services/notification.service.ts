import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'task_assigned' | 'user_updated' | 'user_deleted' | 'task_created' | 'task_completed' | 'settings_updated' | 'general';
  timestamp: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private nextId = 0;

  notifications$ = this.notificationsSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('admin_notifications');
    if (stored) {
      try {
        this.notifications = JSON.parse(stored).map((n: Notification) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        this.nextId = this.notifications.length > 0
          ? Math.max(...this.notifications.map((n) => n.id)) + 1
          : 0;
        this.notificationsSubject.next(this.notifications);
      } catch {
        this.notifications = [];
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('admin_notifications', JSON.stringify(this.notifications));
  }

  add(title: string, message: string, type: Notification['type'] = 'general'): void {
    const notification: Notification = {
      id: this.nextId++,
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
    };
    this.notifications = [notification, ...this.notifications].slice(0, 50);
    this.notificationsSubject.next(this.notifications);
    this.saveToStorage();
  }

  markAsRead(id: number): void {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(this.notifications);
    this.saveToStorage();
  }

  markAllAsRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.notificationsSubject.next(this.notifications);
    this.saveToStorage();
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  clear(): void {
    this.notifications = [];
    this.notificationsSubject.next(this.notifications);
    this.saveToStorage();
  }

  remove(id: number): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notificationsSubject.next(this.notifications);
    this.saveToStorage();
  }
}
