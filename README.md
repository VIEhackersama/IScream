# 🍦 IScream

**IScream** is a full-stack, membership-based ice cream recipe sharing and merchandise platform. Members unlock premium recipes, order ice cream books and products, submit their own recipes for community review, and leave feedback — all backed by a secure, role-based API.

---

## ✨ Features

- **Authentication & Roles** — JWT-based login and registration with `MEMBER` and `ADMIN` roles
- **Subscription / Membership** — Tiered membership plans gate access to premium recipe content
- **Recipe Catalog** — Browse and read ice cream recipes; full ingredients and steps unlocked for active members
- **E-Commerce** — Order ice cream books and merchandise with full order and shipment tracking
- **Payments** — Create, confirm, and handle payment failures; memberships auto-activate on successful payment
- **Recipe Submissions (UGC)** — Users submit their own recipes; admins approve or reject them with optional rewards
- **Reviews & Ratings** — Leave product reviews that are auto-verified when a user has purchased and used the item
- **Feedback** — General feedback form with admin read/management workflow
- **Admin Dashboard** — Manage users, recipes, orders, submissions, and feedback through a dedicated admin UI

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4 |
| **Backend** | Azure Functions v4, C# 13, .NET 10 |
| **Database** | SQL Server (Azure SQL or LocalDB) — raw ADO.NET, no ORM |
| **Authentication** | JWT (System.IdentityModel.Tokens.Jwt) + BCrypt password hashing |
| **API Docs** | OpenAPI / Swagger (auto-generated) |
| **Deployment** | Azure Static Web Apps (frontend) + Azure Functions (backend) |
| **CI/CD** | GitHub Actions |

---

## 🗂 Project Structure

```
IScream/
├── backend/                  # Azure Functions (.NET 10) API
│   ├── Functions/            # HTTP-triggered function endpoints
│   ├── Services/             # Business logic layer
│   ├── Data/                 # Repository pattern (ADO.NET)
│   └── Models/               # Entities and DTOs
├── frontend/                 # Next.js application
│   └── src/
│       ├── app/              # Pages (App Router)
│       ├── components/       # Reusable UI components
│       ├── services/         # API client service functions
│       ├── types/            # TypeScript type definitions
│       └── config/           # API endpoints and route constants
└── .github/workflows/        # CI/CD pipelines
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local) v4
- SQL Server (LocalDB or Azure SQL)

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_SITE_URL
npm run dev                  # http://localhost:3000
```

### Backend

1. **Create and seed the database** using the scripts in `backend/Database/`:
   ```bash
   sqlcmd -S "(localdb)\mssqllocaldb" -Q "CREATE DATABASE IceCreamRecipeDB"
   sqlcmd -S "(localdb)\mssqllocaldb" -d IceCreamRecipeDB -i backend/Database/001_CreateSchema.sql
   sqlcmd -S "(localdb)\mssqllocaldb" -d IceCreamRecipeDB -i backend/Database/002_CreateStoredProcedures.sql
   ```

2. **Create `backend/local.settings.json`**:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "UseDevelopmentStorage=true",
       "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
       "SqlConnectionString": "Server=(localdb)\\mssqllocaldb;Database=IceCreamRecipeDB;Integrated Security=true;",
       "JwtSecretKey": "your-secret-key-at-least-32-chars-long!"
     }
   }
   ```

3. **Start the API**:
   ```bash
   cd backend
   func start   # http://localhost:7071
   ```

4. **Swagger UI**: http://localhost:7071/api/swagger/index.html

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public URL of the frontend (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API (e.g. `http://localhost:7071/api`) |
| `SqlConnectionString` | SQL Server connection string (backend) |
| `JwtSecretKey` | Secret used to sign JWT tokens (min. 32 characters) |

---

## 📖 Additional Documentation

- [`BACKEND_SUMMARY.md`](./BACKEND_SUMMARY.md) — Backend architecture overview and quick-start notes
- [`backend/DATABASE_SETUP.md`](./backend/DATABASE_SETUP.md) — Full database schema, stored procedures, and setup guide
- [`IMPLEMENTATION_CHECKLIST.md`](./IMPLEMENTATION_CHECKLIST.md) — Step-by-step implementation and testing checklist

---

## 📄 License

This project is open-source. See [LICENSE](./LICENSE) for details (if present).
