# RateHub — Full-Stack Store Rating & Discovery Platform

> **Roxiler FullStack Intern Coding Challenge Implementation**

**RateHub** is a full-stack web application designed for transparent retail discovery, community feedback, and store analytics. The platform supports three dedicated user roles: **System Administrator**, **Normal User**, and **Store Owner**, unified under a single secure JWT authentication system with role-based access control.

---

## 1. Technology Stack

* **Frontend:** React.js 19 (scaffolded with Vite)
* **Backend:** Node.js + Express.js REST API
* **Database:** MySQL (normalized relational schema with foreign keys and check constraints)
* **Database Driver:** `mysql2` (`mysql2/promise` connection pooling with automatic fallback for zero-configuration testing)
* **Authentication:** JSON Web Tokens (JWT)
* **Password Hashing:** `bcryptjs` (salt rounds = 10)
* **Styling:** Tailwind CSS (responsive layouts, custom color tokens, modern form validation UI)
* **Icons:** Lucide React

---

## 2. User Roles & Capabilities

### 1. Normal User
* **Public Self-Registration (Signup):** Full validation on Name, Email, Address, and Password.
* **Unified Login:** Secure authentication returning JWT session tokens.
* **Store Directory:** View all registered stores with names, addresses, emails, and overall rating scores.
* **Instant Search:** Search stores by Name or physical Address.
* **Rating System (1 to 5 Stars):**
  * Submit a rating (1 to 5).
  * Modify existing rating anytime.
  * **Strict Single Rating Constraint:** `UNIQUE(user_id, store_id)` prevents duplicates; existing ratings are seamlessly updated.
* **Password Management:** Update account password with real-time validation checks.
* **Session Management:** Secure logout.

### 2. System Administrator
* **Executive Dashboard:** Live metrics for:
  * **Total Registered Users**
  * **Total Registered Stores**
  * **Total Submitted Ratings**
* **User Management:**
  * Listing showing Name, Email, Address, Role, and **Store Owner Rating** (displays the average rating of their store).
  * Filter users by Name, Email, Address, or Role.
  * Sort table by Name, Email, Address, Role, or Rating (Ascending & Descending).
  * View detailed User Profile modal (including stores owned and ratings submitted).
  * Add new users (Admin, Normal User, or Store Owner) with strict validation.
* **Store Management:**
  * Listing showing Store Name, Email, Address, Overall Rating, and Owner Name.
  * Filter stores by Name, Email, or Address.
  * Sort table by Name, Email, Address, or Overall Rating (Ascending & Descending).
  * Add new stores with automatic Store Owner assignment.

### 3. Store Owner
* **Dedicated Dashboard:**
  * View physical and contact details of their store.
  * View real-time **Average Rating** score and total review count.
  * View comprehensive **1-to-5 Star Distribution breakdown** bar visualization.
  * View a table of all customers who submitted ratings (Customer Name, Email, Address, Rating, and Timestamp).
  * Supports multi-store switching if an owner manages more than one store.
* **Role Protection:** Store owners are strictly restricted from accessing administrator endpoints and rating stores.

---

## 3. Demo Credentials

