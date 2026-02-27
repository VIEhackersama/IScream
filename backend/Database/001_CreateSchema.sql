-- =====================================================================
--   ICECREAM + RECIPE SYSTEM (SQL SERVER)
--   Database Name: IceCreamRecipeDB
--
--   MỤC TIÊU THEO FLOW CỦA BẠN
--   1) Bán kem -> tạo mối liên hệ / upsell -> khách thích -> mua công thức
--   2) Công thức có nhiều media: ảnh/video (TRAILER + REFERENCE)
--   3) Chỉ người đã mua và đã dùng mới được feedback/review
--   4) Có Membership để mở khóa công thức
--   5) Có UGC: user gửi công thức -> admin duyệt -> thưởng -> hiển thị Top Recipe
-- =====================================================================

IF DB_ID(N'IceCreamRecipeDB') IS NULL
BEGIN
    CREATE DATABASE IceCreamRecipeDB;
END
GO

USE IceCreamRecipeDB;
GO

-- =====================================================================
-- PHẦN 1: TẠO SCHEMA (tách module cho dễ quản lý)
-- =====================================================================
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'auth')    EXEC('CREATE SCHEMA auth');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'catalog') EXEC('CREATE SCHEMA catalog');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'sales')   EXEC('CREATE SCHEMA sales');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'content') EXEC('CREATE SCHEMA content');
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'ugc')     EXEC('CREATE SCHEMA ugc');
GO

-- =====================================================================
-- PHẦN 2: USERS & AUTH
-- =====================================================================
CREATE TABLE auth.Users (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(200) NULL,
    Phone NVARCHAR(20) NULL,
    Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Status DEFAULT ('ACTIVE'),  -- ACTIVE/INACTIVE/BLOCKED
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSDATETIME()),
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT (SYSDATETIME())
);
GO

CREATE UNIQUE INDEX UX_Users_Email ON auth.Users(Email) WHERE Email IS NOT NULL;
CREATE UNIQUE INDEX UX_Users_Phone ON auth.Users(Phone) WHERE Phone IS NOT NULL;
GO

