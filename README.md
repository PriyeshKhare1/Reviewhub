# 🚀 REVIEWHUB — Production-Ready Review Platform

**Authentic reviews with accountability, ownership, and optional proof.**

A full-stack MERN application with advanced features including role-based access control, image proof uploads, moderation tools, and real-world security.

---

## ✨ FEATURES

### 🔐 **Authentication & Authorization**
- JWT-based authentication
- Email verification (Mailtrap)
- Role-based access (User / Admin)
- Account ban system
- Password hashing with bcrypt

### 📝 **Review System**
- Create, read, update, delete reviews
- **24-hour edit window** (enforced backend)
- Anonymous posting (with ownership tracking)
- Rating system (1-5 stars)
- Category organization
- Proof attachments (up to 5 images via Cloudinary)
- Admin verification of proofs

### 👍 **Interactions**
- Like/Unlike reviews
- Self-like prevention
- Sort by popularity
- Report system with auto-hide threshold
- View like counts

### 🛡 **Admin Moderation**
- Dashboard with analytics
- View all reviews (including anonymous ownership)
- Verify proof attachments
- Hide/unhide reviews
- Delete reviews
- Ban/unban users
- Review reported content
- User management

### 🔍 **Advanced Browsing**
- Search by title
- Filter by category and rating
- Sort by: Newest, Popular, Highest Rated
- Pagination (10 items per page)
- Real-time debounced search

### 🔒 **Security**
- Helmet.js (security headers)
- Rate limiting (100 req/15min)
- MongoDB sanitization (NoSQL injection prevention)
- File type & size validation
- Input validation
- CORS configuration
- Environment variables

### 🎨 **UI/UX**
- Clean, mobile-responsive design
- Image preview before upload
- Status labels (Editable/Locked)
- Modal components
- Loading states
- Error handling
- Time remaining indicators

---

## 🏗 TECH STACK

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** (Authentication)
- **Cloudinary** (Image storage)
- **Nodemailer** + **Mailtrap** (Email)
- **Multer** (File uploads)
- **Helmet**, **express-rate-limit**, **express-mongo-sanitize** (Security)

### Frontend
- **React** + **Vite**
- **React Router** (Navigation)
- **Axios** (API calls)
- **Context API** (State management)
- Vanilla CSS (No heavy libraries)

---

## 📁 PROJECT STRUCTURE

```
reviewhub/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── Review.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   └── reviewRoutes.js
│   ├── utils/
│   │   └── fileUpload.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── ImageUpload.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── ReviewCard.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useDebounce.js
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── CreateReview.jsx
    │   │   ├── EditReview.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── MyReviews.jsx
    │   │   ├── Register.jsx
    │   │   ├── ReviewDetails.jsx
    │   │   └── VerifyEmail.jsx
    │   ├── utils/
    │   │   └── time.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

---

## 🚀 INSTALLATION & SETUP

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Cloudinary account
- Mailtrap account

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd reviewhub
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
MONGO_URI=your_mongodb_connection_string

# Email (Mailtrap)
EMAIL_FROM="ReviewHub <no-reply@reviewhub.com>"
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_password

# Frontend
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`  
Backend runs on: `http://localhost:5000`

---

## 🔑 CREATING ADMIN USER

**Option 1: MongoDB Compass/Atlas**
1. Find your user in the `users` collection
2. Edit document and set: `"role": "admin"`

**Option 2: MongoDB Shell**
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

---

## 📋 API ENDPOINTS

### Authentication
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
GET    /api/auth/me              - Get current user
GET    /api/auth/verify-email/:token - Verify email
```

### Reviews (Public)
```
GET    /api/reviews              - Get all reviews (with filters)
GET    /api/reviews/:id          - Get single review
```

### Reviews (Protected)
```
POST   /api/reviews              - Create review (with images)
PUT    /api/reviews/:id          - Update review (24h window)
DELETE /api/reviews/:id          - Delete review
GET    /api/reviews/my           - Get user's reviews
POST   /api/reviews/:id/like     - Toggle like
POST   /api/reviews/:id/report   - Report review
```

### Admin (Admin Only)
```
GET    /api/admin/stats          - Dashboard statistics
GET    /api/admin/reviews        - Get all reviews (admin view)
PATCH  /api/admin/reviews/:id/verify-proof - Verify proof
PATCH  /api/admin/reviews/:id/toggle-hide  - Hide/unhide review
DELETE /api/admin/reviews/:id    - Delete review (admin)
GET    /api/admin/users          - Get all users
PATCH  /api/admin/users/:id/ban  - Ban user
PATCH  /api/admin/users/:id/unban - Unban user
```

---

## 🔐 RULE SYSTEM

| Rule | Enforcement |
|------|-------------|
| Ownership tracking | Backend only |
| 24h edit window | Backend + UI |
| Delete anytime | Backend |
| Anonymous posting | UI masking, ownership stored |
| Proof immutability | Backend (no edit after upload) |
| Role-based access | Middleware |
| Frontend never trusted | Always backend validation |
| Ban check | Middleware |
| Like self-prevention | Backend logic |
| Report threshold | Auto-hide at 5 reports |

---

## 🌐 DEPLOYMENT

### Backend (Render / Railway)
1. Create new Web Service
2. Connect GitHub repo
3. Set environment variables
4. Build command: `cd backend && npm install`
5. Start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Import GitHub repo
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set environment variable: `VITE_API_URL=<your-backend-url>`

### Database (MongoDB Atlas)
1. Create cluster
2. Create database user
3. Whitelist IP (0.0.0.0/0 for production)
4. Copy connection string to `MONGO_URI`

### Storage (Cloudinary)
1. Create account
2. Get credentials from dashboard
3. Add to `.env`

---

## 🎯 TESTING CHECKLIST

- [ ] User registration with email verification
- [ ] Login/logout flow
- [ ] Create review with/without images
- [ ] Edit review within 24h
- [ ] Edit blocked after 24h
- [ ] Delete review
- [ ] Anonymous posting
- [ ] Like/unlike review
- [ ] Report review
- [ ] Search and filter
- [ ] Pagination
- [ ] Admin login
- [ ] Admin dashboard stats
- [ ] Verify proof (admin)
- [ ] Hide/unhide review (admin)
- [ ] Ban/unban user (admin)
- [ ] Mobile responsiveness

---

## 🎨 DEMO DATA

Use MongoDB seed script or create manually:

**Test Admin:**
```json
{
  "name": "Admin User",
  "email": "admin@reviewhub.com",
  "password": "admin123",
  "role": "admin",
  "isVerified": true
}
```

**Test Reviews:** Create via UI after logging in

---

## 📝 LICENSE

MIT License - Feel free to use for learning or portfolio

---

## 🤝 CONTRIBUTING

This is a portfolio/learning project. Feel free to fork and customize!

---

## 📧 SUPPORT

For issues or questions, create a GitHub issue.

---

## 🏆 WHY THIS PROJECT STANDS OUT

**For Recruiters:**
- ✅ Real-world constraints (24h edit, ownership, ban system)
- ✅ Security-first mindset (helmet, rate-limiting, sanitization)
- ✅ Product thinking (anonymous, proof verification)
- ✅ Backend authority (no frontend trust)
- ✅ Clean architecture (MVC pattern)
- ✅ Professional UX (loading states, error handling)
- ✅ Scalable design (pagination, indexes, CDN)

**Not just a CRUD app** — this is a production-ready platform! 🚀

---

**Built with 💙 by [Your Name]**
