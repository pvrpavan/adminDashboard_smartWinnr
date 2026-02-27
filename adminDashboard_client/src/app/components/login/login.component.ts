import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  isRegister = false;
  name = '';

  constructor(private authService: AuthService, private router: Router, private toastService: ToastService) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    this.error = '';
    this.loading = true;

    if (this.isRegister) {
      if (!this.name || !this.email || !this.password) {
        this.error = 'All fields are required';
        this.loading = false;
        return;
      }
      this.authService.register(this.name, this.email, this.password).subscribe({
        next: () => {
          this.toastService.success('Account created successfully! Welcome aboard.');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Registration failed';
          this.toastService.error(this.error);
          this.loading = false;
        },
      });
    } else {
      if (!this.email || !this.password) {
        this.error = 'Email and password are required';
        this.loading = false;
        return;
      }
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          this.toastService.success('Login successful! Welcome back.');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Login failed';
          this.toastService.error(this.error);
          this.loading = false;
        },
      });
    }
  }

  toggleMode(): void {
    this.isRegister = !this.isRegister;
    this.error = '';
  }
}
