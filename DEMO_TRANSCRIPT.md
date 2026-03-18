# 🍦 IScream — Demo Video Transcript

---

## 🇻🇳 Bản tiếng Việt

---

### [CẢNH MỞ ĐẦU — Màn hình trang chủ]

Xin chào và chào mừng đến với **IScream** — nền tảng chia sẻ công thức kem và mua sắm dựa trên thành viên, được xây dựng bằng **Next.js**, **C# Azure Functions** và **SQL Server**.

---

### [Trang chủ — `/`]

Ngay tại trang chủ, người dùng được chào đón bởi một **banner nổi bật** giới thiệu IScream, cùng với bộ sưu tập **công thức kem hàng đầu** và một lời mời khám phá **cửa hàng sách kem**.

---

### [Duyệt công thức — `/recipes`]

Bấm vào mục **Công thức**, chúng ta có thể xem danh sách công thức với thanh tìm kiếm và phân trang. Người dùng chưa đăng nhập có thể đọc mô tả, nhưng khi mở chi tiết, **nguyên liệu và các bước thực hiện sẽ bị khóa** — đây là nội dung dành riêng cho thành viên.

---

### [Đăng ký & Đăng nhập — `/register`, `/login`]

Để trải nghiệm đầy đủ, người dùng **đăng ký tài khoản** với tên, email và mật khẩu. Sau đó **đăng nhập** — hệ thống sử dụng **JWT** để xác thực, mật khẩu được mã hóa bằng **BCrypt**. Sau khi đăng nhập thành công, người dùng có thể quản lý hồ sơ, lịch sử đơn hàng và gói thành viên tại trang `/profile`.

---

### [Đăng ký gói thành viên — `/membership`]

Tại trang **Membership**, người dùng xem các gói đăng ký khả dụng — ví dụ gói **MONTHLY** hay **YEARLY** — với mức giá và tính năng đi kèm. Sau khi chọn gói, hệ thống chuyển đến trang **thanh toán**, nơi người dùng nhập thông tin thẻ và hoàn tất giao dịch. Ngay sau khi thanh toán thành công, tài khoản **tự động được kích hoạt gói VIP**.

---

### [Nội dung VIP — `/membership/vip/recipes`]

Bây giờ, truy cập vào khu **VIP Recipes** — toàn bộ công thức kem cao cấp hiện ra với đầy đủ nguyên liệu, định lượng và các bước chế biến chi tiết. Đây là nội dung chỉ dành cho thành viên đang có gói hoạt động.

---

### [Cửa hàng — `/shop`]

Chuyển sang mục **Shop** — người dùng có thể tìm kiếm và mua **sách công thức kem** cùng các sản phẩm liên quan. Thêm sản phẩm vào giỏ hàng, tiến hành thanh toán tại `/shop/checkout`, và đơn hàng được tạo với trạng thái **PENDING**.

---

### [Theo dõi đơn hàng]

Ngay cả khi không đăng nhập, người dùng vẫn có thể **tra cứu đơn hàng** bằng mã đơn hàng và địa chỉ email — một tính năng tiện lợi cho khách vãng lai.

---

### [Gửi công thức — `/submit`]

IScream khuyến khích cộng đồng đóng góp. Tại trang **Submit**, bất kỳ ai — kể cả khách không đăng nhập — đều có thể gửi công thức kem của mình với tiêu đề, mô tả, nguyên liệu, các bước và ảnh minh họa. Công thức được gửi lên với trạng thái **PENDING** để chờ admin xét duyệt.

---

### [Gửi phản hồi — `/feedback`]

Người dùng cũng có thể **gửi phản hồi** qua form đơn giản với tên, email và nội dung tin nhắn.

---

### [Bảng điều khiển Admin — `/admin/dashboard`]

Bây giờ đăng nhập với tài khoản **Admin**. Dashboard tổng quan hiển thị ngay các chỉ số quan trọng: tổng số đơn hàng, số công thức đang chờ duyệt, số thành viên đang hoạt động và danh sách đơn hàng gần nhất.

---

### [Quản lý công thức — `/admin/recipes`]

Admin có thể **tạo mới, chỉnh sửa và xóa mềm** công thức kem. Mỗi công thức bao gồm tên hương vị, mô tả, nguyên liệu, quy trình chế biến và ảnh đại diện.

---

### [Quản lý sản phẩm — `/admin/items`]

Tương tự, trang **Items** cho phép admin quản lý kho hàng — tạo, cập nhật hoặc ẩn sản phẩm với giá, tiền tệ, số lượng tồn kho và hình ảnh.

---

### [Quản lý đơn hàng — `/admin/orders`]

Tại trang **Orders**, admin thấy toàn bộ danh sách đơn hàng, có thể lọc theo **trạng thái** và **khoảng thời gian**. Admin cập nhật trạng thái đơn hàng từ **PENDING → PROCESSING → COMPLETED → DELIVERED**.

---

### [Xét duyệt công thức cộng đồng — `/admin/contributions`]

