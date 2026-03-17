# ReviewHub - Complete Feature Documentation

## Table of Contents
1. [Authentication & Security](#authentication--security)
2. [User Features](#user-features)
3. [Review System](#review-system)
4. [Social Features](#social-features)
5. [Admin Features](#admin-features)
6. [UI/UX Features](#uiux-features)

---

## Authentication & Security

### 1. Email/Password Registration
**How it works:**
- User registers with name, email, and password
- Password is hashed using bcrypt before storage
- Verification email sent via SMTP (Mailtrap)
- User must click verification link to activate account

**Technologies:**
- `bcryptjs` - Password hashing
- `nodemailer` - Email sending
- `jsonwebtoken` - JWT token generation

**Files:**
- `backend/controllers/authController.js` - `registerUser`, `verifyEmail`
- `frontend/src/pages/Register.jsx`
- `frontend/src/pages/VerifyEmail.jsx`

---

### 2. Password Reset Flow
**How it works:**
1. User clicks "Forgot Password" on login page
2. Enters email address
3. Backend generates a reset token (valid for 1 hour)
4. Email sent with reset link containing token
5. User clicks link, enters new password
6. Token is validated and password is updated

**Technologies:**
- `crypto` - Random token generation
- `nodemailer` - Email sending

**Endpoints:**
- `POST /api/auth/forgot-password` - Request reset email
- `POST /api/auth/reset-password` - Reset with token

**Files:**
- `backend/controllers/authController.js` - `forgotPassword`, `resetPassword`
- `frontend/src/pages/ForgotPassword.jsx`
- `frontend/src/pages/ResetPassword.jsx`

---

### 3. Change Password (Logged In)
**How it works:**
- Authenticated user can change password from Security Settings
- Must provide current password for verification
- New password is hashed and saved

**Endpoint:**
- `POST /api/auth/change-password`

**Files:**
- `backend/controllers/authController.js` - `changePassword`
- `frontend/src/pages/SecuritySettings.jsx`

---

### 4. Google OAuth Login
**How it works:**
1. User clicks "Continue with Google" button
2. Google's OAuth popup appears
3. User authorizes the app
4. Google returns a JWT credential token
5. Backend verifies token with Google's API
6. User is created (if new) or logged in (if existing)
7. Google users are auto-verified (no email verification needed)

**Technologies:**
- `@react-oauth/google` - Frontend Google login component
- `google-auth-library` - Backend token verification

**Setup Required:**
1. Create project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable OAuth 2.0
3. Create OAuth Client ID (Web Application)
4. Add authorized origins: `http://localhost:5173`, `http://localhost:5000`
5. Copy Client ID to both `.env` files

**Environment Variables:**
```env
# Frontend (.env)
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Backend (.env)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Endpoint:**
- `POST /api/auth/google`

**Files:**
- `backend/controllers/authController.js` - `googleAuth`
- `frontend/src/pages/Login.jsx` - GoogleLogin component
- `frontend/src/pages/Register.jsx` - GoogleLogin component
- `frontend/src/main.jsx` - GoogleOAuthProvider wrapper

---

### 5. Two-Factor Authentication (2FA)
**How it works:**

**Setup:**
1. User goes to Security Settings
2. Clicks "Set up 2FA"
3. Backend generates TOTP secret and QR code
4. User scans QR with authenticator app (Google Authenticator, Authy, etc.)
5. User enters 6-digit code to verify
6. 2FA is enabled

**Login with 2FA:**
1. User enters email/password
2. Backend checks if 2FA is enabled
3. If yes, returns `requires2FA: true` with `userId`
4. Frontend shows 2FA code input
5. User enters 6-digit code from authenticator app
6. Backend verifies code and completes login

**Disable 2FA:**
- Requires current password + valid 2FA code

**Technologies:**
- `speakeasy` - TOTP (Time-based One-Time Password) generation/verification
- `qrcode` - QR code generation for authenticator apps

**Endpoints:**
- `GET /api/auth/2fa/status` - Check if 2FA is enabled
- `POST /api/auth/2fa/generate` - Generate secret + QR code
- `POST /api/auth/2fa/enable` - Verify code and enable
- `POST /api/auth/2fa/disable` - Disable 2FA
- `POST /api/auth/2fa/verify` - Verify during login

**Files:**
- `backend/controllers/authController.js` - All 2FA functions
- `frontend/src/pages/SecuritySettings.jsx` - 2FA setup UI
- `frontend/src/pages/Login.jsx` - 2FA verification during login

---

### 6. Session Management
**How it works:**
- Each login creates a session record with device info and IP
- Users can view all active sessions
- Users can revoke individual sessions or all other sessions
- Current session is highlighted

**Endpoints:**
- `GET /api/auth/sessions` - List all sessions
- `DELETE /api/auth/sessions/:sessionId` - Revoke specific session
- `DELETE /api/auth/sessions` - Revoke all other sessions

**Files:**
- `backend/controllers/authController.js` - `getSessions`, `revokeSession`, `revokeAllSessions`
- `frontend/src/pages/SecuritySettings.jsx`

---

## User Features

### 7. User Profiles
**How it works:**
- Each user has a public profile page
- Shows user info, bio, stats (reviews, followers, following)
- Profile picture upload via Cloudinary
- Editable by profile owner

**Technologies:**
- `cloudinary` - Image hosting and transformation
- `multer` - File upload handling

**Endpoints:**
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/profile-picture` - Upload profile picture

**Files:**
- `backend/controllers/userController.js`
- `frontend/src/pages/UserProfile.jsx`
- `frontend/src/pages/EditProfile.jsx`

---

### 8. Following System
**How it works:**
- Users can follow/unfollow other users
- Following count and follower count displayed on profiles
- Can view list of followers and following

**Endpoints:**
- `POST /api/users/:id/follow` - Follow user
- `POST /api/users/:id/unfollow` - Unfollow user
- `GET /api/users/:id/followers` - Get followers list
- `GET /api/users/:id/following` - Get following list

**Files:**
- `backend/controllers/userController.js`
- `frontend/src/pages/UserProfile.jsx`

---

### 9. Verified Badges
**How it works:**
- Admin can grant/revoke verified status
- Verified users show a blue checkmark badge
- Displayed next to username throughout the app

**Endpoint:**
- `PUT /api/admin/users/:id/verify` - Toggle verified status (Admin only)

**Files:**
- `backend/controllers/adminController.js`
- `frontend/src/components/ReviewCard.jsx` - Badge display

---

## Review System

### 10. Create/Edit Reviews
**How it works:**
- Authenticated users can create reviews
- Title, content (rich text), rating (1-5 stars), category, tags
- Multiple image uploads supported
- Reviews can be saved as drafts
- Edit history tracked

**Technologies:**
- `@tiptap/react` - Rich text editor (React 19 compatible)
- `cloudinary` - Image hosting

**Endpoints:**
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `GET /api/reviews/:id` - Get single review
- `GET /api/reviews` - List reviews (with filters)

**Files:**
- `backend/controllers/reviewController.js`
- `frontend/src/pages/CreateReview.jsx`
- `frontend/src/pages/EditReview.jsx`

---

### 11. Draft Reviews
**How it works:**
- Reviews can be saved with `isDraft: true`
- Drafts only visible to author
- Can be published later by setting `isDraft: false`

**Files:**
- `backend/models/Review.js` - `isDraft` field
- `frontend/src/pages/CreateReview.jsx` - "Save as Draft" button

---

### 12. Edit History
**How it works:**
- Every edit to a review is tracked
- Stores previous content, edit timestamp, and reason
- Users can view edit history on review details page

**Schema:**
```javascript
editHistory: [{
  content: String,
  editedAt: Date,
  reason: String
}]
```

**Files:**
- `backend/models/Review.js`
- `backend/controllers/reviewController.js`

---

### 13. Multiple Image Upload
**How it works:**
- Reviews support multiple images (up to 5)
- Images uploaded to Cloudinary
- Displayed in a gallery/carousel on review page

**Technologies:**
- `cloudinary` - Cloud image storage
- `multer` - Multi-file upload

**Files:**
- `backend/utils/fileUpload.js`
- `frontend/src/components/ImageUpload.jsx`

---

### 14. Tags System
**How it works:**
- Reviews can have multiple tags
- Tags are searchable
- Popular tags shown for filtering

**Schema:**
```javascript
tags: [String]
```

**Files:**
- `backend/models/Review.js`
- `frontend/src/pages/CreateReview.jsx`

---

### 15. Helpful Voting
**How it works:**
- Users can mark reviews as "helpful"
- One vote per user per review
- Vote can be toggled (helpful/not helpful)
- Helpful count displayed on review

**Endpoint:**
- `POST /api/reviews/:id/helpful` - Toggle helpful vote

**Files:**
- `backend/controllers/reviewController.js`
- `frontend/src/components/ReviewCard.jsx`

---

### 16. Advanced Search
**How it works:**
- Search by title, content, tags
- Filter by category, rating, date
- Sort by newest, oldest, most helpful, highest rated
- Pagination support

**Query Parameters:**
- `q` - Search query
- `category` - Filter by category
- `rating` - Minimum rating
- `sortBy` - Sort field
- `page`, `limit` - Pagination

**Files:**
- `backend/controllers/reviewController.js`
- `frontend/src/pages/Home.jsx` - Search UI

---

## Social Features

### 17. Comments System
**How it works:**
- Users can comment on reviews
- Nested replies supported
- Comment author can edit/delete their comments
- Review author can delete any comment on their review

**Endpoints:**
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Edit comment
- `DELETE /api/comments/:id` - Delete comment
- `GET /api/reviews/:id/comments` - Get comments for review

**Files:**
- `backend/controllers/commentController.js`
- `frontend/src/components/CommentSection.jsx`
- `frontend/src/components/CommentItem.jsx`
- `frontend/src/components/CommentForm.jsx`

---

### 18. Bookmarks (Saved Reviews)
**How it works:**
- Users can bookmark/save reviews for later
- Saved reviews accessible from "Saved Reviews" page
- Toggle bookmark on/off

**Endpoint:**
- `POST /api/reviews/:id/save` - Toggle bookmark

**Files:**
- `backend/controllers/reviewController.js`
- `frontend/src/pages/SavedReviews.jsx`

---

### 19. Share Button
**How it works:**
- Share review via Web Share API (mobile) or copy link
- Social sharing options (Twitter, Facebook, WhatsApp)
- Copy to clipboard fallback

**Technologies:**
- Web Share API (native browser)

**Files:**
- `frontend/src/components/ShareButton.jsx`

---

### 20. Notifications
**How it works:**
- Real-time notification bell in navbar
- Notifications for: comments on your review, new followers, helpful votes
- Mark as read individually or all at once
- Unread count badge

**Endpoints:**
- `GET /api/notifications` - Get user's notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

**Files:**
- `backend/controllers/notificationController.js`
- `frontend/src/components/NotificationBell.jsx`

---

## Admin Features

### 21. Admin Dashboard
**How it works:**
- Admin-only access (role-based)
- View all users, reviews, comments
- Ban/unban users
- Delete inappropriate content
- Grant/revoke verified status

**Middleware:**
- `authMiddleware.js` - Verify JWT token
- `roleMiddleware.js` - Check admin role

**Endpoints:**
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/ban` - Ban/unban user
- `PUT /api/admin/users/:id/verify` - Toggle verified status
- `DELETE /api/admin/reviews/:id` - Delete review
- `GET /api/admin/stats` - Dashboard statistics

**Files:**
- `backend/controllers/adminController.js`
- `backend/routes/adminRoutes.js`
- `frontend/src/pages/AdminDashboard.jsx`

---

### 22. Analytics
**How it works:**
- Dashboard shows key metrics
- Total users, reviews, comments
- Reviews per category chart
- User growth over time
- Most active users

**Files:**
- `backend/controllers/adminController.js` - Stats endpoints
- `frontend/src/pages/AdminDashboard.jsx` - Charts/graphs

---

## UI/UX Features

### 23. Dark Mode
**How it works:**
- Toggle between light and dark themes
- Preference saved to localStorage
- Respects system preference by default
- Smooth transition animation

**Technologies:**
- Tailwind CSS dark mode classes
- React Context for state

**Files:**
- `frontend/src/context/ThemeContext.jsx`
- `frontend/src/components/ThemeToggle.jsx`

---

### 24. Rich Text Editor
**How it works:**
- WYSIWYG editor for review content
- Bold, italic, underline, headings
- Bullet lists, numbered lists
- Links, blockquotes
- Code blocks

**Technologies:**
- `@tiptap/react` - Headless rich text editor
- `@tiptap/starter-kit` - Basic extensions
- `@tiptap/extension-link` - Link support

**Why TipTap (not React-Quill):**
- React-Quill is incompatible with React 19
- TipTap is fully compatible and actively maintained

**Files:**
- `frontend/src/pages/CreateReview.jsx`
- `frontend/src/pages/EditReview.jsx`

---

### 25. Responsive Design
**How it works:**
- Mobile-first responsive layout
- Works on all screen sizes
- Touch-friendly interactions
- Collapsible navigation on mobile

**Technologies:**
- Tailwind CSS responsive utilities
- Framer Motion for animations

---

## Tech Stack Summary

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite 7 | Build Tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| React Router | Navigation |
| Axios | HTTP Client |
| TipTap | Rich Text Editor |
| @react-oauth/google | Google Login |
| Lucide React | Icons |
| date-fns | Date formatting |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| nodemailer | Email Sending |
| speakeasy | 2FA TOTP |
| qrcode | QR Code Generation |
| google-auth-library | Google OAuth |
| cloudinary | Image Storage |
| multer | File Uploads |

---

## Environment Variables

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Backend (`.env`)
```env
PORT=5000
JWT_SECRET=your-secret-key
MONGO_URI=mongodb+srv://...

# Email (Mailtrap)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-user
SMTP_PASS=your-pass
EMAIL_FROM="ReviewHub <no-reply@reviewhub.com>"

# Frontend URL
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## API Routes Summary

### Auth Routes (`/api/auth`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | /register | Register new user |
| POST | /login | Login user |
| GET | /verify-email/:token | Verify email |
| POST | /resend-verification | Resend verification email |
| POST | /forgot-password | Request password reset |
| POST | /reset-password | Reset password with token |
| POST | /change-password | Change password (logged in) |
| POST | /google | Google OAuth login |
| GET | /sessions | Get active sessions |
| DELETE | /sessions/:id | Revoke session |
| DELETE | /sessions | Revoke all other sessions |
| GET | /2fa/status | Get 2FA status |
| POST | /2fa/generate | Generate 2FA secret |
| POST | /2fa/enable | Enable 2FA |
| POST | /2fa/disable | Disable 2FA |
| POST | /2fa/verify | Verify 2FA code |

### Review Routes (`/api/reviews`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | / | Get all reviews |
| GET | /:id | Get single review |
| POST | / | Create review |
| PUT | /:id | Update review |
| DELETE | /:id | Delete review |
| POST | /:id/helpful | Toggle helpful vote |
| POST | /:id/save | Toggle bookmark |

### User Routes (`/api/users`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | /:id | Get user profile |
| PUT | /profile | Update profile |
| POST | /:id/follow | Follow user |
| POST | /:id/unfollow | Unfollow user |

### Comment Routes (`/api/comments`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | / | Create comment |
| PUT | /:id | Edit comment |
| DELETE | /:id | Delete comment |

### Notification Routes (`/api/notifications`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | / | Get notifications |
| PUT | /:id/read | Mark as read |
| PUT | /read-all | Mark all as read |

### Admin Routes (`/api/admin`)
| Method | Route | Description |
|--------|-------|-------------|
| GET | /users | Get all users |
| PUT | /users/:id/ban | Ban/unban user |
| PUT | /users/:id/verify | Toggle verified status |
| GET | /stats | Get dashboard stats |
