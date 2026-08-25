# 📚 BOOKVAULT

> **"Never buy the same book twice."** — *Không bao giờ mua trùng một cuốn sách hai lần.*

**BookVault** là ứng dụng tủ sách số cá nhân chuẩn phong cách Editorial, được xây dựng để giúp bạn quản lý toàn bộ bộ sưu tập sách vật lý và ấn bản điện tử, lưu trữ ảnh chụp thực tế của sách, theo dõi tiến độ đọc từng trang, ghi chú những trích dẫn đắt giá và tra cứu tức thì khi đang đứng tại nhà sách để tránh mua trùng sách.

---

## ✨ Điểm Nổi Bật & Tính Năng Chính

### 1. 🔍 Tình huống Nhà Sách & Tra cứu tức thì (`⌘K`)
- Tra cứu nhanh theo **Tên sách**, **Tác giả** hoặc **Mã ISBN-10 / ISBN-13**.
- Cảnh báo rõ ràng: **"BẠN ĐÃ SỞ HỮU CUỐN SÁCH NÀY"** kèm thông tin mua hàng (Ngày mua, Nhà sách đã mua: Fahasa/Nhã Nam..., Giá tiền) để quyết định ngay tại chỗ không mua trùng.

### 2. 📖 Tủ Sách Số Cá Nhân (Digital Bookshelf)
- Phân loại trực quan:
  - 🟢 **Đang sở hữu (`OWNED`)**
  - 🔵 **Đang đọc (`READING`)**
  - ⚪ **Đã đọc (`READ`)**
  - 🟡 **Muốn đọc / Wishlist (`WISHLIST`)**
  - 🔴 **Đã bỏ (`DROPPED`)**
- Hiển thị linh hoạt ở dạng **Lưới (Grid)** và **Danh sách (List)**.
- Bìa sách có hiệu ứng đổ bóng 3D chân thực, tự động tạo bìa Editorial Typography nếu chưa có ảnh chụp.

### 3. 📷 Lưu Giữ Ảnh Chụp Sách Thật (Physical Book Photos)
- Tải lên ảnh thực tế từ điện thoại hoặc máy tính lưu trữ an toàn trên **Supabase Storage** (Private Bucket `book-images/`).
- Hỗ trợ các góc chụp: **Bìa trước (`COVER`)**, **Bìa sau (`BACK_COVER`)**, **Gáy sách (`SPINE`)**, **Mã vạch (`ISBN`)**, **Khác (`OTHER`)**.
- Tự động tạo URL bảo mật có chữ ký (Signed URL 24h), cho phép đặt làm ảnh bìa chính hoặc xem ảnh gốc kích thước lớn.

### 4. ⏱️ Theo Dõi Tiến Độ & Nhật Ký Đọc (Reading Sessions)
- Cập nhật số trang đang đọc và thanh tiến độ hoàn thành (%).
- Tự động chuyển trạng thái sang **Đã đọc** khi đạt tổng số trang.
- Ghi nhật ký từng phiên đọc (Số trang đọc, Thời lượng tính theo phút, Ngày đọc) và xem dòng thời gian lịch sử đọc sách.

### 5. 📝 Ghi Chú & Trích Dẫn Theo Trang (Book Notes)
- Lưu các bài học và câu trích dẫn tâm đắc gắn liền với số trang cụ thể.
- Trang tổng hợp ghi chú toàn thư viện (`/app/notes`) cho phép tìm kiếm nhanh theo nội dung câu chữ.

### 6. 🏷️ Thẻ Phân Loại Tuỳ Chỉnh (Custom Tags)
- Tạo thẻ cá nhân kèm bảng màu (ví dụ: `#KinhDoanh`, `#LapTrinh`, `#TamLyHoc`, `#DocLai`).
- Gắn nhiều thẻ cho một cuốn sách và lọc tủ sách theo thẻ nhanh chóng.

