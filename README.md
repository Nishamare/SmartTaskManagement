# 🚀 SmartTask – Project Management System

A full-stack **Project & Task Management System** built with **React.js**, **Node.js + Express.js**, and **MySQL**.  
Manage projects, assign tasks, collaborate with your team, and track progress — all in one place.

---

## ✨ Features

- 🔐 JWT-based Authentication (Login / Register)
- 📁 Project Management (Create, Edit, Delete, Color-coded)
- ✅ Task Tracking (To Do → In Progress → Review → Done)
- 👥 Team Collaboration (Add/Remove Members, Assign Tasks)
- 💬 Comments on Tasks
- 🔔 Overdue Task Detection
- 📊 Live Dashboard with Stats
- 🌙 Dark Mode Support
- 📱 Fully Responsive UI

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React.js, Tailwind CSS, Axios     |
| Backend   | Node.js, Express.js               |
| Database  | MySQL, Sequelize ORM              |
| Auth      | JWT (JSON Web Tokens)             |
| Others    | react-hot-toast, react-router-dom |

---

## 📁 Folder Structure

```
SmartTaskManagement/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, schema
│   │   ├── controllers/    # Auth, Projects, Tasks
│   │   ├── middleware/     # Auth, Validation, Error Handler
│   │   ├── routes/         # API routes
│   │   └── utils/          # JWT, Response helpers
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── pages/          # Dashboard, Projects, Tasks, Profile
    │   ├── components/     # Layout, UI components
    │   ├── context/        # Auth, Theme context
    │   ├── utils/          # API calls, Helpers
    │   └── hooks/          # Custom hooks
    ├── package.json
    └── .env
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js v18+
- MySQL 8+
- Git

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Nishamare/SmartTaskManagement.git
cd SmartTaskManagement
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm init -y
npm install express mysql2 bcryptjs jsonwebtoken dotenv cors express-validator morgan helmet express-rate-limit
npm install --save-dev nodemon
```

Create folder structure:

```bash
mkdir src
mkdir src\config
mkdir src\controllers
mkdir src\middleware
mkdir src\models
mkdir src\routes
mkdir src\utils
mkdir logs
```

Verify structure:

```bash
tree src
```

Create `.env` file in `backend/`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smarttask
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

Run the backend:

```bash
# Development
npm run dev

# Production
npm start
```

---

### 3️⃣ Frontend Setup

```bash
cd ..
npx create-react-app frontend
cd frontend
npm install axios react-router-dom react-hot-toast recharts date-fns @headlessui/react
```

Install Tailwind CSS:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Create folder structure:

```bash
mkdir src\pages
mkdir src\components
mkdir src\context
mkdir src\utils
mkdir src\hooks
```

Create `.env` file in `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Update `tailwind.config.js`:

```js
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

Add to `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Run the frontend:

```bash
npm start
```

---

### 4️⃣ MySQL Database Setup

Open MySQL and run:

```sql
CREATE DATABASE smarttask;
```

Then run the schema file:

```bash
mysql -u root -p smarttask < backend/src/config/schema.sql
```

---

## 🚀 Running the Full Project

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd SmartTaskManagement/backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd SmartTaskManagement/frontend
npm start
```

Open browser: **http://localhost:3000**

---

## 🔑 Demo Credentials

```
Email:    admin@smarttask.com
Password: Admin@123
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint                  | Description         |
|--------|---------------------------|---------------------|
| POST   | /api/auth/register        | Register new user   |
| POST   | /api/auth/login           | Login               |
| GET    | /api/auth/me              | Get current user    |
| PUT    | /api/auth/profile         | Update profile      |
| PUT    | /api/auth/change-password | Change password     |

### Projects
| Method | Endpoint                        | Description         |
|--------|---------------------------------|---------------------|
| GET    | /api/projects                   | Get all projects    |
| POST   | /api/projects                   | Create project      |
| PUT    | /api/projects/:id               | Update project      |
| DELETE | /api/projects/:id               | Delete project      |
| POST   | /api/projects/:id/members       | Add member          |
| DELETE | /api/projects/:id/members/:uid  | Remove member       |

### Tasks
| Method | Endpoint                        | Description         |
|--------|---------------------------------|---------------------|
| GET    | /api/tasks/my                   | Get my tasks        |
| GET    | /api/tasks/project/:id          | Get project tasks   |
| POST   | /api/tasks/project/:id          | Create task         |
| PUT    | /api/tasks/:id                  | Update task         |
| PATCH  | /api/tasks/:id/status           | Update status       |
| DELETE | /api/tasks/:id                  | Delete task         |
| POST   | /api/tasks/:id/comments         | Add comment         |

---

## 📸 Application Screens

| Screen         | Description                              |
|----------------|------------------------------------------|
| Login/Register | JWT auth with demo credentials           |
| Dashboard      | Stats + recent tasks & projects          |
| Projects       | Grid view with create, edit, delete      |
| Project Detail | Tasks, members, comments per project     |
| My Tasks       | All tasks grouped by status & overdue    |
| Profile        | Edit profile & change password           |

---

## 👩‍💻 Developer

**Nisha Mare**  
GitHub: [@Nishamare](https://github.com/Nishamare)

---

## 📄 License

This project is for educational purposes.
