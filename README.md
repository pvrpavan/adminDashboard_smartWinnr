# Admin Dashboard with Analytics & Reporting (MEAN Stack)

A full-featured admin dashboard built with the **MEAN Stack** (MongoDB, Express.js, Angular, Node.js) featuring real-time analytics, data visualization, user management, gamification, and secure authentication with role-based authorization.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Version Details](#version-details)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [Demo Credentials](#demo-credentials)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Key Features Breakdown](#key-features-breakdown)
- [Troubleshooting](#troubleshooting)

---

## Features

- Dashboard with key metrics and charts
- Analytics and reports with configurable timeframes
- User management with search, filters, and roles
- Task management with templates and categories
- Gamification: XP, levels, achievements, leaderboard
- User dashboard for tracking progress
- Settings for profile, notifications, and theme
- JWT authentication with role-based access
- Toast notifications for actions
- Notification bell with live updates
- Responsive design for all devices
- Clean, attractive Chart.js visuals

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Angular 19.2.0, TypeScript 5.7.2   |
| Charts     | Chart.js 4.5.1, ng2-charts 6.0.1   |
| Styling    | Tailwind CSS 4.2.1, Custom CSS     |
| Backend    | Node.js, Express.js 4.21.0         |
| Database   | MongoDB with Mongoose 8.6.0        |
| Auth       | JWT (jsonwebtoken 9.0.2), bcryptjs 2.4.3 |
| Validation | express-validator 7.2.0            |

---

## Version Details

### Backend Dependencies
| Package            | Version  |
|--------------------|----------|
| express            | ^4.21.0  |
| mongoose           | ^8.6.0   |
| jsonwebtoken       | ^9.0.2   |
| bcryptjs           | ^2.4.3   |
| cors               | ^2.8.5   |
| dotenv             | ^16.4.5  |
| express-validator  | ^7.2.0   |
| nodemon (dev)      | ^3.1.4   |

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:

| Software   | Minimum Version | Recommended Version | Download Link                        |
|------------|----------------|---------------------|--------------------------------------|
| Node.js    | 18.x           | 20.x or later      | https://nodejs.org/                  |
| npm        | 9.x            | 10.x or later      | Comes with Node.js                   |
| MongoDB    | 7.0+           | 8.0+               | https://www.mongodb.com/try/download |
| Angular CLI| 19.x           | 19.2.x              | `npm install -g @angular/cli`        |
| Git        | 2.x            | Latest              | https://git-scm.com/                 |

### Clone the Repository

```bash
git clone https://github.com/pvrpavan/adminDashboard_smartWinnr.git
cd adminDashboard_smartWinnr
```

### Backend Setup

1. **Navigate to the server directory:**
   ```bash
   cd adminDashboard_server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the `adminDashboard_server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/adminDashboard
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. **Ensure MongoDB is running:**
   ```bash
   # On macOS (with Homebrew)
   brew services start mongodb-community

   # On Ubuntu/Debian
   sudo systemctl start mongod

   # On Windows
   net start MongoDB
   ```

5. **Seed the database with sample data:**
   ```bash
   node seed.js
   ```
   This will create sample users, analytics data, sales records, and task templates.

6. **Start the backend server:**
   ```bash
   # Production mode
   npm start

   # Development mode (with auto-reload)
   npm run dev
   ```
   The server will start on **http://localhost:5000**

### Frontend Setup

1. **Navigate to the client directory:**
   ```bash
   cd adminDashboard_client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   ng serve
   # or
   npm start
   ```
   The app will be available at **http://localhost:4200**

4. **Build for production:**
   ```bash
   ng build
   # or
   npm run build
   ```
   Production files will be generated in the `dist/` directory.

### Environment Variables

| Variable      | Description                          | Default                                      |
|---------------|--------------------------------------|----------------------------------------------|
| `PORT`        | Backend server port                  | `5000`                                       |
| `MONGODB_URI` | MongoDB connection string            | `mongodb://localhost:27017/adminDashboard`    |
| `JWT_SECRET`  | Secret key for JWT token signing     | `your_jwt_secret_key`                        |

---

## Demo Credentials

After running `node seed.js`, you can log in with:

| Role    | Email             | Password  |
|---------|-------------------|-----------|
| Admin   | admin@admin.com   | admin123  |

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint             | Description              | Auth Required |
|--------|----------------------|--------------------------|---------------|
| POST   | `/api/auth/login`    | Login with credentials   | No            |
| POST   | `/api/auth/register` | Register new user        | No            |
| GET    | `/api/auth/me`       | Get current user profile | Yes           |

### User Management Endpoints (Admin/Manager)

| Method | Endpoint          | Description                              | Auth Required  |
|--------|-------------------|------------------------------------------|----------------|
| GET    | `/api/users`      | List users (pagination, search, filters) | Admin/Manager  |
| GET    | `/api/users/stats`| Get user statistics                      | Admin/Manager  |
| PUT    | `/api/users/:id`  | Update user details                      | Admin only     |
| DELETE | `/api/users/:id`  | Delete a user                            | Admin only     |

### Analytics Endpoints (Admin/Manager)

| Method | Endpoint                   | Description                        | Auth Required  |
|--------|----------------------------|------------------------------------|----------------|
| GET    | `/api/analytics/dashboard` | Dashboard stats (totals, metrics)  | Admin/Manager  |
| GET    | `/api/analytics/data`      | Analytics time series data         | Admin/Manager  |
| GET    | `/api/analytics/sales`     | Sales breakdown by category/status | Admin/Manager  |
| GET    | `/api/analytics/revenue`   | Monthly revenue data               | Admin/Manager  |

### Task Management Endpoints

| Method | Endpoint                    | Description                  | Auth Required  |
|--------|-----------------------------|------------------------------|----------------|
| GET    | `/api/tasks/templates`      | List task templates          | Admin/Manager  |
| POST   | `/api/tasks/templates`      | Create a task template       | Admin/Manager  |
| PUT    | `/api/tasks/templates/:id`  | Update a task template       | Admin/Manager  |
| DELETE | `/api/tasks/templates/:id`  | Delete a task template       | Admin/Manager  |
| GET    | `/api/tasks/stats`          | Get task statistics          | Admin/Manager  |
| POST   | `/api/tasks/assign`         | Assign a task to user(s)     | Admin/Manager  |

### User Dashboard Endpoints

| Method | Endpoint                    | Description                  | Auth Required |
|--------|-----------------------------|------------------------------|---------------|
| GET    | `/api/tasks/my-dashboard`   | Get user's personal dashboard| Yes           |
| POST   | `/api/tasks/complete/:id`   | Complete a task              | Yes           |

---

## Project Structure

```
adminDashboard_smartWinnr/
|
+-- adminDashboard_client/          # Angular Frontend
|   +-- src/
|       +-- app/
|           +-- components/
|           |   +-- dashboard/      # Main dashboard with charts
|           |   +-- analytics/      # Analytics & reporting page
|           |   +-- users/          # User management (CRUD)
|           |   +-- task-management/# Task template management
|           |   +-- user-dashboard/ # User gamification dashboard
|           |   +-- settings/       # Settings page
|           |   +-- login/          # Authentication page
|           |   +-- navbar/         # Navigation bar with notifications
|           |   +-- sidebar/        # Sidebar navigation
|           |   +-- toast/          # Toast notification component
|           +-- services/
|           |   +-- api.service.ts          # API communication
|           |   +-- auth.service.ts         # Authentication & JWT
|           |   +-- toast.service.ts        # Toast notification service
|           |   +-- notification.service.ts # Bell notification service
|           +-- guards/
|               +-- auth.guard.ts           # Route protection
|
+-- adminDashboard_server/          # Node.js Backend
    +-- models/                     # Mongoose schemas
    +-- routes/                     # Express route handlers
    +-- middleware/                  # Auth middleware
    +-- seed.js                     # Database seeder
    +-- server.js                   # Express app entry point
```

---

## Key Features Breakdown

### Responsive Design
- Fully responsive layout using CSS Grid, Flexbox, and Tailwind CSS
- Mobile-first approach with breakpoints at 768px and 1024px
- Collapsible sidebar on mobile devices
- Touch-friendly interactive elements

### Authentication & Authorization
- JWT-based authentication with secure token storage
- Role-based access control with three roles:
  - **Admin**: Full access to all features (user CRUD, task management, analytics)
  - **Manager**: Read access to analytics, user listing, and task management
  - **User**: Access to personal dashboard, task completion, and settings
- Protected routes with Angular route guards
- Automatic token refresh and session management

### Data Visualization
- **Revenue Line Chart**: Gradient-filled area chart with smooth curve interpolation and animated rendering
- **Sales by Category**: Doughnut chart with interactive hover effects and spacing
- **User Activity**: Dual-line chart tracking active users and new signups with gradient fills
- **Page Views**: Bar chart with gradient fills, rounded corners, and staggered animations
- **Sales by Status**: Pie chart with hover offset effects and clean legends
- **Monthly Revenue**: Bar chart with gradient backgrounds and responsive tooltips

### Toast Notifications
- Non-intrusive toast notifications for all major actions
- Four types: success (green), error (red), warning (amber), info (blue)
- Auto-dismiss with configurable duration
- Slide-in animation with click-to-dismiss support

### Notification System
- Bell icon in navbar with real-time unread count badge
- Dropdown panel showing notification history
- Notification types: task assignments, user updates, task creation/completion, settings changes
- Mark as read, mark all as read, and clear all functionality
- Persistent storage using localStorage

### Gamification
- XP-based progression system with levels
- Task categories: onboarding, daily, weekly, challenge, milestone
- Achievement system with rarity tiers (common, rare, epic, legendary)
- Leaderboard with real-time rankings
- Visual XP progress bar and level-up animations

---

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```
Error: MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is installed and running
- Check if the MongoDB service is active: `sudo systemctl status mongod`
- Verify the `MONGODB_URI` in your `.env` file

**Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
- Kill the process using the port: `lsof -ti:5000 | xargs kill -9`
- Or change the port in the `.env` file

**Angular Build Errors:**
```
Error: Module not found
```
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Angular cache: `ng cache clean`

**CORS Issues:**
- The backend is configured to allow requests from `http://localhost:4200`
- If using a different frontend port, update the CORS configuration in `server.js`

**Seed Data Not Loading:**
- Ensure MongoDB is running before running `node seed.js`
- Check the MongoDB connection string in the `.env` file
- Run `node seed.js` again if the database was recently cleared

---

## License

This project is built for educational and demonstration purposes.
