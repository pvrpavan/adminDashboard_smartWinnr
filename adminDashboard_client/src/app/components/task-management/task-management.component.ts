import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-management.component.html',
  styleUrl: './task-management.component.css',
})
export class TaskManagementComponent implements OnInit {
  tasks: any[] = [];
  users: any[] = [];
  loading = true;
  currentPage = 1;
  totalPages = 1;
  totalTasks = 0;
  selectedCategory = '';

  // Stats
  stats = {
    totalTasks: 0,
    activeTasks: 0,
    inactiveTasks: 0,
    tasksByCategory: [] as any[],
  };

  // Create/Edit Modal
  showModal = false;
  isEditing = false;
  modalLoading = false;
  modalError = '';
  taskForm = {
    title: '',
    description: '',
    xpReward: 10,
    category: 'daily',
    difficulty: 'easy',
    assignedTo: 'all',
  };
  editTaskId = '';

  // Delete Modal
  showDeleteModal = false;
  deleteTarget: any = null;
  deleteLoading = false;

  // Assign Modal
  showAssignModal = false;
  assignTaskId = '';
  assignTaskTitle = '';
  assignUserId = '';
  assignLoading = false;
  assignMessage = '';

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadStats();
    this.loadUsers();
  }

  loadTasks(): void {
    this.loading = true;
    this.apiService.getTaskTemplates(this.currentPage, 20, this.selectedCategory).subscribe({
      next: (data) => {
        this.tasks = data.tasks;
        this.totalPages = data.pages;
        this.totalTasks = data.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadStats(): void {
    this.apiService.getTaskStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
    });
  }

  loadUsers(): void {
    this.apiService.getUsers(1, 100).subscribe({
      next: (data) => {
        this.users = data.users;
      },
    });
  }

  onCategoryFilter(): void {
    this.currentPage = 1;
    this.loadTasks();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTasks();
    }
  }

  // Create
  openCreateModal(): void {
    this.isEditing = false;
    this.taskForm = {
      title: '',
      description: '',
      xpReward: 10,
      category: 'daily',
      difficulty: 'easy',
      assignedTo: 'all',
    };
    this.modalError = '';
    this.showModal = true;
  }

  // Edit
  openEditModal(task: any): void {
    this.isEditing = true;
    this.editTaskId = task._id;
    this.taskForm = {
      title: task.title,
      description: task.description,
      xpReward: task.xpReward,
      category: task.category,
      difficulty: task.difficulty,
      assignedTo: task.assignedTo,
    };
    this.modalError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveTask(): void {
    if (!this.taskForm.title.trim()) {
      this.modalError = 'Task title is required';
      return;
    }
    this.modalLoading = true;
    this.modalError = '';

    const obs = this.isEditing
      ? this.apiService.updateTaskTemplate(this.editTaskId, this.taskForm)
      : this.apiService.createTaskTemplate(this.taskForm);

    obs.subscribe({
      next: () => {
        this.modalLoading = false;
        this.closeModal();
        this.loadTasks();
        this.loadStats();
        if (this.isEditing) {
          this.toastService.success(`Task "${this.taskForm.title}" updated successfully`);
        } else {
          this.toastService.success(`Task "${this.taskForm.title}" created successfully`);
          this.notificationService.add('Task Created', `New task "${this.taskForm.title}" has been created`, 'task_created');
        }
      },
      error: (err) => {
        this.modalError = err.error?.message || 'Failed to save task';
        this.toastService.error(this.modalError);
        this.modalLoading = false;
      },
    });
  }

  // Delete
  openDeleteModal(task: any): void {
    this.deleteTarget = task;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    this.deleteLoading = true;
    const taskTitle = this.deleteTarget.title;
    this.apiService.deleteTaskTemplate(this.deleteTarget._id).subscribe({
      next: () => {
        this.deleteLoading = false;
        this.closeDeleteModal();
        this.loadTasks();
        this.loadStats();
        this.toastService.success(`Task "${taskTitle}" deleted successfully`);
      },
      error: () => {
        this.deleteLoading = false;
        this.toastService.error('Failed to delete task');
      },
    });
  }

  // Toggle active
  toggleActive(task: any): void {
    const newStatus = !task.isActive;
    this.apiService.updateTaskTemplate(task._id, { isActive: newStatus }).subscribe({
      next: () => {
        this.loadTasks();
        this.loadStats();
        this.toastService.info(`Task "${task.title}" ${newStatus ? 'activated' : 'deactivated'}`);
      },
    });
  }

  // Assign
  openAssignModal(task: any): void {
    this.assignTaskId = task._id;
    this.assignTaskTitle = task.title;
    this.assignUserId = '';
    this.assignMessage = '';
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
  }

  assignTask(): void {
    this.assignLoading = true;
    this.assignMessage = '';
    this.apiService.assignTask(this.assignTaskId, this.assignUserId || undefined).subscribe({
      next: (data) => {
        this.assignMessage = data.message;
        this.assignLoading = false;
        this.toastService.success(`Task "${this.assignTaskTitle}" assigned successfully`);
        this.notificationService.add('Task Assigned', `Task "${this.assignTaskTitle}" has been assigned to users`, 'task_assigned');
      },
      error: (err) => {
        this.assignMessage = err.error?.message || 'Failed to assign task';
        this.toastService.error(this.assignMessage);
        this.assignLoading = false;
      },
    });
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

  getDifficultyColor(difficulty: string): string {
    const colors: Record<string, string> = {
      easy: '#10b981',
      medium: '#f59e0b',
      hard: '#ef4444',
      expert: '#8b5cf6',
    };
    return colors[difficulty] || '#10b981';
  }

  getCategoryCount(category: string): number {
    const found = this.stats.tasksByCategory?.find((c: any) => c._id === category);
    return found ? found.count : 0;
  }
}
