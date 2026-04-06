# PMS Backend API

Hệ thống quản lý trường học (School Management System) - Backend API

## 🚀 Công nghệ sử dụng

- **NestJS** - Framework Node.js
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database (Supabase)
- **JWT** - Authentication
- **Swagger** - API Documentation

## 📁 Cấu trúc thư mục

```
src/
├── features/           # Feature modules
│   ├── approval-flow/  # Quy trình phê duyệt
│   ├── social-message/ # Mạng xã hội & Tin nhắn
│   ├── auth/          # Xác thực
│   ├── users/         # Người dùng
│   ├── academic/      # Học vụ
│   ├── notifications/ # Thông báo
│   └── portal/        # Cổng thông tin
├── shared/            # Shared modules
│   ├── prisma/       # Prisma service
│   └── guards/       # Guards
└── main.ts           # Entry point
```

## 🛠️ Cài đặt

```bash
# Cài đặt dependencies
npm install

# Setup environment
# Copy .env.example thành .env và cập nhật thông tin

# Generate Prisma client
npx prisma generate

# Chạy database migration
npx prisma migrate dev

# Chạy development server
npm run start:dev
```

## 🔐 Environment Variables

```env
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-secret-key"
PORT=3000
```

## 📚 API Documentation

Sau khi chạy server, truy cập: `http://localhost:3000/api`

## 🎯 Features

### 1. Approval Flow (Quy trình phê duyệt)
- Tạo quy trình phê duyệt tùy chỉnh
- Định nghĩa các bước phê duyệt
- Phân quyền người phê duyệt theo vai trò hoặc người dùng cụ thể
- Theo dõi tiến độ phê duyệt

### 2. Social Message (Mạng xã hội & Tin nhắn)
- Bảng tin (Threads feed)
- Like, comment, share
- Follow/Unfollow
- Kết bạn
- Chat real-time

### 3. Academic (Học vụ)
- Quản lý năm học, học kỳ
- Quản lý khối, lớp học
- Phân công giáo viên
- Quản lý điểm
- Lịch học

### 4. Auth (Xác thực)
- Đăng nhập/Đăng ký
- JWT Authentication
- Phân quyền (Admin, Giáo viên, Học sinh, Phụ huynh)

## 🚀 Deployment

### Local Development
```bash
npm run start:dev
```

### Production Build
```bash
npm run build
npm run start:prod
```

### Deploy to Render/Railway/Vercel
1. Push code lên GitHub
2. Connect repository với Render/Railway/Vercel
3. Setup environment variables
4. Deploy

## 📱 Mobile App Connection

Update API URL trong mobile app:
```typescript
// config/api.ts
export const API_URL = 'https://your-backend-url.com';
```

## 📝 License

MIT
