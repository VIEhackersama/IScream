-- =====================================================================
--   STORED PROCEDURES - LUỒNG HOÀN CHỈNH
--   Giải thích:
--   A) sp_CreateOrder: tạo đơn
--   B) sp_AddOrderItem: thêm dòng sản phẩm
--   C) sp_MarkPaymentSuccess: ghi payment + cấp quyền + tạo subscription
--   D) sp_MarkOrderDelivered: hoàn thành đơn + tạo usage
--   E) sp_MarkUsed: user xác nhận đã dùng
--   F) sp_CreateReview: tạo review, auto-verify theo rule
-- =====================================================================

USE IceCreamRecipeDB;
GO

-- =====================================================================
-- A) Tạo đơn hàng mới
-- =====================================================================
CREATE OR ALTER PROCEDURE sales.sp_CreateOrder
    @UserId BIGINT,
    @OrderCode NVARCHAR(50),
    @TotalAmount DECIMAL(12,2),
    @Currency NVARCHAR(10) = 'VND'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO sales.Orders(UserId, OrderCode, Status, TotalAmount, Currency)
        VALUES(@UserId, @OrderCode, 'PENDING', @TotalAmount, @Currency);

        SELECT SCOPE_IDENTITY() AS OrderId;
    END TRY
    BEGIN CATCH
        THROW 50001, 'Error creating order', 1;
    END CATCH
END
GO

-- =====================================================================
-- B) Thêm sản phẩm vào đơn
-- =====================================================================
CREATE OR ALTER PROCEDURE sales.sp_AddOrderItem
    @OrderId BIGINT,
    @ProductId BIGINT,
    @Qty INT = 1,
    @UnitPrice DECIMAL(12,2)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @Type NVARCHAR(30);
        SELECT @Type = Type FROM catalog.Products WHERE Id = @ProductId;

        IF @Type IS NULL
            THROW 50002, 'Product not found', 1;

        INSERT INTO sales.OrderItems(OrderId, ProductId, Quantity, UnitPrice, ItemTypeSnapshot)
        VALUES(@OrderId, @ProductId, @Qty, @UnitPrice, @Type);

        SELECT SCOPE_IDENTITY() AS OrderItemId;
    END TRY
    BEGIN CATCH
        THROW 50003, 'Error adding order item', 1;
    END CATCH
END
GO

-- =====================================================================
-- C) Ghi nhận thanh toán thành công
--    - Cấp quyền xem recipe (nếu mua RECIPE)
--    - Tạo subscription nước (nếu mua MEMBERSHIP, 30 ngày)
-- =====================================================================
CREATE OR ALTER PROCEDURE sales.sp_MarkPaymentSuccess
    @OrderId BIGINT,
    @Provider NVARCHAR(50),
    @Amount DECIMAL(12,2),
    @TransactionRef NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRAN;

        -- Ghi payment record
        INSERT INTO sales.Payments(OrderId, Provider, Amount, Status, TransactionRef, PaidAt)
        VALUES(@OrderId, @Provider, @Amount, 'SUCCESS', @TransactionRef, SYSDATETIME());

        -- Update order status
        UPDATE sales.Orders
        SET Status = 'PAID', UpdatedAt = SYSDATETIME()
        WHERE Id = @OrderId;

        DECLARE @UserId BIGINT;
        SELECT @UserId = UserId FROM sales.Orders WHERE Id = @OrderId;

        -- Cấp quyền xem RECIPE (nếu mua RECIPE)
        INSERT INTO content.RecipeAccess(UserId, RecipeId, SourceType, SourceId, ExpiresAt)
        SELECT 
            @UserId,
            r.Id AS RecipeId,
            'ORDER',
            @OrderId,
            NULL  -- Không hết hạn
        FROM sales.OrderItems oi
        JOIN catalog.Products p ON p.Id = oi.ProductId AND p.Type = 'RECIPE'
        JOIN content.Recipes r ON r.ProductId = p.Id
        WHERE oi.OrderId = @OrderId
          AND NOT EXISTS (
              SELECT 1 FROM content.RecipeAccess ra
              WHERE ra.UserId = @UserId AND ra.RecipeId = r.Id
          );

        -- Tạo subscription (30 ngày nếu mua MEMBERSHIP)
        INSERT INTO sales.Subscriptions(UserId, ProductId, Status, StartAt, EndAt)
        SELECT 
            @UserId,
            oi.ProductId,
            'ACTIVE',
            SYSDATETIME(),
            DATEADD(DAY, 30, SYSDATETIME())
        FROM sales.OrderItems oi
        JOIN catalog.Products p ON p.Id = oi.ProductId AND p.Type = 'MEMBERSHIP'
        WHERE oi.OrderId = @OrderId;

        COMMIT;
        
        SELECT 1 AS Success;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW 50004, 'Error marking payment success', 1;
    END CATCH
