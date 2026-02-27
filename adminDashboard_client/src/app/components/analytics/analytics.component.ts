import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ApiService } from '../../services/api.service';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
})
export class AnalyticsComponent implements OnInit {
  selectedPeriod = 30;
  loading = true;

  // User Activity Line Chart
  userActivityData: any = { labels: [], datasets: [] };
  userActivityOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart',
    },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 24,
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
        boxPadding: 6,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(99, 102, 241, 0.04)', drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 11, weight: '500' }, padding: 12 },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', maxRotation: 45, font: { size: 10, weight: '500' }, padding: 8 },
        border: { display: false },
      },
    },
  };

  // Page Views Bar Chart
  pageViewsData: any = { labels: [], datasets: [] };
  pageViewsOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
      delay: (context: any) => context.dataIndex * 40,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        padding: 16,
        cornerRadius: 14,
        titleFont: { size: 14, weight: '700', family: 'Inter, sans-serif' },
        bodyFont: { size: 13, family: 'Inter, sans-serif' },
        callbacks: {
          label: (ctx: any) => ` Views: ${ctx.parsed.y?.toLocaleString() || 0}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(99, 102, 241, 0.04)', drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 11, weight: '500' }, padding: 12 },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', maxRotation: 45, font: { size: 10, weight: '500' }, padding: 8 },
        border: { display: false },
      },
    },
  };

  // Sales by Status Pie Chart
  salesStatusData: any = { labels: [], datasets: [] };
  salesStatusOptions: any = {
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
      },
    },
    cutout: '55%',
    radius: '90%',
  };

  // Revenue Bar Chart
  revenueBarData: any = { labels: [], datasets: [] };
  revenueBarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
      delay: (context: any) => context.dataIndex * 80,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        padding: 16,
        cornerRadius: 14,
        titleFont: { size: 14, weight: '700', family: 'Inter, sans-serif' },
        bodyFont: { size: 13, family: 'Inter, sans-serif' },
        callbacks: {
          label: (ctx: any) => ` Revenue: $${ctx.parsed.y?.toLocaleString() || 0}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(99, 102, 241, 0.04)', drawBorder: false },
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

  // Metrics
  metrics = {
    avgBounceRate: 0,
    avgSessionDuration: 0,
    avgConversionRate: 0,
    totalPageViews: 0,
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;

    this.apiService.getAnalyticsData(this.selectedPeriod).subscribe({
      next: (data) => {
        this.processAnalyticsData(data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });

    this.apiService.getSalesData(this.selectedPeriod).subscribe({
      next: (data) => {
        this.processSalesData(data);
      },
    });

    this.apiService.getRevenueData(12).subscribe({
      next: (data) => {
        this.processRevenueData(data);
      },
    });
  }

  processAnalyticsData(data: any[]): void {
    const labels = data.map((d) => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    this.userActivityData = {
      labels,
      datasets: [
        {
          label: 'Active Users',
          data: data.map((d) => d.activeUsers),
          borderColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return '#6366f1';
            const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(1, '#818cf8');
            return gradient;
          },
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'rgba(99, 102, 241, 0.1)';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
            gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.08)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
            return gradient;
          },
          fill: true,
          tension: 0.45,
          borderWidth: 3,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#6366f1',
          pointBorderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#6366f1',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
        },
        {
          label: 'New Signups',
          data: data.map((d) => d.newSignups),
          borderColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return '#10b981';
            const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
            gradient.addColorStop(0, '#10b981');
            gradient.addColorStop(1, '#34d399');
            return gradient;
          },
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'rgba(16, 185, 129, 0.1)';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
            gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.06)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
            return gradient;
          },
          fill: true,
          tension: 0.45,
          borderWidth: 3,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#10b981',
          pointBorderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#10b981',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
        },
      ],
    };

    this.pageViewsData = {
      labels,
      datasets: [
        {
          label: 'Page Views',
          data: data.map((d) => d.pageViews),
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'rgba(99, 102, 241, 0.8)';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.95)');
            gradient.addColorStop(0.5, 'rgba(124, 97, 246, 0.85)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0.75)');
            return gradient;
          },
          hoverBackgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return '#6366f1';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(1, '#8b5cf6');
            return gradient;
          },
          borderRadius: 10,
          borderSkipped: false,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
        },
      ],
    };

    // Calculate metrics
    const totalBounce = data.reduce((sum, d) => sum + d.bounceRate, 0);
    const totalSession = data.reduce((sum, d) => sum + d.avgSessionDuration, 0);
    const totalConversion = data.reduce((sum, d) => sum + d.conversionRate, 0);
    const totalPages = data.reduce((sum, d) => sum + d.pageViews, 0);

    this.metrics = {
      avgBounceRate: parseFloat((totalBounce / data.length).toFixed(1)),
      avgSessionDuration: Math.round(totalSession / data.length),
      avgConversionRate: parseFloat((totalConversion / data.length).toFixed(2)),
      totalPageViews: totalPages,
    };
  }

  processSalesData(data: any): void {
    const statusColors: Record<string, string> = {
      completed: '#10b981',
      pending: '#f59e0b',
      refunded: '#ef4444',
      cancelled: '#6b7280',
    };

    const hoverStatusColors: Record<string, string> = {
      completed: '#059669',
      pending: '#d97706',
      refunded: '#dc2626',
      cancelled: '#4b5563',
    };

    this.salesStatusData = {
      labels: data.salesByStatus.map((s: any) => s._id),
      datasets: [
        {
          data: data.salesByStatus.map((s: any) => s.count),
          backgroundColor: data.salesByStatus.map((s: any) => statusColors[s._id] || '#6b7280'),
          hoverBackgroundColor: data.salesByStatus.map((s: any) => hoverStatusColors[s._id] || '#4b5563'),
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverBorderColor: '#ffffff',
          hoverOffset: 12,
          spacing: 2,
        },
      ],
    };
  }

  processRevenueData(data: any[]): void {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    this.revenueBarData = {
      labels: data.map((d) => `${monthNames[d._id.month - 1]} ${d._id.year}`),
      datasets: [
        {
          label: 'Revenue',
          data: data.map((d) => d.totalRevenue),
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'rgba(99, 102, 241, 0.8)';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.95)');
            gradient.addColorStop(0.5, 'rgba(124, 97, 246, 0.85)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0.7)');
            return gradient;
          },
          hoverBackgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return '#6366f1';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(1, '#8b5cf6');
            return gradient;
          },
          borderRadius: 12,
          borderSkipped: false,
          barPercentage: 0.65,
          categoryPercentage: 0.8,
        },
      ],
    };
  }

  onPeriodChange(): void {
    this.loadAnalytics();
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }
}
