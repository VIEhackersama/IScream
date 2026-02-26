# 🍦 IScream - Database & Backend Setup Guide

## 📋 Mục lục
1. [Database Setup](#database-setup)
2. [Entity Models](#entity-models)
3. [Repository Pattern](#repository-pattern)
4. [Azure Functions Integration](#azure-functions-integration)
5. [Stored Procedures](#stored-procedures)
6. [Workflows](#workflows)

---

## Database Setup

### Bước 1: Tạo Database

Chạy script SQL để tạo database structure:

```sql
-- File: backend/Database/001_CreateSchema.sql
-- Chứa: Schema, Tables, Indexes, Views
-- Chạy trên SQL Server Management Studio hoặc Azure SQL
```

**Content của script:**
- ✅ Tạo 5 schemas: `auth`, `catalog`, `sales`, `content`, `ugc`
- ✅ Tạo tất cả tables với constraints và indexes
- ✅ Tạo 3 views cho dễ query
- ✅ Filtered unique indexes (cho nullable Email, Phone)

### Bước 2: Tạo Stored Procedures

Chạy script thứ hai:

```sql
-- File: backend/Database/002_CreateStoredProcedures.sql
-- Chứa: 10 stored procedures cho mọi workflow chính
```

**List các SP:**
1. `sales.sp_CreateOrder` - Tạo đơn hàng
2. `sales.sp_AddOrderItem` - Thêm sản phẩm vào đơn
3. `sales.sp_MarkPaymentSuccess` - Ghi nhận thanh toán + cấp quyền
4. `sales.sp_MarkOrderDelivered` - Hoàn thành giao hàng + tạo usage
5. `sales.sp_MarkUsed` - Đánh dấu đã dùng
6. `content.sp_CreateReview` - Tạo đánh giá (auto-verify)
7. `sales.sp_CreateShipment` - Tạo shipment
8. `ugc.sp_ApproveSubmission` - Duyệt UGC submission
9. `ugc.sp_RejectSubmission` - Từ chối UGC submission
10. `sales.sp_UpdateSubscriptionStatus` - Cập nhật subscription

### Bước 3: Connection String

Thêm vào `local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "DatabaseConnectionString": "Server=YOUR_SERVER;Database=IceCreamRecipeDB;User Id=YOUR_USER;Password=YOUR_PASSWORD;"
  }
}
```

---

## Entity Models

Các C# models tương ứng với SQL tables:

### Auth Module
```csharp
public class User { }        // auth.Users
public class AuthAccount { } // auth.AuthAccounts
```

### Catalog Module
```csharp
public class Product { }      // catalog.Products
public class ProductMedia { } // catalog.ProductMedia
```

### Content Module
```csharp
public class Recipe { }       // content.Recipes
public class RecipeMedia { }  // content.RecipeMedia
public class RecipeAccess { } // content.RecipeAccess
public class Review { }       // content.Reviews
public class TopRecipe { }    // content.TopRecipes
```

### Sales Module
```csharp
public class Order { }        // sales.Orders
public class OrderItem { }    // sales.OrderItems
public class Payment { }      // sales.Payments
public class Shipment { }     // sales.Shipments
public class ProductUsage { } // sales.ProductUsage
public class Subscription { } // sales.Subscriptions
```

### UGC Module
```csharp
public class RecipeSubmission { }  // ugc.RecipeSubmissions
public class SubmissionMedia { }   // ugc.SubmissionMedia
public class SubmissionReward { }  // ugc.SubmissionRewards
```

---

## Repository Pattern

### Interface: `IDatabaseRepository`

Tất cả database operations đều thông qua interface này:

```csharp
// Orders
Task<long> CreateOrderAsync(long userId, string orderCode, decimal totalAmount);
Task<long> AddOrderItemAsync(long orderId, long productId, int quantity, decimal unitPrice);
Task<int> MarkPaymentSuccessAsync(long orderId, string provider, decimal amount);
Task<int> MarkOrderDeliveredAsync(long orderId, DateTime? deliveredAt = null);

// Shipments
Task<long> CreateShipmentAsync(long orderId, string receiverName, ...);

// Reviews
Task<long> CreateReviewAsync(long userId, string targetType, long targetId, int rating);

// UGC
Task<int> ApproveSubmissionAsync(long submissionId, ...);
Task<int> RejectSubmissionAsync(long submissionId, ...);

// Generic
Task<T> ExecuteScalarAsync<T>(string query, SqlParameter[] parameters = null);
Task<DataTable> ExecuteQueryAsync(string query, SqlParameter[] parameters = null);
```

### Implementation: `SqlServerRepository`

Sử dụng ADO.NET để execute:
- Stored Procedures
- Direct SQL Queries
- Scalar results, DataTables

---

## Azure Functions Integration

### Setup trong `Program.cs`

```csharp
using IScream.Data;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services =>
    {
        var connectionString = Environment.GetEnvironmentVariable("DatabaseConnectionString");
        services.AddDatabaseRepository(connectionString);
    })
    .Build();

host.Run();
```

### Sử dụng trong Azure Function

```csharp
using IScream.Data;

public class OrderFunction
{
    private readonly IDatabaseRepository _db;

    public OrderFunction(IDatabaseRepository db)
    {
        _db = db;
    }

    [Function("CreateOrder")]
    public async Task<HttpResponseData> CreateOrder(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "orders")] HttpRequestData req)
    {
        try
        {
            var userId = 1L;
            var orderId = await _db.CreateOrderAsync(userId, "ORD-001", 150000);
            
            return req.CreateResponse(HttpStatusCode.OK);
        }
        catch (Exception ex)
        {
            return req.CreateResponse(HttpStatusCode.BadRequest);
        }
    }
}
```

---

## Stored Procedures

### 1. Order Workflow

```
CreateOrder 
  → AddOrderItem (có thể gọi nhiều lần)
    → MarkPaymentSuccess (ghi payment + cấp quyền/subscription)
      → CreateShipment (nếu có kem)
        → MarkOrderDelivered (hoàn thành)
```

### 2. Payment Success Logic

**Nếu mua RECIPE:**
- Thêm row vào `content.RecipeAccess` (vĩnh viễn, không hết hạn)

**Nếu mua MEMBERSHIP:**
- Tạo row `sales.Subscriptions` với hạn 30 ngày

### 3. Review Logic

**Auto-verify PRODUCT review:**
- Kiểm `sales.ProductUsage` nếu Status = 'USED'

**Auto-verify RECIPE review:**
- Kiểm `content.RecipeAccess` còn hạn

### 4. UGC Submission

**Approve:**
- Update submission Status = 'APPROVED'
- Tạo `ugc.SubmissionRewards`
- Đưa recipe vào `content.TopRecipes` (RankScore = 50)

**Reject:**
- Update submission Status = 'REJECTED'
- Ghi AdminNote

---

## Workflows

### ✓ Workflow 1: Membership Registration & Recipe Access

```
Guest
  → View Free Recipes (Visibility = 'FREE')
  → Select Plan ($15/mo or $150/yr)
  → Enter User Info + Payment
  → Mock Payment Validation
  → Save to DB:
      - Create User → auth.Users
      - Create AuthAccount → auth.AuthAccounts
      - Create Order → sales.Orders
      - Mark Payment Success → sales.Payments + sales.Subscriptions
  → Auto-Login + Grant Member Role
  → View Full Recipes
```

### ✓ Workflow 2: Book Ordering (E-commerce)

```
User
  → Visit Order Books Page
  → View Book List
  → Click Buy Now
  → Enter Form (Name, Email, Phone, Address, Card)
  → Mock Payment Validation
  → SUCCESS:
      - Create Order → sales.Orders + sales.OrderItems
      - Create Shipment → sales.Shipments
      - Mark Delivered → sales.Orders Status = 'COMPLETED'
      - Notify Order Success
  → FAILED:
      - Show Payment Error
```

### ✓ Workflow 3: Recipe Submission & Reward (UGC)

```
User (Any)
  → Visit Adding Recipe Page
  → Enter Form (Name, Desc, Ingredients, Steps, Image)
  → Submit Form
  → Save to DB:
      - Create Submission → ugc.RecipeSubmissions (Status = 'PENDING')
      - Save Media → ugc.SubmissionMedia

ADMIN:
  → View Pending List
  → Decision:
      APPROVE:
        - Update Status = 'APPROVED'
        - Enter Prize Money ($)
        - Generate Certificate
        - Send Email with Certificate
        - Display on Top Recipe
      REJECT:
        - Update Status = 'REJECTED'
        - Send Rejection Email
```

---

## Schema Diagram

```
┌─────────────────────────────────────────────────────┐
│                      AUTH                           │
│  Users (Id, FullName, Email, Phone, Status, ...)   │
│  AuthAccounts (UserId, Provider, ProviderUserId)   │
└──────────────────┬──────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    CATALOG                               │
│  Products (Id, Type, Name, Slug, Price, ...)            │
│  ProductMedia (ProductId, MediaType, Url, ...)          │
└──────────────────┬───────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                      CONTENT                                  │
│  Recipes (ProductId, Title, Ingredients, Steps, Status, ...) │
│  RecipeMedia (RecipeId, MediaRole=TRAILER|REFERENCE|GALLERY) │
│  RecipeAccess (UserId, RecipeId, SourceType, ExpiresAt)      │
│  Reviews (UserId, TargetType, TargetId, Rating, IsVerified) │
│  TopRecipes (RecipeId, RankScore, FeaturedFrom)              │
└───────────────────┬────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                      SALES                                    │
│  Orders (UserId, OrderCode, Status, TotalAmount, ...)        │
│  OrderItems (OrderId, ProductId, Quantity, UnitPrice, ...)   │
│  Payments (OrderId, Provider, Amount, Status, ...)           │
│  Shipments (OrderId, ReceiverName, Phone, Address, ...)      │
│  ProductUsage (UserId, OrderItemId, Status=PURCHASED|USED)   │
│  Subscriptions (UserId, ProductId, Status, StartAt, EndAt)   │
└───────────────────┬────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      UGC                                     │
│  RecipeSubmissions (UserId, Title, Status=PENDING|APPROVED)  │
│  SubmissionMedia (SubmissionId, MediaType, Url)              │
│  SubmissionRewards (SubmissionId, PrizeMoney, CertificateUrl)│
└──────────────────────────────────────────────────────────────┘
```

---

## Key Design Points

### ⭐ Nullable Email/Phone
- Dùng **Filtered Unique Index** `WHERE Email IS NOT NULL`
- Cho phép nhiều NULL nhưng unique khi có giá trị

### ⭐ Media Roles
- **TRAILER**: Video preview ngắn (chỉ 1 cái)
- **REFERENCE**: Video hướng dẫn (ít nhất 1 cái, enforce ở app)
- **GALLERY**: Ảnh/video bổ sung

### ⭐ Review Verification
- **PRODUCT**: Phải PURCHASED + USED
- **RECIPE**: Chỉ cần có RecipeAccess (hạn còn lại)

### ⭐ Subscription Duration
- Default 30 ngày từ ngày tạo
- Track `StartAt`, `EndAt`

### ⭐ Top Recipes
- Auto tạo khi approval UGC
- `RankScore` dùng để sort
- Có `FeaturedFrom`, `FeaturedTo` để rotate

---

## Testing Local

### SQL Server Local
```
Server=(localdb)\mssqllocaldb
Database=IceCreamRecipeDB
```

### Run Scripts
```powershell
# SQL Server Management Studio
# Open: backend/Database/001_CreateSchema.sql
# Open: backend/Database/002_CreateStoredProcedures.sql
# Execute
```

### Test Azure Functions Local
```bash
cd backend
func start
```

Visit: `http://localhost:7071/api/...`

---

## Deployment to Azure

### 1. Create Azure SQL Database
```bash
az sql server create --resource-group myGroup --name myServer
az sql db create --server myServer --database IceCreamRecipeDB
```

### 2. Run Migration Scripts
```bash
sqlcmd -S myServer.database.windows.net -d IceCreamRecipeDB -U admin -P password -i 001_CreateSchema.sql
sqlcmd -S myServer.database.windows.net -d IceCreamRecipeDB -U admin -P password -i 002_CreateStoredProcedures.sql
```

### 3. Update Connection String
Thêm vào Azure Key Vault hoặc App Settings:
```
DatabaseConnectionString=Server=myServer.database.windows.net;Database=IceCreamRecipeDB;User Id=admin;Password=...;
```

---

## Tài Liệu Thêm

- 📄 [SQL Server Best Practices](https://docs.microsoft.com/sql/)
- 📄 [Azure SQL Database](https://docs.microsoft.com/azure/azure-sql/)
- 📄 [Azure Functions](https://docs.microsoft.com/azure/azure-functions/)
- 📄 [Entity Framework Core](https://docs.microsoft.com/ef/core/)

---

**Happy Coding! 🍦**
