import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  loading = true;
  searchQuery = '';
  selectedRole = '';
  selectedStatus = '';
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;
  pageSize = 10;

  // Edit Modal
  showEditModal = false;
  editUser: any = null;
  editForm = { name: '', email: '', role: '', status: '' };
  editLoading = false;
  editError = '';

  // Delete Modal
  showDeleteModal = false;
  deleteTarget: any = null;
  deleteLoading = false;

  // Stats
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    suspendedUsers: 0,
    admins: 0,
    managers: 0,
    regularUsers: 0,
  };

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    private toastService: ToastService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
  }

  loadUsers(): void {
    this.loading = true;
    this.apiService
      .getUsers(this.currentPage, this.pageSize, this.searchQuery, this.selectedRole, this.selectedStatus)
      .subscribe({
        next: (data) => {
          this.users = data.users;
          this.totalPages = data.pages;
          this.totalUsers = data.total;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  loadStats(): void {
    this.apiService.getUserStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Edit
  openEditModal(user: any): void {
    this.editUser = user;
    this.editForm = {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };
    this.editError = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editUser = null;
  }

  saveEdit(): void {
    this.editLoading = true;
    this.editError = '';
    this.apiService.updateUser(this.editUser._id, this.editForm).subscribe({
      next: () => {
        this.editLoading = false;
        this.closeEditModal();
        this.loadUsers();
        this.loadStats();
        this.toastService.success(`User "${this.editForm.name}" updated successfully`);
        this.notificationService.add('User Updated', `User "${this.editForm.name}" was updated`, 'user_updated');
      },
      error: (err) => {
        this.editError = err.error?.message || 'Failed to update user';
        this.toastService.error(this.editError);
        this.editLoading = false;
      },
    });
  }

  // Delete
  openDeleteModal(user: any): void {
    this.deleteTarget = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    this.deleteLoading = true;
    const userName = this.deleteTarget.name;
    this.apiService.deleteUser(this.deleteTarget._id).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.closeDeleteModal();
        this.loadUsers();
        this.loadStats();
        this.toastService.success(`User "${userName}" deleted successfully`);
        this.notificationService.add('User Deleted', `User "${userName}" was removed from the platform`, 'user_deleted');
      },
      error: () => {
        this.deleteLoading = false;
        this.toastService.error('Failed to delete user');
      },
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: '#10b981',
      inactive: '#f59e0b',
      suspended: '#ef4444',
    };
    return colors[status] || '#6b7280';
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      admin: 'role-admin',
      manager: 'role-manager',
      user: 'role-user',
    };
    return classes[role] || 'role-user';
  }
}