CREATE TABLE auth.AuthAccounts (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL,
    Provider NVARCHAR(50) NOT NULL,         -- facebook/google/local
    ProviderUserId NVARCHAR(200) NOT NULL,  -- id bên provider
    AccessToken NVARCHAR(MAX) NULL,
    RefreshToken NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AuthAccounts_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_AuthAccounts_Users FOREIGN KEY(UserId) REFERENCES auth.Users(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_AuthAccounts_Provider UNIQUE (Provider, ProviderUserId)
);
GO

CREATE INDEX IX_AuthAccounts_UserId ON auth.AuthAccounts(UserId);
GO

-- =====================================================================
-- PHẦN 3: CATALOG (SẢN PHẨM)
-- =====================================================================
CREATE TABLE catalog.Products (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    Type NVARCHAR(30) NOT NULL,        -- ICECREAM / RECIPE / MEMBERSHIP
    Name NVARCHAR(200) NOT NULL,
    Slug NVARCHAR(200) NOT NULL,
    ShortDesc NVARCHAR(500) NULL,
    FullDesc NVARCHAR(MAX) NULL,
    Price DECIMAL(12,2) NOT NULL CONSTRAINT DF_Products_Price DEFAULT (0),
    Currency NVARCHAR(10) NOT NULL CONSTRAINT DF_Products_Currency DEFAULT ('VND'),
    IsActive BIT NOT NULL CONSTRAINT DF_Products_IsActive DEFAULT (1),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT (SYSDATETIME()),
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Products_UpdatedAt DEFAULT (SYSDATETIME())
);
GO

CREATE UNIQUE INDEX UX_Products_Slug ON catalog.Products(Slug);
CREATE INDEX IX_Products_Type ON catalog.Products(Type, IsActive);
GO

CREATE TABLE catalog.ProductMedia (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductId BIGINT NOT NULL,
    MediaType NVARCHAR(20) NOT NULL,  -- IMAGE / VIDEO
    Url NVARCHAR(500) NOT NULL,
    IsCover BIT NOT NULL CONSTRAINT DF_ProductMedia_IsCover DEFAULT (0),
    Position INT NOT NULL CONSTRAINT DF_ProductMedia_Position DEFAULT (0),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ProductMedia_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_ProductMedia_Products FOREIGN KEY(ProductId) REFERENCES catalog.Products(Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_ProductMedia_ProductId ON catalog.ProductMedia(ProductId);
GO

-- =====================================================================
-- PHẦN 4: CONTENT - RECIPES + MEDIA
-- =====================================================================
CREATE TABLE content.Recipes (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductId BIGINT NOT NULL,                 -- product type=RECIPE
    Title NVARCHAR(200) NOT NULL,
    ShortDesc NVARCHAR(500) NULL,
    Ingredients NVARCHAR(MAX) NULL,
    Steps NVARCHAR(MAX) NULL,
    Visibility NVARCHAR(20) NOT NULL CONSTRAINT DF_Recipes_Visibility DEFAULT ('PAID'), -- FREE/PAID
    Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Recipes_Status DEFAULT ('DRAFT'),        -- DRAFT/PUBLISHED/ARCHIVED
    CreatedByUserId BIGINT NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Recipes_CreatedAt DEFAULT (SYSDATETIME()),
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Recipes_UpdatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_Recipes_Product FOREIGN KEY(ProductId) REFERENCES catalog.Products(Id),
    CONSTRAINT FK_Recipes_CreatedBy FOREIGN KEY(CreatedByUserId) REFERENCES auth.Users(Id),
    CONSTRAINT UQ_Recipes_Product UNIQUE (ProductId)
);
GO

CREATE INDEX IX_Recipes_Status ON content.Recipes(Status, Visibility);
CREATE INDEX IX_Recipes_CreateBy ON content.Recipes(CreatedByUserId);
GO

CREATE TABLE content.RecipeMedia (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    RecipeId BIGINT NOT NULL,
    MediaType NVARCHAR(20) NOT NULL,  -- IMAGE/VIDEO
    MediaRole NVARCHAR(20) NOT NULL,  -- TRAILER/REFERENCE/GALLERY
    Url NVARCHAR(500) NOT NULL,
    Position INT NOT NULL CONSTRAINT DF_RecipeMedia_Position DEFAULT (0),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_RecipeMedia_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_RecipeMedia_Recipe FOREIGN KEY(RecipeId) REFERENCES content.Recipes(Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_RecipeMedia_RecipeId ON content.RecipeMedia(RecipeId, MediaRole);
GO

-- Mỗi recipe chỉ có 1 TRAILER
CREATE UNIQUE INDEX UX_RecipeMedia_Trailer
ON content.RecipeMedia(RecipeId)
WHERE MediaRole = 'TRAILER';
GO

-- =====================================================================
-- PHẦN 5: SALES - ORDERS / ITEMS / PAYMENTS / SHIPMENTS
-- =====================================================================
CREATE TABLE sales.Orders (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL,
    OrderCode NVARCHAR(50) NOT NULL,
    Status NVARCHAR(30) NOT NULL CONSTRAINT DF_Orders_Status DEFAULT ('PENDING'),  -- PENDING/PAID/COMPLETED/CANCELLED
    TotalAmount DECIMAL(12,2) NOT NULL CONSTRAINT DF_Orders_Total DEFAULT (0),
    Currency NVARCHAR(10) NOT NULL CONSTRAINT DF_Orders_Currency DEFAULT ('VND'),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Orders_CreatedAt DEFAULT (SYSDATETIME()),
    UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Orders_UpdatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_Orders_Users FOREIGN KEY(UserId) REFERENCES auth.Users(Id),
    CONSTRAINT UQ_Orders_Code UNIQUE (OrderCode)
);
GO

CREATE INDEX IX_Orders_UserId ON sales.Orders(UserId, Status);
CREATE INDEX IX_Orders_Status ON sales.Orders(Status);
GO

CREATE TABLE sales.OrderItems (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    OrderId BIGINT NOT NULL,
    ProductId BIGINT NOT NULL,
    Quantity INT NOT NULL CONSTRAINT DF_OrderItems_Qty DEFAULT (1),
    UnitPrice DECIMAL(12,2) NOT NULL CONSTRAINT DF_OrderItems_UnitPrice DEFAULT (0),
    ItemTypeSnapshot NVARCHAR(30) NOT NULL, -- ICECREAM/RECIPE/MEMBERSHIP
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_OrderItems_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY(OrderId) REFERENCES sales.Orders(Id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY(ProductId) REFERENCES catalog.Products(Id)
);
GO

CREATE INDEX IX_OrderItems_OrderId ON sales.OrderItems(OrderId);
GO

CREATE TABLE sales.Payments (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    OrderId BIGINT NOT NULL,
    Provider NVARCHAR(50) NOT NULL,  -- MOMO/ZALOPAY/STRIPE/etc
    Amount DECIMAL(12,2) NOT NULL,
    Status NVARCHAR(30) NOT NULL CONSTRAINT DF_Payments_Status DEFAULT ('INIT'),  -- INIT/SUCCESS/FAILED
    TransactionRef NVARCHAR(100) NULL,
    PaidAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Payments_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_Payments_Order FOREIGN KEY(OrderId) REFERENCES sales.Orders(Id) ON DELETE CASCADE
);
GO

CREATE UNIQUE INDEX UX_Payments_TransactionRef ON sales.Payments(TransactionRef) WHERE TransactionRef IS NOT NULL;
CREATE INDEX IX_Payments_OrderId ON sales.Payments(OrderId, Status);
GO

CREATE TABLE sales.Shipments (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    OrderId BIGINT NOT NULL,
    ReceiverName NVARCHAR(200) NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    AddressLine NVARCHAR(500) NOT NULL,
    Ward NVARCHAR(100) NULL,
    District NVARCHAR(100) NULL,
    City NVARCHAR(100) NULL,
    ShippingStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_Shipments_Status DEFAULT ('READY'),  -- READY/SHIPPED/DELIVERED/CANCELLED
    ShippedAt DATETIME2(0) NULL,
    DeliveredAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Shipments_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_Shipments_Order FOREIGN KEY(OrderId) REFERENCES sales.Orders(Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_Shipments_OrderId ON sales.Shipments(OrderId, ShippingStatus);
GO

-- =====================================================================
-- PHẦN 6: MEMBERSHIP + QUYỀN XEM CÔNG THỨC
-- =====================================================================
CREATE TABLE sales.Subscriptions (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL,
    ProductId BIGINT NOT NULL,  -- product type=MEMBERSHIP
    Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Subscriptions_Status DEFAULT ('ACTIVE'),  -- ACTIVE/EXPIRED/CANCELLED
    StartAt DATETIME2(0) NOT NULL CONSTRAINT DF_Subscriptions_Start DEFAULT (SYSDATETIME()),
    EndAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Subscriptions_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_Subscriptions_User FOREIGN KEY(UserId) REFERENCES auth.Users(Id),
    CONSTRAINT FK_Subscriptions_Product FOREIGN KEY(ProductId) REFERENCES catalog.Products(Id)
);
GO

CREATE INDEX IX_Subscriptions_User ON sales.Subscriptions(UserId, Status, EndAt);
GO

CREATE TABLE content.RecipeAccess (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL,
    RecipeId BIGINT NOT NULL,
    SourceType NVARCHAR(30) NOT NULL,  -- ORDER/SUBSCRIPTION/ADMIN_GRANT
    SourceId BIGINT NOT NULL,
    GrantedAt DATETIME2(0) NOT NULL CONSTRAINT DF_RecipeAccess_Granted DEFAULT (SYSDATETIME()),
    ExpiresAt DATETIME2(0) NULL,
    CONSTRAINT FK_RecipeAccess_User FOREIGN KEY(UserId) REFERENCES auth.Users(Id),
    CONSTRAINT FK_RecipeAccess_Recipe FOREIGN KEY(RecipeId) REFERENCES content.Recipes(Id),
    CONSTRAINT UQ_RecipeAccess UNIQUE (UserId, RecipeId, SourceType, SourceId)
);
GO

CREATE INDEX IX_RecipeAccess_UserRecipe ON content.RecipeAccess(UserId, RecipeId, ExpiresAt);
GO

-- =====================================================================
-- PHẦN 7: "MUA + DÙNG" MỚI ĐƯỢC REVIEW
-- =====================================================================
CREATE TABLE sales.ProductUsage (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL,
    OrderItemId BIGINT NOT NULL,
    Status NVARCHAR(20) NOT NULL CONSTRAINT DF_ProductUsage_Status DEFAULT ('PURCHASED'),  -- PURCHASED/USED
    UsedAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_ProductUsage_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_ProductUsage_User FOREIGN KEY(UserId) REFERENCES auth.Users(Id),
    CONSTRAINT FK_ProductUsage_OrderItem FOREIGN KEY(OrderItemId) REFERENCES sales.OrderItems(Id),
    CONSTRAINT UQ_ProductUsage UNIQUE (UserId, OrderItemId)
);
GO

CREATE INDEX IX_ProductUsage_UserStatus ON sales.ProductUsage(UserId, Status);
GO

CREATE TABLE content.Reviews (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL,
    TargetType NVARCHAR(20) NOT NULL,  -- PRODUCT/RECIPE
    TargetId BIGINT NOT NULL,          -- ProductId hoặc RecipeId
    Rating INT NOT NULL CONSTRAINT CK_Reviews_Rating CHECK (Rating BETWEEN 1 AND 5),
    Content NVARCHAR(MAX) NULL,
    Channel NVARCHAR(20) NOT NULL CONSTRAINT DF_Reviews_Channel DEFAULT ('IN_APP'),  -- IN_APP/EXTERNAL
    IsVerified BIT NOT NULL CONSTRAINT DF_Reviews_Verified DEFAULT (0),
    VerifiedAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Reviews_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_Reviews_User FOREIGN KEY(UserId) REFERENCES auth.Users(Id)
);
GO

CREATE INDEX IX_Reviews_Target ON content.Reviews(TargetType, TargetId, IsVerified);
CREATE INDEX IX_Reviews_User ON content.Reviews(UserId);
GO

-- =====================================================================
-- PHẦN 8: UGC (USER GENERATED CONTENT)
-- =====================================================================
CREATE TABLE ugc.RecipeSubmissions (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    [Desc] NVARCHAR(1000) NULL,
    Ingredients NVARCHAR(MAX) NULL,
    Steps NVARCHAR(MAX) NULL,
    Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Submissions_Status DEFAULT ('PENDING'),  -- PENDING/APPROVED/REJECTED/PUBLISHED
    AdminNote NVARCHAR(1000) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Submissions_CreatedAt DEFAULT (SYSDATETIME()),
    ReviewedAt DATETIME2(0) NULL,
    CONSTRAINT FK_Submissions_User FOREIGN KEY(UserId) REFERENCES auth.Users(Id)
);
GO

CREATE INDEX IX_Submissions_Status ON ugc.RecipeSubmissions(Status);
CREATE INDEX IX_Submissions_User ON ugc.RecipeSubmissions(UserId);
GO

CREATE TABLE ugc.SubmissionMedia (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    SubmissionId BIGINT NOT NULL,
    MediaType NVARCHAR(20) NOT NULL,  -- IMAGE/VIDEO
    Url NVARCHAR(500) NOT NULL,
    Position INT CONSTRAINT DF_SubmissionMedia_Position DEFAULT (0),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SubmissionMedia_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_SubmissionMedia_Sub FOREIGN KEY(SubmissionId) REFERENCES ugc.RecipeSubmissions(Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_SubmissionMedia_SubmissionId ON ugc.SubmissionMedia(SubmissionId);
GO

CREATE TABLE ugc.SubmissionRewards (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    SubmissionId BIGINT NOT NULL UNIQUE,
    PrizeMoney DECIMAL(12,2) NULL,
    CertificateUrl NVARCHAR(500) NOT NULL,
    SentEmailAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SubmissionRewards_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_SubmissionRewards_Sub FOREIGN KEY(SubmissionId) REFERENCES ugc.RecipeSubmissions(Id) ON DELETE CASCADE
);
GO

CREATE TABLE content.TopRecipes (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    RecipeId BIGINT NOT NULL UNIQUE,
    RankScore DECIMAL(12,4) NOT NULL CONSTRAINT DF_TopRecipes_Score DEFAULT (0),
    FeaturedFrom DATE NOT NULL CONSTRAINT DF_TopRecipes_From DEFAULT (CONVERT(date, GETDATE())),
    FeaturedTo DATE NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_TopRecipes_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_TopRecipes_Recipe FOREIGN KEY(RecipeId) REFERENCES content.Recipes(Id) ON DELETE CASCADE
);
GO

-- =====================================================================
-- PHẦN 9: VIEW TIỆN DÙNG
-- =====================================================================
CREATE OR ALTER VIEW content.vw_RecipePreview
AS
SELECT 
    r.Id AS RecipeId,
    r.Title,
    r.ShortDesc,
    r.Visibility,
    r.Status,
    p.Id AS ProductId,
    p.Price,
    p.Currency,
    (SELECT TOP 1 Url FROM content.RecipeMedia rm 
     WHERE rm.RecipeId = r.Id AND rm.MediaRole = 'TRAILER' 
     ORDER BY rm.Id DESC) AS TrailerUrl,
    r.CreatedAt
FROM content.Recipes r
JOIN catalog.Products p ON p.Id = r.ProductId
WHERE r.Status = 'PUBLISHED';
GO

CREATE OR ALTER VIEW content.vw_UserRecipeAccess
AS
SELECT 
    ra.Id,
    ra.UserId,
    ra.RecipeId,
    ra.SourceType,
    ra.SourceId,
    ra.GrantedAt,
    ra.ExpiresAt
FROM content.RecipeAccess ra
WHERE ra.ExpiresAt IS NULL OR ra.ExpiresAt > SYSDATETIME();
GO

CREATE OR ALTER VIEW sales.vw_UserActiveSubscription
AS
SELECT 
    s.Id,
    s.UserId,
    s.ProductId,
    s.Status,
    s.StartAt,
    s.EndAt
FROM sales.Subscriptions s
WHERE s.Status = 'ACTIVE' AND (s.EndAt IS NULL OR s.EndAt > SYSDATETIME());
GO
