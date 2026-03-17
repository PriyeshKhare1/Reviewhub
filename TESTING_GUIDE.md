# ReviewHub — Manual Testing Guide

## Start Servers

```bash
# Terminal 1
cd backend && npm run dev
# Expected: "Server running on port 5000" + "MongoDB Connected"

# Terminal 2
cd frontend && npm run dev
# Expected: "http://localhost:5173"
```

Open `http://localhost:5173` in browser.

---

## 1. Authentication

### Register
1. Go to `/register`
2. Fill name, email, password → click **Create Account**
3. ✅ Redirects to `/verify-email`
4. Check backend terminal for verification token (or email inbox if SMTP configured)
5. Visit `/verify-email?token=<TOKEN>`
6. ✅ Shows "Email verified!"

### Login
1. Go to `/login` → enter credentials → click **Sign In**
2. ✅ Redirects to Home
3. ✅ Navbar shows your name and avatar

### Logout
1. Click avatar in navbar → **Sign Out**
2. ✅ Redirects to `/login`
3. ✅ Navbar shows Login/Register buttons

### Google OAuth
1. Click **Continue with Google** on login/register page
2. ✅ Opens Google auth popup → logs in on success

### Forgot Password
1. Go to `/forgot-password` → enter email → Submit
2. ✅ Email sent message shown
3. Use reset link in email → `/reset-password?token=...`
4. ✅ Set new password and login

---

## 2. Review CRUD

### Create Review
1. Click **New Review** in navbar
2. Fill: Title, Category, Rating (stars), Description (100+ chars)
3. Optionally attach an image
4. Click **Publish Review**
5. ✅ Redirects to the review's detail page
6. ✅ Review appears on Home page

### Create Draft
1. Go to `/create-review` → fill in details → click **Save as Draft**
2. ✅ Shows success message
3. Go to `/drafts` → your draft should be listed

### Publish Draft (Bug Fix #1)
1. Go to `/drafts` → click **Publish** on a draft with 100+ char description
2. ✅ Draft becomes published
3. Go to `/wallet`
4. ✅ Transaction history shows **+1 coin for publishing review**

### Edit Review (24-hour window)
1. Go to `/my-reviews` → click **Edit** on a review created within last 24 hours
2. Change title or description → click **Update**
3. ✅ Changes saved and visible
4. Try editing a review older than 24 hours
5. ✅ Should show "Editing time expired" error

### Delete Review
1. Go to `/my-reviews` → click **Delete** icon
2. ✅ Confirmation appears
3. Confirm → ✅ Review removed from list and Home page

### View Edit History
1. Edit a review (changes title/description)
2. Go to review details → click **Edit History**
3. ✅ Previous versions listed with timestamps

---

## 3. Home Page Feed

### All Reviews Tab
1. Go to `/`
2. ✅ Reviews load in a grid
3. ✅ Pagination appears if more than 9 reviews

### Following Tab (New Feature)
1. Must be logged in
2. Go to `/` → click **Following** tab (next to All Reviews)
3. If you follow nobody → ✅ Shows empty state with "Follow other reviewers"
4. Follow a user (from their profile) → come back → ✅ Their reviews appear in this tab

### Search (Fixed — now searches description too)
1. Type a keyword in the search bar
2. ✅ Reviews with that word in **title OR description** appear
3. (Before fix, only title was searched)

### Filters
| Filter | How to test |
|--------|-------------|
| Category | Click a category pill → reviews filter |
| Rating | Select 4★ → only 4+ star reviews show |
| Sort by Popular | Reviews sort by like count |
| Sort by Rating | Reviews sort by star rating |
| Sort by Trending | Reviews sort by views + likes |

### Advanced Search
1. Click the filter/sliders icon
2. Set: date range, rating range, tags
3. ✅ Results update with combined filters

---

## 4. Review Interactions

### Like / Unlike (Bug Fix #2 — now creates notification)
1. Open any review → click **Like** button
2. ✅ Like count increases, button changes style
3. Click again → ✅ Like count decreases (unlike)
4. Login as the review's author
5. Go to `/notifications`
6. ✅ See "X liked your review" notification

### Helpful / Not Helpful Voting
1. Open a review → click **Helpful** or **Not Helpful**
2. ✅ Counts update
3. If helpful count reaches 5 for the first time:
4. ✅ Review author's `/wallet` shows **+1 bonus coin**

### Report Review
1. Open a review → click **Report** icon → select reason
2. ✅ "Reported" confirmation shown
3. After 5 reports from different users → review auto-hides