For quick evaluation, pre-seeded accounts are provided with all passwords following the required complexity rules:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@ratehub.com` | `Admin@123` | Full administrative access to users, stores, and platform stats |
| **Store Owner** | `owner.alex@ratehub.com` | `Owner@123` | Manages *Apex Electronics* and *Green Valley Market* |
| **Store Owner** | `owner.beatrice@ratehub.com` | `Owner@123` | Manages *The Artisan Book & Coffee Co* |
| **Normal User** | `user.chris@ratehub.com` | `User@1234` | Has submitted ratings, can search and rate stores |
| **Normal User** | `user.diana@ratehub.com` | `User@1234` | Prime shopper account |

> **Note:** The login screen also includes one-click **Quick Demo Login Shortcuts** for instant evaluation without typing.

---

## 4. Project Directory Structure

```text
StoreRate/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool (mysql2) with resilient fallback
│   ├── controllers/
│   │   ├── adminController.js    # Administrator business logic & metrics
│   │   ├── authController.js     # Signup, login, profile, and password updates
│   │   ├── ownerController.js    # Store Owner reviews and rating analytics
│   │   └── storeController.js    # Normal User store search and rating upserts
│   ├── db/
│   │   ├── init.js               # Database table schema creation runner
│   │   └── seed.js               # Automatic database seeder with demo accounts
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role authorization (admin/owner/user)
│   │   └── errorHandler.js       # Centralized 404 & API error handler
│   ├── models/
│   │   ├── ratingModel.js        # Ratings SQL queries, upsert & aggregation
│   │   ├── storeModel.js         # Stores SQL queries, search & calculations
│   │   └── userModel.js          # Users SQL queries, filters, sorting & owner ratings
│   ├── routes/
│   │   ├── adminRoutes.js        # /api/admin/* (Protected for admin role)
│   │   ├── authRoutes.js         # /api/auth/* (Signup, login, session inspection)
│   │   ├── ownerRoutes.js        # /api/owner/* (Protected for owner role)
│   │   ├── storeRoutes.js        # /api/stores/* (Store directory & rating submissions)
│   │   └── userRoutes.js         # /api/users/* (Password updates)
│   ├── validators/
│   │   ├── authValidator.js      # Name, Email, Address, and Password validation
│   │   ├── storeValidator.js     # Store creation and 1-5 rating validation
│   │   └── userValidator.js      # Admin user creation validation
│   ├── test_e2e.js               # 31-point comprehensive automated integration test suite
│   ├── server.js                 # Express server bootstrap & route mounting
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddStoreModal.jsx     # Admin Add Store modal
│   │   │   ├── AddUserModal.jsx      # Admin Add User modal
│   │   │   ├── Navbar.jsx            # Dynamic header with role badge & navigation
│   │   │   ├── NotificationToast.jsx # Animated success/error banners
│   │   │   ├── PasswordModal.jsx     # Real-time password update modal
│   │   │   ├── ProtectedRoute.jsx    # Client-side role-based routing guard
│   │   │   ├── RatingModal.jsx       # Interactive 1-5 star submission modal
│   │   │   ├── SearchFilterBar.jsx   # Search & filter inputs
│   │   │   ├── StarRating.jsx        # Interactive & read-only star rating component
│   │   │   ├── StatCard.jsx          # Dashboard statistic cards
│   │   │   ├── Table.jsx             # Sortable data table with empty/loading states
│   │   │   └── UserDetailsModal.jsx  # Admin user profile & activity modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Session state, login, logout, and role redirect
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx    # System Administrator overview & metrics
│   │   │   ├── AdminStores.jsx       # Admin store management with sorting/filtering
│   │   │   ├── AdminUsers.jsx        # Admin user management with owner rating column
│   │   │   ├── Login.jsx             # Common login page with demo autofill
│   │   │   ├── NotFound.jsx          # 404 page
│   │   │   ├── OwnerDashboard.jsx    # Store Owner dashboard with ratings breakdown
│   │   │   ├── Signup.jsx            # Normal User self-registration
│   │   │   └── UserDashboard.jsx     # Normal User store directory & rating portal
│   │   ├── services/
│   │   │   ├── adminService.js       # Admin API client calls
│   │   │   ├── api.js                # Axios instance with JWT interceptor
│   │   │   ├── authService.js        # Auth API client calls
│   │   │   ├── ownerService.js       # Store owner API client calls
│   │   │   └── storeService.js       # Store & rating API client calls
│   │   ├── App.jsx                   # Application router
│   │   ├── index.css                 # Tailwind CSS directives & tokens
│   │   └── main.jsx
│   ├── index.html                    # Responsive HTML entry with Inter font & SVG favicon
│   ├── tailwind.config.js
│   ├── vite.config.js                # Vite config with /api reverse proxy
│   └── package.json
│
├── database/
│   ├── schema.sql                    # Clean MySQL schema with tables, FKs, and constraints
│   └── seed.sql                      # SQL seed records
│
├── .env.example                      # Template environment variables
├── package.json                      # Workspace root scripts
└── README.md                         # Project documentation
```

---

## 5. Validation Rules Specification

| Field | Validation Rule | Implementation Details |
| :--- | :--- | :--- |
| **Name** | Min 20, Max 60 characters | Enforced on both frontend character counter and backend validator |
| **Email** | Valid RFC email format | Checked with regex matching standard email syntax |
| **Address** | Maximum 400 characters | Enforced on frontend and backend |
| **Password** | 8 to 16 characters | Must contain $\ge 1$ uppercase letter (`[A-Z]`) and $\ge 1$ special symbol (`[!@#$%^&*...]`) |
| **Rating** | Integer 1 to 5 | Restricted via `CHECK (rating >= 1 AND rating <= 5)` and API validator |
| **Unique Rating** | 1 rating per user per store | Enforced via `UNIQUE(user_id, store_id)` and backend upsert |

---

## 6. Installation & Setup Guide

### Prerequisites
* **Node.js:** v18.0.0 or higher (v24.x tested)
* **MySQL:** v8.0 or higher (or compatible MariaDB server)
* **npm:** v9.x or higher

### Step 1: Clone or Navigate to the Project
```bash
cd StoreRate
```

### Step 2: Environment Configuration
Create a `.env` file in the project root by copying `.env.example`:
```bash
cp .env.example .env
```

Configure your MySQL connection details in `.env`:
```ini
PORT=5000
NODE_ENV=development

# MySQL Database Settings
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ratehub_db

# Security
JWT_SECRET=super_secret_ratehub_jwt_key_2026_change_in_production
JWT_EXPIRES_IN=24h

# Frontend CORS
CLIENT_URL=http://localhost:5173
```

### Step 3: MySQL Database Setup
Open your MySQL terminal or GUI client (e.g. MySQL Workbench) and execute `database/schema.sql`:
```bash
mysql -u root -p < database/schema.sql
```
*(Alternatively, when the backend server boots, it automatically creates the database and all required tables if they do not exist!)*

### Step 4: Install Dependencies
Install dependencies for both backend and frontend using the root command:
```bash
npm run install:all
```
*(Or install individually: `cd backend && npm install`, then `cd ../frontend && npm install`)*

---

## 7. Starting the Application

### Option A: Start Backend and Frontend
In terminal 1 (Backend):
```bash
npm run dev:backend
```
*Backend API will run on `http://localhost:5000`.*

In terminal 2 (Frontend):
```bash
npm run dev:frontend
```
*Frontend will run on `http://localhost:5173`.*

Open your browser and navigate to **`http://localhost:5173`**.

---

## 8. REST API Reference

### Public / Authentication Endpoints
* `POST /api/auth/signup` — Register a new Normal User
* `POST /api/auth/login` — Common login for Admin, User, or Store Owner
* `GET  /api/auth/me` — Get current logged-in user profile *(Requires JWT)*
* `PUT  /api/users/password` — Change password for authenticated user *(Requires JWT)*

### Normal User Endpoints
* `GET  /api/stores` — List all stores (supports `?name=...`, `?address=...`, `?sortBy=...`, `?sortOrder=...`, attaches user's submitted rating)
* `POST /api/stores/:storeId/ratings` — Submit a rating (1 to 5) *(Role: `user`)*
* `PUT  /api/stores/:storeId/ratings` — Modify existing rating (1 to 5) *(Role: `user`)*

### Administrator Endpoints *(Role: `admin`)*
* `GET  /api/admin/dashboard` — Platform counts: `{ totalUsers, totalStores, totalRatings }`
* `POST /api/admin/users` — Add a new user (admin, user, or owner)
* `POST /api/admin/stores` — Add a new store assigned to a Store Owner
* `GET  /api/admin/users` — List users with search, role filters, sorting, and Store Owner ratings
* `GET  /api/admin/users/:id` — View detailed profile with stores and reviews
* `GET  /api/admin/stores` — List stores with search, email/address filters, and sorting
* `GET  /api/admin/owners` — Dropdown list of Store Owners

### Store Owner Endpoints *(Role: `owner`)*
* `GET  /api/owner/store/ratings` — List all customer ratings for owner's store
* `GET  /api/owner/store/average-rating` — Store details, overall average score, and rating distribution

---

## 9. Automated Verification & Testing

RateHub includes a comprehensive **31-point automated test suite** that validates all security barriers, input edge cases, database constraints, and user workflows.

To run the automated tests:
```bash
npm test --prefix backend
```

### Test Suite Output:
```text
====================================================
  RateHub Full-Stack Comprehensive E2E Test Suite   
====================================================

--- 1. Health & Server Connectivity ---
 PASS: Health check returns status ok

--- 2. Input Validation Rules (Signup) ---
 PASS: Rejects name with less than 20 characters (400)
 PASS: Rejects password lacking special character (400)
 PASS: Rejects password lacking uppercase character (400)
 PASS: Normal User Signup succeeds with valid constraints
 PASS: New user registered with role "user"
 PASS: JWT token returned on signup

--- 3. Common Login for All Roles ---
 PASS: Normal User login succeeds
 PASS: Store Owner login succeeds
 PASS: Administrator login succeeds

--- 4. Normal User Store Listing, Search & Ratings ---
 PASS: Normal user can view store directory
 PASS: Search by store name functions correctly
 PASS: Search by store address functions correctly
 PASS: User submits rating (1 to 5)
 PASS: User modifies their submitted rating
 PASS: Updates existing rating instead of creating duplicate
 PASS: Rejects rating outside 1 to 5 range (400)

--- 5. Administrator Dashboard, User/Store Management ---
 PASS: Admin dashboard displays total users, total stores, and total ratings
 PASS: Admin can add new Store Owner
 PASS: Admin can add new Store assigned to a Store Owner
 PASS: Admin can view all registered users
 PASS: Administrator view includes Store Owner ratings
 PASS: Admin can view comprehensive user details with stores

--- 6. Store Owner Analytics & Reviews ---
 PASS: Store owner can view users who submitted ratings for their store
 PASS: Review contains customer name and rating
 PASS: Store owner can view store average rating and rating breakdown

--- 7. Role Isolation & Security Controls ---
 PASS: Normal User blocked from Admin API (403 Forbidden)
 PASS: Store Owner blocked from Admin API (403 Forbidden)
 PASS: Normal User blocked from Store Owner API (403 Forbidden)
 PASS: User passwords never returned in auth login responses
 PASS: User passwords never returned in admin user queries

====================================================
  Tests Complete: 31 PASSED, 0 FAILED
====================================================
```

---

## 10. Summary Checklist Verification

- [x] **Frontend:** React.js + Vite + Tailwind CSS
- [x] **Backend:** Node.js + Express.js REST API
- [x] **Database:** MySQL + `mysql2` driver + `database/schema.sql`
- [x] **Authentication:** JWT + bcrypt password hashing
- [x] **User Roles:** System Administrator, Normal User, Store Owner
- [x] **Single Login System:** Unified login with role-based routing
- [x] **Validation Rules:**
  - Name: 20–60 characters
  - Address: $\le 400$ characters
  - Password: 8–16 characters with $\ge 1$ uppercase & $\ge 1$ special character
  - Email: RFC-compliant syntax
  - Rating: 1 to 5
- [x] **Normal User Dashboard:** Store list, Name/Address search, Overall rating, Submitted rating, Submit/Modify rating
- [x] **Administrator Dashboard:** Total users/stores/ratings, Add Store, Add User, Filter/Sort tables, Store Owner rating display, User details
- [x] **Store Owner Dashboard:** Store details, average rating, rating distribution, customer review list, password update
- [x] **Role Protection:** Backend 403 Forbidden & Frontend ProtectedRoute blocking