END
GO

-- =====================================================================
-- D) Đánh dấu đơn đã giao thành công
--    - Tạo ProductUsage (PURCHASED) cho item kem để track dùng không
-- =====================================================================
CREATE OR ALTER PROCEDURE sales.sp_MarkOrderDelivered
    @OrderId BIGINT,
    @DeliveredAt DATETIME2(0) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @DeliveredAt IS NULL SET @DeliveredAt = SYSDATETIME();

    BEGIN TRY
        BEGIN TRAN;

        UPDATE sales.Orders
        SET Status = 'COMPLETED', UpdatedAt = SYSDATETIME()
        WHERE Id = @OrderId;

        UPDATE sales.Shipments
        SET ShippingStatus = 'DELIVERED', DeliveredAt = @DeliveredAt
        WHERE OrderId = @OrderId;

        DECLARE @UserId BIGINT;
        SELECT @UserId = UserId FROM sales.Orders WHERE Id = @OrderId;

        -- Tạo usage record cho item kem (để kiểm điều kiện review)
        INSERT INTO sales.ProductUsage(UserId, OrderItemId, Status)
        SELECT @UserId, oi.Id, 'PURCHASED'
        FROM sales.OrderItems oi
        JOIN catalog.Products p ON p.Id = oi.ProductId AND p.Type = 'ICECREAM'
        WHERE oi.OrderId = @OrderId
          AND NOT EXISTS (
              SELECT 1 FROM sales.ProductUsage pu 
              WHERE pu.UserId = @UserId AND pu.OrderItemId = oi.Id
          );

        COMMIT;
        
        SELECT 1 AS Success;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW 50005, 'Error marking order delivered', 1;
    END CATCH
END
GO

-- =====================================================================
-- E) Đánh dấu đã dùng
-- =====================================================================
CREATE OR ALTER PROCEDURE sales.sp_MarkUsed
    @UserId BIGINT,
    @OrderItemId BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE sales.ProductUsage
        SET Status = 'USED', UsedAt = SYSDATETIME()
        WHERE UserId = @UserId AND OrderItemId = @OrderItemId;

        SELECT 1 AS Success;
    END TRY
    BEGIN CATCH
        THROW 50006, 'Error marking product as used', 1;
    END CATCH
END
GO

-- =====================================================================
-- F) Tạo review
--    - AUTO VERIFY nếu user PURCHASED + USED (cho PRODUCT)
--    - AUTO VERIFY nếu user có RECIPE ACCESS (cho RECIPE)
-- =====================================================================
CREATE OR ALTER PROCEDURE content.sp_CreateReview
    @UserId BIGINT,
    @TargetType NVARCHAR(20),  -- PRODUCT/RECIPE
    @TargetId BIGINT,
    @Rating INT,
    @Content NVARCHAR(MAX) = NULL,
    @Channel NVARCHAR(20) = 'IN_APP'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @IsVerified BIT = 0;
        DECLARE @VerifiedAt DATETIME2(0) = NULL;

        -- Check PRODUCT: đã PURCHASED + USED ?
        IF @TargetType = 'PRODUCT'
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM sales.ProductUsage pu
                JOIN sales.OrderItems oi ON oi.Id = pu.OrderItemId
                WHERE pu.UserId = @UserId
                  AND pu.Status = 'USED'
                  AND oi.ProductId = @TargetId
            )
            BEGIN
                SET @IsVerified = 1;
                SET @VerifiedAt = SYSDATETIME();
            END
        END

        -- Check RECIPE: có quyền xem ?
        IF @TargetType = 'RECIPE'
        BEGIN
            IF EXISTS (
                SELECT 1 
                FROM content.vw_UserRecipeAccess a
                WHERE a.UserId = @UserId AND a.RecipeId = @TargetId
            )
            BEGIN
                SET @IsVerified = 1;
                SET @VerifiedAt = SYSDATETIME();
            END
        END

        INSERT INTO content.Reviews(UserId, TargetType, TargetId, Rating, Content, Channel, IsVerified, VerifiedAt)
        VALUES(@UserId, @TargetType, @TargetId, @Rating, @Content, @Channel, @IsVerified, @VerifiedAt);

        SELECT SCOPE_IDENTITY() AS ReviewId, @IsVerified AS IsVerified;
    END TRY
    BEGIN CATCH
        THROW 50007, 'Error creating review', 1;
    END CATCH