### 7. 🇻🇳 Bản Địa Hoá Tiếng Việt & Thiết Kế Editorial
- Toàn bộ giao diện bằng Tiếng Việt thân thiện.
- Định dạng tiền tệ Việt Nam đồng (`₫`) và định dạng ngày tháng `dd/MM/yyyy`.
- Tích hợp bộ font tiếng Việt cao cấp: **Lora** (Serif) & **Be Vietnam Pro** (Sans-serif).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework**: [Next.js 16+](https://nextjs.org/) (App Router, Server Components & Client Components).
- **Ngôn ngữ**: [TypeScript](https://www.typescriptlang.org/) (Strict mode, Type-safe).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Tone màu ấm Editorial (`#FAF8F5`, `#1E3A2F`, `#F3EEE7`).
- **Database & Backend**: [Supabase](https://supabase.com/)
  - **Supabase Auth**: Đăng ký, đăng nhập, khôi phục mật khẩu, bảo mật phiên làm việc.
  - **PostgreSQL**: RLS (Row Level Security), Trigger tự động đồng bộ Profile, View `my_library`.
  - **Supabase Storage**: Bucket riêng tư `book-images`.
- **Quản lý State & Cache**: [@tanstack/react-query](https://tanstack.com/query) v5.
- **Icons & Thông báo**: [Lucide React](https://lucide.dev/) & [Sonner](https://sonner.emilkowal.ski/).

---

## 🗄️ Cấu Trúc Cơ Sở Dữ Liệu (Database Schema)

Cơ sở dữ liệu dựa trên tệp [`db.md`](./db.md) với các bảng chính:

```
auth.users (Supabase Auth)
  └── profiles (id, display_name, avatar_url, updated_at)

books (id, title, subtitle, author, publisher, isbn_10, isbn_13, language, release_year, description, page_count)
  ├── book_images (id, book_id, image_url, storage_path, image_type, is_primary, sort_order)
  └── user_books (id, user_id, book_id, status, rating, purchase_price, purchase_date, purchase_store, current_page, notes)
        ├── reading_sessions (id, user_book_id, started_at, ended_at, start_page, end_page, duration_minutes)
        ├── book_notes (id, user_book_id, title, content, page_number)
        └── book_tags (user_book_id, tag_id)
              └── tags (id, user_id, name, color)

View:
  └── public.my_library (kết hợp user_books + books để hiển thị và tính toán tiến độ đọc)
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Getting Started)

### 1. Yêu cầu môi trường
- Node.js 18+ hoặc 20+
- npm, yarn, pnpm hoặc bun

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Cấu hình Biến Môi Trường
Tạo file `.env.local` ở thư mục gốc của dự án với các thông số từ dự án Supabase của bạn:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Chạy Development Server
```bash
npm run dev
```

Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000).

### 5. Build Kiểm Tra Production
```bash
npm run build
```

---

## 📁 Cấu Trúc Thư Mục Dự Án (Project Structure)

```
bookvault/
├── src/
│   ├── app/                         # Next.js App Router Pages
│   │   ├── page.tsx                 # Landing page
│   │   ├── login/page.tsx           # Đăng nhập
│   │   ├── register/page.tsx        # Đăng ký
│   │   ├── forgot-password/page.tsx # Quên mật khẩu
│   │   ├── reset-password/page.tsx  # Đặt lại mật khẩu
│   │   └── app/                     # Authenticated App
│   │       ├── layout.tsx           # App layout wrapper
│   │       ├── dashboard/page.tsx   # Tổng quan & Tiếp tục đọc
│   │       ├── library/page.tsx     # Tủ sách của tôi (Grid/List)
│   │       ├── library/[id]/page.tsx# Chi tiết sách, ảnh, nhật ký, ghi chú
│   │       ├── reading/page.tsx     # Sách đang đọc
│   │       ├── wishlist/page.tsx    # Sách muốn mua
│   │       ├── notes/page.tsx       # Tổng hợp ghi chú
│   │       ├── tags/page.tsx        # Quản lý thẻ
│   │       └── settings/page.tsx    # Cài đặt tài khoản & Profile
│   ├── components/
│   │   ├── books/                   # BookCard, BookCover, BookGrid, BookSearchModal, AddBookModal...
│   │   ├── reading/                 # ReadingProgressCard, ReadingSessionModal, ReadingHistory...
│   │   ├── notes/                   # NoteCard, NoteFormModal...
│   │   ├── tags/                    # TagManager...
│   │   ├── layout/                  # Sidebar, Header, MobileNav, AppLayout...
│   │   ├── ui/                      # Button, Input, Textarea, Modal, Skeleton, Badge...
│   │   └── common/                  # EmptyState, ConfirmDialog...
│   ├── hooks/                       # useUser, useLibrary, useReading, useNotes, useTags
│   ├── services/                    # books, library, reading, notes, tags, storage, auth
│   ├── types/                       # database.ts
│   ├── lib/                         # Supabase clients (client.ts, server.ts, middleware.ts) & utils.ts
│   └── proxy.ts                     # Next.js 16 Session Middleware
├── db.md                            # Database schema source of truth
├── package.json
└── README.md
```

---

## 🔒 Bảo Mật & RLS (Security)
- RLS (Row Level Security) được kích hoạt trên tất cả các bảng. Người dùng chỉ có quyền đọc/ghi dữ liệu liên quan đến tài khoản của chính mình (`auth.uid() = user_id`).
- Bucket `book-images` ở chế độ Private; ảnh chỉ được xem thông qua chữ ký xác thực (Signed URLs).
- Tuyệt đối không để lộ `SUPABASE_SERVICE_ROLE_KEY` ở phía client-side.

---

## 📜 Giấy Phép
Dự án được phát triển dưới giấy phép MIT.
