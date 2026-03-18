# IScream — Local Setup Guide

This guide walks through the complete steps to clone, configure, and run the IScream project locally — both the backend (Azure Functions / .NET 10) and the frontend (Next.js 16).

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18 or later | https://nodejs.org |
| .NET SDK | 10.0 | https://dotnet.microsoft.com/download |
| Azure Functions Core Tools | v4 | https://learn.microsoft.com/azure/azure-functions/functions-run-local |
| SQL Server | Any edition | LocalDB, SQL Server Express, or Azure SQL |
| sqlcmd | Latest | Included with SQL Server tools |

---

## Repository Structure

```
IScream/
├── backend/                  # Azure Functions v4 (.NET 10) API
│   ├── Database/             # SQL schema scripts
│   ├── Functions/            # HTTP-triggered function endpoints
│   ├── Services/             # Business logic
│   ├── Data/                 # Repository layer (ADO.NET)
│   └── Models/               # Entities and DTOs
└── frontend/                 # Next.js application
    └── src/
        ├── app/              # Pages (App Router)
        ├── components/       # Reusable UI components
        ├── services/         # API client functions
        ├── types/            # TypeScript type definitions
        └── config/           # Endpoint and route constants
```

---

## 1. Database Setup

### 1.1 Create the database

**Using LocalDB (Windows / SQL Server Express):**

```bash
sqlcmd -S "(localdb)\mssqllocaldb" -Q "IF DB_ID(N'IceCreamRecipeDB') IS NULL CREATE DATABASE IceCreamRecipeDB"
```

**Using Azure SQL or a remote SQL Server instance:**

Ensure the target database already exists before proceeding, or create it via the Azure Portal / `az sql db create`.

### 1.2 Apply the schema

Run the schema creation script against your target database.

**LocalDB:**

```bash
sqlcmd -S "(localdb)\mssqllocaldb" -d IceCreamRecipeDB -i backend/Database/001_CreateSchema.sql
```

**Azure SQL / remote SQL Server:**

```bash
sqlcmd -S <server>.database.windows.net -d IceCreamRecipeDB -U <username> -P <password> -i backend/Database/001_CreateSchema.sql
```

The script is safe to re-run: it drops all existing tables and recreates them, then seeds two default membership plans (`MONTHLY` and `YEARLY`).

### 1.3 Schema reference

The script creates the `public_data` schema with the following tables:

| Table | Description |
|-------|-------------|
| `USERS` | Registered accounts; roles: `MEMBER`, `ADMIN` |
| `MEMBERSHIP_PLANS` | Available subscription tiers |
| `MEMBERSHIP_SUBSCRIPTIONS` | Active and historical user subscriptions |
| `PAYMENTS` | Payment records (type: `MEMBERSHIP`, `BOOK`) |
| `RECIPES` | Ice cream recipe catalog |
| `ITEMS` | Shop items (books and merchandise) |
| `ITEM_ORDERS` | Customer orders for shop items |
| `FEEDBACKS` | User-submitted feedback |
| `RECIPE_SUBMISSIONS` | Community-submitted recipes awaiting review |

---

## 2. Backend Setup

### 2.1 Create local settings

Create the file `backend/local.settings.json` (this file is excluded from source control):

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "SqlConnectionString": "Server=(localdb)\\mssqllocaldb;Database=IceCreamRecipeDB;Integrated Security=true;",
    "JwtSecretKey": "replace-with-a-secret-key-at-least-32-characters-long"
  }
}
```

For Azure SQL or a remote SQL Server instance, replace the connection string:

```
SqlConnectionString=Server=<server>.database.windows.net;Database=IceCreamRecipeDB;User Id=<username>;Password=<password>;Encrypt=True;
```

### 2.2 Start the API

```bash
cd backend
func start
```

The API will be available at `http://localhost:7071/api`.

Swagger UI: `http://localhost:7071/api/swagger/index.html`

---

## 3. Frontend Setup

### 3.1 Install dependencies

```bash
cd frontend
npm install
```

