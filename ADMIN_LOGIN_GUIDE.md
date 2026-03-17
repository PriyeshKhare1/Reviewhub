# ReviewHub - Admin & User Login Guide

## 🔐 Test Accounts Created

### 👑 ADMIN Account
- **Email:** `admin@reviewhub.com`
- **Password:** `admin123`
- **Role:** Admin

### 👤 Regular User Account
- **Email:** `demo@reviewhub.com`
- **Password:** `demo123`
- **Role:** User

---

## 🚀 How to Login

### Step 1: Go to Login Page
```
http://localhost:5173/login
```

### Step 2: Enter Credentials
- Email: `admin@reviewhub.com` (for admin) or `demo@reviewhub.com` (for user)
- Password: `admin123` (for admin) or `demo123` (for user)

### Step 3: Click Login
You'll be redirected to home page after successful login.

---

## 📊 Admin Dashboard Access

### Path to Admin Dashboard
```
http://localhost:5173/admin
```

### What Admin Can Do:
1. **View Stats** - Total reviews, users, statistics
2. **Manage Reviews** - View, verify proof, hide/unhide, delete reviews
3. **Manage Users** - View all users, ban users if needed
4. **Moderation** - Review reported content

### Admin Dashboard Features:
- ✅ View platform statistics
- ✅ Review all user reviews
- ✅ Verify uploaded proof images
- ✅ Hide or unhide reviews with reason
- ✅ Delete inappropriate reviews
- ✅ View all users
- ✅ Ban/unban users

---

## 📝 User Dashboard Access

### Path to My Reviews
```
http://localhost:5173/my-reviews
```

### What Users Can Do:
- ✅ View their own reviews
- ✅ Edit their reviews
- ✅ Delete their reviews
- ✅ Create new reviews

---

## ✍️ Create Review

### Path to Create Review
```
http://localhost:5173/create-review
```

### Requirements:
- ✅ Must be logged in
- ✅ Must have verified email
- ✅ Add title, description, rating, category
- ✅ Optional: Upload images (up to 5)
- ✅ Optional: Post anonymously

---

## 🔄 Navigation Links

All these links are in the Navbar after you login:

| Feature | Path | Required Role |
|---------|------|---------------|
| Home | `/` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Create Review | `/create-review` | Logged In User |
| My Reviews | `/my-reviews` | Logged In User |
| Admin Dashboard | `/admin` | Admin Only |
| Review Details | `/reviews/:id` | Public |

---

## 🎯 Quick Start Guide

### For Regular User:
1. Go to http://localhost:5173
2. Click "Login" or "Register"
3. Use email: `demo@reviewhub.com` & password: `demo123`
4. Create reviews by clicking "Create Review"
5. View your reviews in "My Reviews"

### For Admin:
1. Go to http://localhost:5173
2. Click "Login"
3. Use email: `admin@reviewhub.com` & password: `admin123`
4. Click "Admin Dashboard" in navbar
5. Manage reviews and users

---

## 🔑 Important Notes

- **First Time Login:** Email is already verified for test accounts
- **Create New Reviews:** Must verify email first (automatic for test accounts)
- **Admin Access:** Only users with `role: "admin"` can access `/admin`
- **Non-Admin Access:** If non-admin tries to access `/admin`, they're redirected to home
- **Logout:** Click "Logout" in navbar to logout

---

## 🐛 Troubleshooting

### Can't access Admin Dashboard?
- Make sure you're logged in with `admin@reviewhub.com`
- Check that your role is set to "admin"

### Can't create review?
- Verify you're logged in
- Verify your email is verified
- Check that you have filled all required fields

### Backend not running?
- Start backend: `cd backend && node server.js`
- Check port 5000 is available

### Frontend not running?
- Start frontend: `cd frontend && npm run dev`
- Check port 5173 is available