### Bookmark / Save Review
1. Click the **Bookmark** icon on any review card or detail page
2. ✅ Goes to `/saved-reviews`
3. Click again to remove bookmark
4. ✅ Unbookmarked

---

## 5. Coin Wallet

### View Wallet
1. Click avatar → **My Wallet** OR go to `/wallet`
2. ✅ Shows total coin balance
3. ✅ Shows Earned / Revoked / Transaction count
4. ✅ Full transaction history with reason and date

### Badge & Milestone Progress (New Feature)
1. Go to `/wallet`
2. ✅ "Your Badge" section shows current badge based on coins:

| Coins | Badge |
|-------|-------|
| 0–4 | No badge — "Earn 5 coins to unlock" |
| 5+ | 🌱 Contributor |
| 10+ | 📝 Reviewer |
| 25+ | ⭐ Trusted Reviewer |
| 50+ | 💎 Expert |
| 100+ | 🏆 Legend |

3. ✅ Progress bar shows how many coins until next badge
4. ✅ At 100 coins shows "You've reached the highest badge — Legend!"

### Live Coin Count in Navbar (Bug Fix #4)
1. Login → note coin count in avatar dropdown (top right)
2. Publish a new 100+ char review
3. Click the dropdown again WITHOUT refreshing the page
4. ✅ Coin count is updated

---

## 6. Leaderboard (New Feature)

1. Click **Leaderboard** in the navbar OR go to `/leaderboard`
2. ✅ Page loads with ranked list
3. ✅ Top 3 users shown in a podium layout
4. ✅ Each entry shows: rank, name, badge emoji, review count, coin count
5. ✅ Your own entry is highlighted with "(you)"
6. ✅ Your rank shown at the top of the page
7. ✅ Click any user → goes to their profile

---

## 7. Categories Page (New Feature)

1. Click **Categories** in the navbar OR go to `/categories`
2. ✅ Cards show each category with:
   - Review count
   - Average rating
   - Proportion bar (% of total reviews)
3. ✅ Summary stats at top: total categories, total reviews, avg rating
4. Click a category card → ✅ Navigates to Home page filtered by that category

---

## 8. Notifications

### Receive Notifications
| Action | Who gets notified |
|--------|-------------------|
| Someone likes your review | You |
| Someone comments on your review | You |
| Someone replies to your comment | You |

### Mark as Read
1. Go to `/notifications`
2. ✅ Unread notifications highlighted
3. Click one → ✅ Marked as read
4. Click **Mark all as read** → ✅ All cleared

### Notification Bell
1. Bell icon in navbar
2. ✅ Red badge shows unread count
3. After marking all read → ✅ Badge disappears

---

## 9. User Profiles & Following

### View Profile
1. Click any username anywhere → goes to `/profile/:id`
2. ✅ Shows: name, bio, followers/following count, review list

### Follow / Unfollow
1. Visit another user's profile
2. Click **Follow** → ✅ Follower count increases, button changes to "Unfollow"
3. Click **Unfollow** → ✅ Reverts
4. Cannot follow yourself → ✅ No Follow button on your own profile

### Edit Your Profile
1. Click avatar → **Edit Profile** OR go to `/profile/edit`
2. Change name, bio → click **Save**
3. ✅ Changes reflected on your profile
4. Upload new profile picture → ✅ Cloudinary upload, new image shown in navbar

---

## 10. Drafts

1. Go to `/drafts`
2. ✅ All draft reviews listed
3. Click **Publish** → ✅ Moves to published reviews
4. ✅ If 100+ chars, +1 coin awarded on publish
5. Click **Edit** → takes you to edit form with draft data
6. Click **Delete** → ✅ Draft removed

---

## 11. Admin Dashboard

> To make yourself admin: open MongoDB → Users collection → find your user → set `role: "admin"` → re-login

### Access
1. Login as admin → navbar shows **Admin** link
2. Go to `/admin`
3. ✅ Dashboard stats: total reviews, users, reported, hidden, banned, verified proofs

### Review Management
1. Click **Reviews** tab
2. ✅ See all reviews (filterable by reported / hidden)
3. **Verify Proof:**
   - Click **Verify Proof** on a review with an image
   - ✅ Review gets verified badge
   - ✅ Author's wallet shows **+2 coins**
4. **Hide Review:**
   - Click **Hide** on any review (with reason)
   - ✅ Review disappears from public feed
   - ✅ Author's wallet shows **-1 coin** (if base coin was awarded)
