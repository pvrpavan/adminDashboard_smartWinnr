import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ApiService } from '../../services/api.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    totalSales: 0,
    totalRevenue: 0,
    newSignups: 0,
    pendingOrders: 0,
  };
  loading = true;

  // Revenue Line Chart
  revenueChartData: any = { labels: [], datasets: [] };
  revenueChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart',
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        padding: 16,
        cornerRadius: 14,
        displayColors: false,
        titleFont: { size: 14, weight: '700', family: 'Inter, sans-serif' },
        bodyFont: { size: 13, family: 'Inter, sans-serif' },
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        callbacks: {
          label: (ctx: any) => `Revenue: $${ctx.parsed.y?.toLocaleString() || 0}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(99, 102, 241, 0.05)', drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 11, weight: '500' }, padding: 12, callback: (value: number) => '$' + value.toLocaleString() },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11, weight: '500' }, padding: 8 },
        border: { display: false },
      },
    },
  };

  // Sales By Category Doughnut Chart
  categoryChartData: any = { labels: [], datasets: [] };
  categoryChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1400,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 24,
          usePointStyle: true,
          pointStyle: 'rectRounded',
          pointStyleWidth: 12,
          font: { size: 12, weight: '600', family: 'Inter, sans-serif' },
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        padding: 16,
        cornerRadius: 14,
        titleFont: { size: 14, weight: '700', family: 'Inter, sans-serif' },
        bodyFont: { size: 13, family: 'Inter, sans-serif' },
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: $${ctx.parsed?.toLocaleString() || 0}`,
        },
      },
    },
    cutout: '72%',
    radius: '90%',
  };

  // Recent Sales
  recentSales: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.apiService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });

    this.apiService.getAnalyticsData(14).subscribe({
      next: (data) => {
        const labels = data.map((d: any) => {
          const date = new Date(d.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        this.revenueChartData = {
          labels,
          datasets: [
            {
              label: 'Revenue',
              data: data.map((d: any) => d.revenue),
              borderColor: (context: any) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return '#6366f1';
                const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
                gradient.addColorStop(0, '#6366f1');
                gradient.addColorStop(0.5, '#8b5cf6');
                gradient.addColorStop(1, '#a78bfa');
                return gradient;
              },
              backgroundColor: (context: any) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return 'rgba(99, 102, 241, 0.1)';
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
                gradient.addColorStop(0.3, 'rgba(139, 92, 246, 0.15)');
                gradient.addColorStop(0.7, 'rgba(167, 139, 250, 0.05)');
                gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
                return gradient;
              },
              fill: true,
              tension: 0.45,
              borderWidth: 3.5,
              pointBackgroundColor: '#ffffff',
              pointBorderColor: '#6366f1',
              pointBorderWidth: 2.5,
              pointRadius: 0,
              pointHoverRadius: 8,
              pointHoverBackgroundColor: '#6366f1',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 3,
            },
          ],
        };
      },
    });

    this.apiService.getSalesData(30).subscribe({
      next: (data) => {
        const colors = [
          'rgba(99, 102, 241, 0.85)',
          'rgba(139, 92, 246, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(239, 68, 68, 0.85)',
          'rgba(236, 72, 153, 0.85)',
        ];
        const hoverColors = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];
        this.categoryChartData = {
          labels: data.salesByCategory.map((c: any) => c._id),
          datasets: [
            {
              data: data.salesByCategory.map((c: any) => c.totalAmount),
              backgroundColor: colors,
              hoverBackgroundColor: hoverColors,
              borderWidth: 3,
              borderColor: '#ffffff',
              hoverBorderColor: '#ffffff',
              hoverOffset: 12,
              spacing: 2,
            },
          ],
        };
        this.recentSales = data.recentSales.slice(0, 5);
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      completed: '#10b981',
      pending: '#f59e0b',
      refunded: '#ef4444',
      cancelled: '#6b7280',
    };
    return colors[status] || '#6b7280';
  }
}
