
# GYM PRO - Gym Management System

## About the Project

GYM PRO is a full-stack Gym Management System.

This project helps gym owners manage members, trainers, membership plans, and payments in one place.

It has two dashboards:
- Admin Dashboard
- User Dashboard

## Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- HTML
- CSS
- Bootstrap
- Axios

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcrypt

## Features

### Admin Dashboard
- View gym statistics
- Manage gym members
- Add, edit, and delete trainers
- Add, edit, and delete membership plans
- Manage member memberships
- Add and update payment records
- View payment history
- View and delete contact messages
- Activate and deactivate user accounts

### User Dashboard
- Register and login
- View membership details
- Check membership status and expiry date
- View available membership plans
- View personal payment history
- Update profile details
- Change password
- Logout securely

## Security

- Passwords are hashed using bcrypt.
- JWT is used for user authentication.
- Admin and User have different access permissions.
- Users cannot access other members' private data.
- Protected APIs require authentication.

## How the Project Works

1. A new member creates an account.
2. The member logs in using email and password.
3. The backend checks the login details.
4. Admin users open the Admin Dashboard.
5. Normal members open the User Dashboard.
6. Admin manages trainers, plans, memberships, and payments.
7. Members can view their membership and payment details.
8. All information is stored in the MySQL database.

## How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/gym-management-system.git
cd gym-management-system
```

Replace YOUR_USERNAME with your GitHub username.

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file and add the required database and JWT settings.

Set up the MySQL database using the project's database schema.

Start the backend:

```bash
npm start
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend/gym-system
npm install
npm run dev
```

Open the local URL shown in your terminal.

## Project Status

- Main features completed
- Frontend build tested
- Basic authentication and API security tested
- Deployment in progress

## Future Improvements

- Attendance management
- Payment reports
- More dashboard analytics

## Project Purpose

I developed this project to practice full-stack web development.

I learned how to connect React with Node.js and Express.js, work with MySQL, create REST APIs, and implement role-based authentication.
