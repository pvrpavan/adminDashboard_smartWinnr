import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // Dashboard Stats
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/dashboard`);
  }

  // Analytics
  getAnalyticsData(days: number = 30): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/data`, {
      params: new HttpParams().set('days', days.toString()),
    });
  }

  // Sales
  getSalesData(days: number = 30): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/sales`, {
      params: new HttpParams().set('days', days.toString()),
    });
  }

  // Revenue
  getRevenueData(months: number = 12): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/revenue`, {
      params: new HttpParams().set('months', months.toString()),
    });
  }

  // Users
  getUsers(page: number = 1, limit: number = 10, search: string = '', role: string = '', status: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    if (status) params = params.set('status', status);
    return this.http.get(`${this.apiUrl}/users`, { params });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, data);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  getUserStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/stats`);
  }

  // Gamification
  getMyDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/me/dashboard`);
  }

  completeTask(taskId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/me/tasks/${taskId}/complete`, {});
  }

  // Task Management (Admin)
  getTaskTemplates(page: number = 1, limit: number = 20, category: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (category) params = params.set('category', category);
    return this.http.get(`${this.apiUrl}/tasks`, { params });
  }

  createTaskTemplate(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks`, data);
  }

  updateTaskTemplate(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/tasks/${id}`, data);
  }

  deleteTaskTemplate(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tasks/${id}`);
  }

  assignTask(taskId: string, userId?: string): Observable<any> {
    const body: any = { taskId };
    if (userId) body.userId = userId;
    return this.http.post(`${this.apiUrl}/tasks/assign`, body);
  }

  getTaskStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/stats`);
  }
}