END
GO

-- =====================================================================
-- G) Approve UGC Submission -> tạo recipe + toprecipes
-- =====================================================================
CREATE OR ALTER PROCEDURE ugc.sp_ApproveSubmission
    @SubmissionId BIGINT,
    @RecipeProductId BIGINT,
    @PrizeMoney DECIMAL(12,2) = 0,
    @CertificateUrl NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRAN;

        -- Update submission
        UPDATE ugc.RecipeSubmissions
        SET Status = 'APPROVED', ReviewedAt = SYSDATETIME()
        WHERE Id = @SubmissionId;

        -- Tạo reward
        INSERT INTO ugc.SubmissionRewards(SubmissionId, PrizeMoney, CertificateUrl)
        VALUES(@SubmissionId, @PrizeMoney, @CertificateUrl);

        -- Tạo top recipe entry (auto featured)
        DECLARE @RecipeId BIGINT;
        SELECT @RecipeId = r.Id 
        FROM content.Recipes r 
        WHERE r.ProductId = @RecipeProductId;

        IF @RecipeId IS NOT NULL
        BEGIN
            INSERT INTO content.TopRecipes(RecipeId, RankScore, FeaturedFrom)
            VALUES(@RecipeId, 50, CONVERT(date, GETDATE()))
            WHERE NOT EXISTS (
                SELECT 1 FROM content.TopRecipes tr WHERE tr.RecipeId = @RecipeId
            );
        END

        COMMIT;
        
        SELECT 1 AS Success;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW 50008, 'Error approving submission', 1;
    END CATCH
END
GO

-- =====================================================================
-- H) Reject UGC submission
-- =====================================================================
CREATE OR ALTER PROCEDURE ugc.sp_RejectSubmission
    @SubmissionId BIGINT,
    @AdminNote NVARCHAR(1000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE ugc.RecipeSubmissions
        SET Status = 'REJECTED', AdminNote = @AdminNote, ReviewedAt = SYSDATETIME()
        WHERE Id = @SubmissionId;

        SELECT 1 AS Success;
    END TRY
    BEGIN CATCH
        THROW 50009, 'Error rejecting submission', 1;
    END CATCH
END
GO

-- =====================================================================
-- I) Tạo shipment cho order
-- =====================================================================
CREATE OR ALTER PROCEDURE sales.sp_CreateShipment
    @OrderId BIGINT,
    @ReceiverName NVARCHAR(200),
    @Phone NVARCHAR(20),
    @AddressLine NVARCHAR(500),
    @Ward NVARCHAR(100) = NULL,
    @District NVARCHAR(100) = NULL,
    @City NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO sales.Shipments(OrderId, ReceiverName, Phone, AddressLine, Ward, District, City, ShippingStatus)
        VALUES(@OrderId, @ReceiverName, @Phone, @AddressLine, @Ward, @District, @City, 'READY');

        SELECT SCOPE_IDENTITY() AS ShipmentId;
    END TRY
    BEGIN CATCH
        THROW 50010, 'Error creating shipment', 1;
    END CATCH
END
GO

-- =====================================================================
-- J) Update membership subscription status
-- =====================================================================
CREATE OR ALTER PROCEDURE sales.sp_UpdateSubscriptionStatus
    @SubscriptionId BIGINT,
    @NewStatus NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE sales.Subscriptions
        SET Status = @NewStatus
        WHERE Id = @SubscriptionId;

        SELECT 1 AS Success;
    END TRY
    BEGIN CATCH
        THROW 50011, 'Error updating subscription', 1;
    END CATCH
END
GO
