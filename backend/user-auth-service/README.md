# SL-PRRS — Auth Service

Microservice responsible for user registration, login, JWT issuance, and token verification for the Sri Lanka Police Rapid Report System.

## Assigned To
**Member 1** — Authentication, JWT, user model

---

## Quick Start

### 1. Install dependencies
```bash
cd auth-service
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Open `.env` and fill in:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=any_long_random_string
```

### 3. Create the database table
- Go to your **Supabase Dashboard → SQL Editor**
- Open and run the contents of `src/db/schema.sql`
- This creates the `users` table and seeds two demo accounts

### 4. Start the service
```bash
npm start
# or for development with auto-reload:
npm run dev
```

---

## API Endpoints

| Method | Endpoint              | Auth Required | Description                        |
|--------|-----------------------|---------------|------------------------------------|
| GET    | `/api/auth/health`    | No            | Health check                       |
| POST   | `/api/auth/register`  | No            | Register new citizen or officer    |
| POST   | `/api/auth/login`     | No            | Login and get JWT token            |
| GET    | `/api/auth/profile`   | Yes (Bearer)  | Get current user profile           |
| GET    | `/api/auth/verify`    | Yes (Bearer)  | Validate JWT (used by other services)|

---

## Swagger UI

- **Direct:** http://localhost:3001/api-docs
- **Via Gateway:** http://localhost:3000/api/auth/api-docs

---

## Demo Accounts (after running schema.sql)

| Role    | Email               | Password   |
|---------|---------------------|------------|
| Citizen | citizen@slprs.lk    | Demo@1234  |
| Officer | officer@slprs.lk    | Demo@1234  |

---

## Folder Structure

```
auth-service/
├── src/
│   ├── index.js               # Entry point
│   ├── routes/
│   │   └── authRoutes.js      # Route definitions + Swagger annotations
│   ├── controllers/
│   │   └── authController.js  # Request/response handling
│   ├── services/
│   │   └── authService.js     # Business logic (register, login, verify)
│   ├── repositories/
│   │   └── userRepository.js  # All Supabase DB queries
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification middleware
│   │   └── errorHandler.js   # Global error handler
│   ├── validators/
│   │   └── authValidators.js  # Input validation functions
│   ├── db/
│   │   ├── supabase.js        # Supabase client + connection check
│   │   └── schema.sql         # SQL to run in Supabase dashboard
│   └── docs/
│       └── swagger.js         # Swagger/OpenAPI configuration
├── .env.example
├── package.json
└── README.md
```

---

## Response Format

All endpoints return consistent JSON:

**Success:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": { "user": { ... }, "token": "eyJ..." }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": ["A valid email address is required."]
}
```

---

## Port
This service runs on **port 3001** by default.
All requests can also be made through the API Gateway on **port 3000** using the `/api/auth/*` prefix.
