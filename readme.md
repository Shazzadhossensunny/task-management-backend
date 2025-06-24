# Task Management Backend

A production-ready **Task Management Backend API** built with **Node.js**, **Express.js**, **TypeScript**, **MongoDB**, and **Mongoose**. This backend manages authentication, task creation, user management, and password reset functionality.

## 🚀 Live URLs

- **Backend URL:** [https://task-management-backend-alpha.vercel.app/](https://task-management-backend-alpha.vercel.app/)
- **Health Check:** [https://task-management-backend-alpha.vercel.app/api/health](https://task-management-backend-alpha.vercel.app/api/health)

## 📂 GitHub Repository

- **Repository:** [https://github.com/Shazzadhossensunny/task-management-backend](https://github.com/Shazzadhossensunny/task-management-backend)

## 🛠️ Technologies Used

- Node.js
- Express.js (v5)
- TypeScript
- MongoDB + Mongoose
- Zod (for validation)
- Bcrypt (password hashing)
- JSON Web Tokens (JWT) for authentication
- Nodemailer (Email password reset)
- CORS
- dotenv (environment variables)

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/Shazzadhossensunny/task-management-backend.git
cd task-management-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root and configure as follows:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=<your_mongodb_connection_uri>
BCRYPT_SALT_ROUNDS=10
JWT_ACCESS_SECRET=<your_access_secret>
JWT_REFRESH_SECRET=<your_refresh_secret>
JWT_ACCESS_EXPIRES_IN=15d
JWT_REFRESH_EXPIRES_IN=365d
SMTP_USER=<your_email>
SMTP_PASS=<your_app_password>
RESET_PASS_UI_LINK=https://task-management-frontend-kappa-kohl.vercel.app/auth/reset-password
```

4. For development:

```bash
npm run start:dev
```

5. For production build:

```bash
npm run build
npm run start:prod
```

## 🔍 Health Check

```bash
GET /api/health
```

Response:

```json
{
  "success": true,
  "message": "Task Management API is running!",
  "timestamp": "2025-06-24T00:00:00.000Z"
}
```

## 📝 Scripts

- `start:dev`: Development server (nodemon)
- `start:prod`: Production build
- `build`: TypeScript build
- `lint`: ESLint check
- `lint:fix`: ESLint auto fix
- `prettier`: Format using Prettier

## 🛡️ Security

- **CORS** configured for frontend:
  - `http://localhost:5173`
  - `https://task-management-frontend-kappa-kohl.vercel.app`
- **JWT** for Authentication
- **Bcrypt** for Password hashing

## ✉️ Password Reset

- Nodemailer with Gmail App Password is used.