5. **Unhide:** Click **Unhide** → ✅ Review reappears
6. **Delete:** Click **Delete** → ✅ Removed from DB + Cloudinary images deleted

### User Management
1. Click **Users** tab
2. ✅ See all users (filterable by banned)
3. **Ban user:** Click **Ban** → enter reason → ✅ User can no longer post
4. **Unban user:** Click **Unban** → ✅ User can post again
5. **Change Role (New Feature):**
   - Click **Change Role** next to a user
   - Set to `admin` → ✅ User becomes admin
   - Set back to `user` → ✅ Demoted
   - Try changing your own role → ✅ "You cannot change your own role" error

---

## 12. Security Settings

1. Go to `/security`
2. ✅ Shows: active sessions list, 2FA section, change password section

### Change Password
1. Enter current password + new password → Submit
2. ✅ Success message
3. Logout → login with new password → ✅ Works

### Two-Factor Authentication (2FA)
1. Click **Enable 2FA**
2. ✅ QR code shown
3. Scan with Google Authenticator or Authy
4. Enter the 6-digit code → click **Enable**
5. ✅ 2FA enabled
6. Logout → login → ✅ Prompted for 2FA code before access granted

### Session Management
1. ✅ List of active sessions with device/IP info
2. Click **Revoke** on one session → ✅ That session logs out
3. Click **Revoke All Other Sessions** → ✅ All other devices logged out

---

## 13. Analytics

1. Go to `/analytics`
2. ✅ Charts showing your reviews' performance
3. Click a specific review → ✅ Detailed analytics: views, likes, helpful %, comment count

---

## 14. Rate Limiting (Security)

1. Go to `/login`
2. Enter wrong password **10 times in a row** within 15 minutes
3. ✅ On 11th attempt: **"Too many attempts, please try again in 15 minutes"**
4. Similarly for `/register` (5 attempts) and `/forgot-password` (5 per hour)

---

## 15. Page Titles (SEO)

Check the browser tab as you navigate:

| Page | Expected Title |
|------|----------------|
| `/` | `Discover Real Reviews \| ReviewHub` |
| `/login` | `Login \| ReviewHub` |
| `/register` | `Create Account \| ReviewHub` |
| `/wallet` | `My Wallet \| ReviewHub` |
| `/leaderboard` | `Leaderboard \| ReviewHub` |
| `/categories` | `Browse Categories \| ReviewHub` |
| `/my-reviews` | `My Reviews \| ReviewHub` |
| `/notifications` | `Notifications \| ReviewHub` |
| `/admin` | `Admin Dashboard \| ReviewHub` |

---

## 16. Lazy Loading

1. Open **DevTools** (F12) → **Network** tab → filter by **JS**
2. Hard refresh (`Ctrl+Shift+R`) on Home page
3. ✅ Only the Home chunk loaded
4. Navigate to `/wallet`
5. ✅ A new JS chunk loads on demand (not loaded on initial page load)

---

## 17. Error Boundary

1. Normal usage: not visible
2. If a JS crash occurs anywhere in the app:
3. ✅ Shows "Something went wrong — Refresh Page" screen instead of blank white page

---

## Quick Smoke Test (Fastest Path)

```
1.  Start backend + frontend servers
2.  Register a new account + verify email
3.  Login
4.  Create a 100+ character review → check /wallet for +1 coin
5.  Save a draft → publish from /drafts → check +1 coin again
6.  Like someone else's review → check their /notifications
7.  Visit /leaderboard → confirm your entry and badge
8.  Visit /categories → click one → confirm filter applies on Home
9.  Follow a user → go to Home → check Following tab
10. Open avatar dropdown → coin count should match /wallet
11. Check browser tab title on each page
12. Login as admin → verify proof on a review → check +2 coins
```

---

## Common Issues

| Problem | Fix |
|---------|-----|
| "Network Error" on any action | Make sure backend is running on port 5000 |
| No coin awarded after publishing | Check that description is 100+ characters (no HTML tags) |
| Following tab empty | Follow at least one user first, then they need to have a review |
| Leaderboard empty | At least one user needs coins (publish a review first) |
| Admin panel not accessible | Set `role: "admin"` in MongoDB for your user, then re-login |
| 2FA code rejected | Ensure your phone clock is synced (TOTP is time-based) |
| Images not uploading | Check Cloudinary credentials in `backend/.env` |
| Rate limit hit during testing | Wait 15 minutes or use a different IP |