### 3.2 Configure environment variables

```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:7071/api
```

### 3.3 Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 4. Switching Between Local and Deployed Environments

The frontend resolves the backend URL entirely from the `NEXT_PUBLIC_API_URL` environment variable. No code changes are required to switch environments.

### Local environment

`frontend/.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:7071/api
```

### Deployed environment (Azure)

`frontend/.env.local` or the Azure Static Web App application settings:

```env
NEXT_PUBLIC_SITE_URL=https://<your-static-web-app>.azurestaticapps.net
NEXT_PUBLIC_API_URL=https://<your-function-app>.azurewebsites.net/api
```

For the backend, replace `local.settings.json` values with Azure Function App application settings:

| Setting | Value |
|---------|-------|
| `SqlConnectionString` | Azure SQL connection string |
| `JwtSecretKey` | Secret key (store in Azure Key Vault if possible) |

---

## 5. Environment Variable Reference

| Variable | Location | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Frontend `.env.local` | Public URL of the frontend |
| `NEXT_PUBLIC_API_URL` | Frontend `.env.local` | Base URL of the backend API |
| `SqlConnectionString` | Backend `local.settings.json` | SQL Server connection string |
| `JwtSecretKey` | Backend `local.settings.json` | Secret used to sign JWT tokens (minimum 32 characters) |

---

## 6. Database Schema SQL

The full schema is located at `backend/Database/001_CreateSchema.sql`. The script is reproduced below for reference.