Mọi công thức do cộng đồng gửi lên đều qua trang **Contributions**. Admin xem nội dung, sau đó **duyệt để xuất bản** lên catalog chính thức, hoặc **từ chối** — toàn bộ quá trình chỉ một cú nhấp chuột.

---

### [Quản lý người dùng — `/admin/users`]

Admin có thể xem danh sách toàn bộ người dùng, kèm thông tin vai trò và trạng thái, và thực hiện **khóa** hoặc **mở khóa** tài khoản ngay trên bảng.

---

### [Quản lý phản hồi — `/admin/feedback`]

Cuối cùng, trang **Feedback** tổng hợp mọi phản hồi từ người dùng. Admin đọc chi tiết và đánh dấu **đã đọc** để theo dõi trạng thái xử lý.

---

### [CẢNH KẾT — Màn hình tổng quan]

Đó là toàn bộ nền tảng **IScream** — từ trải nghiệm người dùng phong phú với công thức, thành viên và mua sắm, đến bộ công cụ quản trị toàn diện cho admin. Được xây dựng trên **Next.js**, **Azure Functions .NET 10** và **SQL Server** — một giải pháp hiện đại, an toàn và dễ mở rộng. Cảm ơn bạn đã xem!

---
---

## 🇬🇧 English Version

---

### [OPENING — Homepage on screen]

Hello and welcome to **IScream** — a membership-based ice cream recipe sharing and e-commerce platform built with **Next.js**, **C# Azure Functions**, and **SQL Server**.

---

### [Homepage — `/`]

Right on the homepage, visitors are greeted by a **hero banner** showcasing IScream, a curated list of **top ice cream recipes**, and a call-to-action leading to the **ice cream book shop**.

---

### [Browse Recipes — `/recipes`]

Clicking into **Recipes**, we see a searchable, paginated list of ice cream recipes. Guests can read descriptions, but when opening a recipe detail page, the **ingredients and preparation steps are locked** — this content is reserved for active members.

---

### [Register & Login — `/register`, `/login`]

To unlock the full experience, users **create an account** with a name, email, and password, then **log in**. The system uses **JWT-based authentication** with **BCrypt password hashing**. Once signed in, users can manage their profile, order history, and subscription at the `/profile` page.

---

### [Membership Subscription — `/membership`]

On the **Membership** page, users browse available subscription plans — for example **MONTHLY** or **YEARLY** — complete with pricing and included features. After selecting a plan, users are taken to the **checkout page** to enter card details and complete payment. On a successful transaction, the account is **immediately upgraded to VIP status**.

---

### [VIP Content — `/membership/vip/recipes`]

Now with an active subscription, navigating to **VIP Recipes** reveals the full premium catalog — every recipe now shows complete ingredient lists, quantities, and step-by-step instructions. This content is exclusively accessible to members with an active subscription.

---

### [Shop — `/shop`]

Switching to the **Shop**, users can search and purchase **ice cream recipe books** and related merchandise. Adding items to the cart and checking out at `/shop/checkout` creates an order with a **PENDING** status.

---

### [Order Tracking]

Even without being logged in, anyone can **track their order** by entering an order number and email address — a convenient feature for guest shoppers.

---

### [Submit a Recipe — `/submit`]

IScream encourages community participation. On the **Submit** page, anyone — even guests — can contribute their own ice cream recipe by filling in a title, description, ingredients, steps, and an image. The submission is created with **PENDING** status and queued for admin review.

---

### [Submit Feedback — `/feedback`]

Users can also **send general feedback** through a simple form with their name, email, and message.

---

### [Admin Dashboard — `/admin/dashboard`]

Now let's log in as an **Admin**. The dashboard immediately surfaces key metrics: total orders, pending recipe submissions, active members, and a list of the most recent orders, with quick-action links to the most important management areas.

---

### [Recipe Management — `/admin/recipes`]

Admins can **create, edit, and soft-delete** ice cream recipes. Each recipe contains a flavor name, description, ingredient list, preparation procedure, and a cover image.

---

### [Item Management — `/admin/items`]

Similarly, the **Items** page lets admins manage the shop inventory — create, update, or hide products with price, currency, stock quantity, and image.

---

### [Order Management — `/admin/orders`]

On the **Orders** page, admins see a complete order list, filterable by **status** and **date range**. Order status can be advanced from **PENDING → PROCESSING → COMPLETED → DELIVERED**.

---

### [Community Contributions — `/admin/contributions`]

Every recipe submitted by the community flows into the **Contributions** page. Admins review the content and either **approve it to publish** directly to the official recipe catalog, or **reject it** — all with a single click.

---

### [User Management — `/admin/users`]

Admins can view all registered users with their role and account status, and can **suspend or reactivate** any account directly from the table.

---

### [Feedback Management — `/admin/feedback`]

Finally, the **Feedback** page aggregates all user feedback. Admins read individual messages and mark them as **read** to track which items have been handled.

---

### [CLOSING — Overview screen]

That's the complete **IScream** platform — from a rich user experience covering recipes, memberships, and shopping, to a comprehensive admin toolkit. Built on **Next.js**, **Azure Functions .NET 10**, and **SQL Server** — a modern, secure, and scalable solution. Thanks for watching!
