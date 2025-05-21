# Backend - Authentication System

This is the Express.js backend (ECMAScript Module type) for handling user authentication with PostgreSQL.

## Live API Endpoint
👉 [https://assbackend-859f.onrender.com](https://assbackend-859f.onrender.com)

## Technologies Used
- Node.js (ES Module)
- Express.js
- PostgreSQL (with `pg`)
- JWT & bcrypt
- Cookie-based auth

## API Endpoints
- `POST /api/register` → User registration
- `POST /api/login` → User login with reCAPTCHA token validation
- `GET /api/profile` → Protected route (requires cookie JWT)
- `GET /api/logout` → Clear JWT token

## Setup Instructions
1. Clone the repo and navigate into the `server` folder:
   ```bash
   git clone <repo_url>
   cd auth-app/server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Notes
- Ensure your DB schema includes a `users` table with fields: id, username, email, password, created_at.
- CORS is configured to allow requests from the frontend Vercel domain.