```sql
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'public_data')
    EXEC('CREATE SCHEMA public_data');
GO

IF OBJECT_ID('public_data.MEMBERSHIP_SUBSCRIPTIONS', 'U') IS NOT NULL DROP TABLE public_data.MEMBERSHIP_SUBSCRIPTIONS;
IF OBJECT_ID('public_data.ITEM_ORDERS', 'U') IS NOT NULL DROP TABLE public_data.ITEM_ORDERS;
IF OBJECT_ID('public_data.RECIPE_SUBMISSIONS', 'U') IS NOT NULL DROP TABLE public_data.RECIPE_SUBMISSIONS;
IF OBJECT_ID('public_data.FEEDBACKS', 'U') IS NOT NULL DROP TABLE public_data.FEEDBACKS;
IF OBJECT_ID('public_data.PAYMENTS', 'U') IS NOT NULL DROP TABLE public_data.PAYMENTS;
IF OBJECT_ID('public_data.ITEMS', 'U') IS NOT NULL DROP TABLE public_data.ITEMS;
IF OBJECT_ID('public_data.MEMBERSHIP_PLANS', 'U') IS NOT NULL DROP TABLE public_data.MEMBERSHIP_PLANS;
IF OBJECT_ID('public_data.RECIPES', 'U') IS NOT NULL DROP TABLE public_data.RECIPES;
IF OBJECT_ID('public_data.USERS', 'U') IS NOT NULL DROP TABLE public_data.USERS;
GO

CREATE TABLE public_data.USERS (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PUBLIC_USERS PRIMARY KEY DEFAULT NEWID(),
    Username NVARCHAR(100) NOT NULL,
    Email NVARCHAR(200) NULL,
    PasswordHash NVARCHAR(500) NOT NULL,
    FullName NVARCHAR(200) NULL,
    Role NVARCHAR(50) NOT NULL CONSTRAINT DF_PUBLIC_USERS_Role DEFAULT ('MEMBER'),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PUBLIC_USERS_CreatedAt DEFAULT (SYSDATETIME()),
    IsActive BIT NOT NULL CONSTRAINT DF_PUBLIC_USERS_IsActive DEFAULT (1)
);
GO

CREATE UNIQUE INDEX UX_PUBLIC_USERS_Username ON public_data.USERS(Username);
CREATE UNIQUE INDEX UX_PUBLIC_USERS_Email ON public_data.USERS(Email) WHERE Email IS NOT NULL;
GO

CREATE TABLE public_data.MEMBERSHIP_PLANS (
    Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PUBLIC_MEMBERSHIP_PLANS PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL,
    Price DECIMAL(12,2) NOT NULL CONSTRAINT DF_PUBLIC_MEMBERSHIP_PLANS_Price DEFAULT (0),
    Currency NVARCHAR(10) NOT NULL CONSTRAINT DF_PUBLIC_MEMBERSHIP_PLANS_Currency DEFAULT ('VND'),
    DurationDays INT NOT NULL CONSTRAINT DF_PUBLIC_MEMBERSHIP_PLANS_Duration DEFAULT (30),
    IsActive BIT NOT NULL CONSTRAINT DF_PUBLIC_MEMBERSHIP_PLANS_IsActive DEFAULT (1)
);
GO

CREATE UNIQUE INDEX UX_PUBLIC_MEMBERSHIP_PLANS_Code ON public_data.MEMBERSHIP_PLANS(Code);
GO

CREATE TABLE public_data.PAYMENTS (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PUBLIC_PAYMENTS PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NULL,
    Amount DECIMAL(12,2) NOT NULL,
    Currency NVARCHAR(10) NOT NULL CONSTRAINT DF_PUBLIC_PAYMENTS_Currency DEFAULT ('VND'),
    Type NVARCHAR(50) NOT NULL,
    Status NVARCHAR(30) NOT NULL CONSTRAINT DF_PUBLIC_PAYMENTS_Status DEFAULT ('INIT'),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PUBLIC_PAYMENTS_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_PUBLIC_PAYMENTS_USERS FOREIGN KEY (UserId) REFERENCES public_data.USERS(Id)
);
GO

CREATE INDEX IX_PUBLIC_PAYMENTS_UserId ON public_data.PAYMENTS(UserId, Status, CreatedAt);
GO

CREATE TABLE public_data.RECIPES (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PUBLIC_RECIPES PRIMARY KEY DEFAULT NEWID(),
    FlavorName NVARCHAR(200) NOT NULL,
    ShortDescription NVARCHAR(500) NULL,
    Ingredients NVARCHAR(MAX) NULL,
    [Procedure] NVARCHAR(MAX) NULL,
    ImageUrl NVARCHAR(500) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_PUBLIC_RECIPES_IsActive DEFAULT (1),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PUBLIC_RECIPES_CreatedAt DEFAULT (SYSDATETIME()),
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PUBLIC_RECIPES_UpdatedAt DEFAULT (SYSDATETIME())
);
GO

CREATE INDEX IX_PUBLIC_RECIPES_IsActive ON public_data.RECIPES(IsActive, CreatedAt);
GO

CREATE TABLE public_data.ITEMS (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PUBLIC_ITEMS PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(200) NOT NULL,
    [Description] NVARCHAR(1000) NULL,
    Price DECIMAL(12,2) NOT NULL CONSTRAINT DF_PUBLIC_ITEMS_Price DEFAULT (0),
    Currency NVARCHAR(10) NOT NULL CONSTRAINT DF_PUBLIC_ITEMS_Currency DEFAULT ('VND'),
    ImageUrl NVARCHAR(500) NULL,
    Stock INT NOT NULL CONSTRAINT DF_PUBLIC_ITEMS_Stock DEFAULT (0),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PUBLIC_ITEMS_CreatedAt DEFAULT (SYSDATETIME()),
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PUBLIC_ITEMS_UpdatedAt DEFAULT (SYSDATETIME())
);
GO

CREATE INDEX IX_PUBLIC_ITEMS_Stock ON public_data.ITEMS(Stock);
GO

CREATE TABLE public_data.ITEM_ORDERS (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PUBLIC_ITEM_ORDERS PRIMARY KEY DEFAULT NEWID(),
    OrderNo NVARCHAR(50) NOT NULL,
    CustomerName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(200) NULL,
    Phone NVARCHAR(30) NULL,
    Address NVARCHAR(500) NULL,
    ItemId UNIQUEIDENTIFIER NOT NULL,
    Quantity INT NOT NULL CONSTRAINT DF_PUBLIC_ITEM_ORDERS_Qty DEFAULT (1),
    UnitPrice DECIMAL(12,2) NOT NULL CONSTRAINT DF_PUBLIC_ITEM_ORDERS_UnitPrice DEFAULT (0),
    TotalCost AS (CONVERT(DECIMAL(12,2), Quantity * UnitPrice)) PERSISTED,
    PaymentId UNIQUEIDENTIFIER NULL,
    Status NVARCHAR(30) NOT NULL CONSTRAINT DF_PUBLIC_ITEM_ORDERS_Status DEFAULT ('PENDING'),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PUBLIC_ITEM_ORDERS_CreatedAt DEFAULT (SYSDATETIME()),
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PUBLIC_ITEM_ORDERS_UpdatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_PUBLIC_ITEM_ORDERS_ITEMS FOREIGN KEY (ItemId) REFERENCES public_data.ITEMS(Id),
    CONSTRAINT FK_PUBLIC_ITEM_ORDERS_PAYMENTS FOREIGN KEY (PaymentId) REFERENCES public_data.PAYMENTS(Id)
);
GO

CREATE UNIQUE INDEX UX_PUBLIC_ITEM_ORDERS_OrderNo ON public_data.ITEM_ORDERS(OrderNo);
CREATE INDEX IX_PUBLIC_ITEM_ORDERS_ItemId ON public_data.ITEM_ORDERS(ItemId, Status);
CREATE INDEX IX_PUBLIC_ITEM_ORDERS_PaymentId ON public_data.ITEM_ORDERS(PaymentId);
GO

CREATE TABLE public_data.MEMBERSHIP_SUBSCRIPTIONS (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PUBLIC_MEMBERSHIP_SUBSCRIPTIONS PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    PlanId INT NOT NULL,
    PaymentId UNIQUEIDENTIFIER NULL,
    StartDate DATETIME2(0) NOT NULL,
    EndDate DATETIME2(0) NOT NULL,
    Status NVARCHAR(30) NOT NULL CONSTRAINT DF_PUBLIC_MEMBERSHIP_SUBSCRIPTIONS_Status DEFAULT ('ACTIVE'),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PUBLIC_MEMBERSHIP_SUBSCRIPTIONS_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_PUBLIC_MEMBERSHIP_SUBSCRIPTIONS_USERS FOREIGN KEY (UserId) REFERENCES public_data.USERS(Id),
    CONSTRAINT FK_PUBLIC_MEMBERSHIP_SUBSCRIPTIONS_PLANS FOREIGN KEY (PlanId) REFERENCES public_data.MEMBERSHIP_PLANS(Id),
    CONSTRAINT FK_PUBLIC_MEMBERSHIP_SUBSCRIPTIONS_PAYMENTS FOREIGN KEY (PaymentId) REFERENCES public_data.PAYMENTS(Id)
);
GO

CREATE INDEX IX_PUBLIC_MEMBERSHIP_SUBSCRIPTIONS_User ON public_data.MEMBERSHIP_SUBSCRIPTIONS(UserId, Status, EndDate);
CREATE INDEX IX_PUBLIC_MEMBERSHIP_SUBSCRIPTIONS_Plan ON public_data.MEMBERSHIP_SUBSCRIPTIONS(PlanId);
CREATE INDEX IX_PUBLIC_MEMBERSHIP_SUBSCRIPTIONS_PaymentId ON public_data.MEMBERSHIP_SUBSCRIPTIONS(PaymentId);
GO

CREATE TABLE public_data.FEEDBACKS (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PUBLIC_FEEDBACKS PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NULL,
    Name NVARCHAR(200) NULL,
    Email NVARCHAR(200) NULL,
    Message NVARCHAR(MAX) NOT NULL,
    IsRegisteredUser BIT NOT NULL CONSTRAINT DF_PUBLIC_FEEDBACKS_IsRegisteredUser DEFAULT (0),
    IsRead BIT NOT NULL CONSTRAINT DF_PUBLIC_FEEDBACKS_IsRead DEFAULT (0),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PUBLIC_FEEDBACKS_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_PUBLIC_FEEDBACKS_USERS FOREIGN KEY (UserId) REFERENCES public_data.USERS(Id)
);
GO

CREATE INDEX IX_PUBLIC_FEEDBACKS_UserId ON public_data.FEEDBACKS(UserId, CreatedAt);
GO

CREATE TABLE public_data.RECIPE_SUBMISSIONS (
    Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PUBLIC_RECIPE_SUBMISSIONS PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NULL,
    Name NVARCHAR(200) NULL,
    Email NVARCHAR(200) NULL,
    Title NVARCHAR(200) NOT NULL,
    [Description] NVARCHAR(1000) NULL,
    Ingredients NVARCHAR(MAX) NULL,
    Steps NVARCHAR(MAX) NULL,
    ImageUrl NVARCHAR(500) NULL,
    Status NVARCHAR(30) NOT NULL CONSTRAINT DF_PUBLIC_RECIPE_SUBMISSIONS_Status DEFAULT ('PENDING'),
    PrizeMoney DECIMAL(12,2) NULL,
    CertificateUrl NVARCHAR(500) NULL,
    ReviewedByUserId UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PUBLIC_RECIPE_SUBMISSIONS_CreatedAt DEFAULT (SYSDATETIME()),
    ReviewedAt DATETIME2(0) NULL,
    CONSTRAINT FK_PUBLIC_RECIPE_SUBMISSIONS_USERS FOREIGN KEY (UserId) REFERENCES public_data.USERS(Id),
    CONSTRAINT FK_PUBLIC_RECIPE_SUBMISSIONS_REVIEWER FOREIGN KEY (ReviewedByUserId) REFERENCES public_data.USERS(Id)
);
GO

CREATE INDEX IX_PUBLIC_RECIPE_SUBMISSIONS_Status ON public_data.RECIPE_SUBMISSIONS(Status, CreatedAt);
CREATE INDEX IX_PUBLIC_RECIPE_SUBMISSIONS_UserId ON public_data.RECIPE_SUBMISSIONS(UserId, CreatedAt);
CREATE INDEX IX_PUBLIC_RECIPE_SUBMISSIONS_ReviewedBy ON public_data.RECIPE_SUBMISSIONS(ReviewedByUserId, ReviewedAt);
GO

CREATE OR ALTER TRIGGER public_data.TR_RECIPES_SetUpdatedAt
ON public_data.RECIPES
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE r SET UpdatedAt = SYSDATETIME()
    FROM public_data.RECIPES r JOIN inserted i ON i.Id = r.Id;
END
GO

CREATE OR ALTER TRIGGER public_data.TR_ITEMS_SetUpdatedAt
ON public_data.ITEMS
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE t SET UpdatedAt = SYSDATETIME()
    FROM public_data.ITEMS t JOIN inserted i ON i.Id = t.Id;
END
GO

CREATE OR ALTER TRIGGER public_data.TR_ITEM_ORDERS_SetUpdatedAt
ON public_data.ITEM_ORDERS
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE t SET UpdatedAt = SYSDATETIME()
    FROM public_data.ITEM_ORDERS t JOIN inserted i ON i.Id = t.Id;
END
GO

INSERT INTO public_data.MEMBERSHIP_PLANS (Code, Price, Currency, DurationDays, IsActive)
VALUES
    ('MONTHLY', 99000, 'VND', 30,  1),
    ('YEARLY',  799000, 'VND', 365, 1);
GO
```

---

## 7. Verify the Setup

Once both services are running, confirm the following endpoints respond correctly:

| Check | URL | Expected |
|-------|-----|----------|
| API health | `http://localhost:7071/api/health` | `200 OK` |
| Swagger UI | `http://localhost:7071/api/swagger/index.html` | Swagger page loads |
| Frontend | `http://localhost:3000` | Homepage loads |
| Recipes API | `http://localhost:7071/api/recipes` | JSON array |
