# ReviewHub — Features Summary

## Overview
ReviewHub is a full-stack MERN-style review platform where users earn coins for genuine, helpful reviews. The system includes moderation tools, role-based access (User/Admin), and proof-based verification for submitted review images.

## Core Features (User)
1. Authentication & Authorization
   - JWT-based login/logout
   - Email verification flow
   - Role-based access: `user` and `admin`
   - Ban system (blocked users cannot publish)

2. Reviews (CRUD + Rules)
   - Create reviews (with optional image attachments)
   - Update reviews within a `24-hour` edit window (enforced on the backend)
   - Delete reviews
   - Anonymous posting support while still tracking real ownership internally
   - Rating system (`1-5`)

3. Attachments / Proof
   - Upload proof images (stored via Cloudinary)
   - Review models store attachment URLs + Cloudinary IDs for deletion
   - Admin can verify proof images and award coins

4. Community Interactions
   - Like / Unlike reviews
   - Helpful voting (+ bonus coins for reaching a threshold)
   - Self-like prevention (implemented in backend logic)
   - Reporting system with auto-hide after a report threshold

5. Browsing & Discovery
   - Search by title/description (full-text search)
   - Filter by category and rating
   - Sort by different modes (newest/popular/rating/etc.)
   - Pagination

## Admin Moderation Features
1. Admin Dashboard and Review Management
   - View all reviews (including hidden state)
   - Verify proof images
   - Hide / unhide reviews
   - Delete reviews permanently

2. User Management
   - Ban / unban users
   - Role management (change `user` <-> `admin`)

## Coin Wallet System
This project includes a complete coin wallet with a transaction history.

1. Database Components
   - `User.coins` stores current coin balance
   - `CoinTransaction` logs every coin change (amount, reason, optional review reference)
   - `Review` includes coin flags:
     - `coinAwarded` (base coin for publishing)
     - `bonusCoinAwarded` (bonus coin for helpful voting threshold)

2. Coin Earning + Revocation Rules (as implemented)
   - Publish a review
     - +1 coin if review is not a draft and the description text (HTML stripped) is at least `100` characters
     - Stored as `review_published` transaction

   - Helpful votes
     - +1 bonus coin when the review reaches `5+` helpful votes
     - Award happens only once using `bonusCoinAwarded`
     - Stored as `helpful_votes` transaction

   - Admin verifies proof
     - +2 coins when admin verifies a review’s attached proof
     - Stored as `proof_verified` transaction

   - Admin hides a review
     - -1 coin only if the base coin was awarded for that review (`coinAwarded`)
     - Stored as `review_hidden` transaction
     - Note: the code does not revoke the helpful-vote bonus because it only revokes `coinAwarded` and does not touch `bonusCoinAwarded`

3. Wallet UI + API
   - Protected wallet page at `/wallet`
   - Wallet endpoint returns current balance and last transactions (includes review titles)
   - Navbar displays the live coin count and includes “My Wallet”

## Security & Quality Controls
1. Backend Security Middlewares
   - Uses security headers (Helmet)
   - Uses rate limiting
   - Uses MongoDB sanitization to reduce NoSQL injection risk
   - Uses input validation patterns in routes/controllers
   - Uses authenticated/role-protected endpoints for sensitive actions

2. Frontend Reliability
   - Protected routes (`/wallet` and admin pages)
   - Clean routing flow with React Router + Suspense lazy loading

## What’s Already Good (Best Parts)
- Coin wallet system is properly modeled (balance + immutable transaction history).
- Admin moderation includes proof verification and hide/unhide with coin effects.
- Review business rules are enforced server-side (100+ chars check and 24-hour edit window).
- The UI includes a dedicated wallet page and keeps the coin count visible in navigation.
- Architecture is separated into models/controllers/routes (easier to maintain and extend).

## Where You Still Have Work To Do
1. Fix potential “double award” on proof verification
   - File: `backend/controllers/adminController.js`
   - Improvement: ensure `verifyProof` only awards +2 coins once by checking `review.isVerifiedProof` before awarding again.

2. Lint / code quality tightening
   - File: `frontend/eslint.config.js`
   - Right now ESLint was adjusted so `npm run lint` does not fail due to unused imports/vars and a few strict React rules.
   - Recommended work: revert the lint config back to strict mode and fix the unused imports/vars in the affected components/pages.

3. Clean generated file(s)
   - File: `frontend/lint-report.json`
   - This is an auto-generated lint report; if you don’t need it, delete it so your repo stays clean.

## Summary
ReviewHub already includes a rich set of production-minded features: secure auth, full review CRUD rules, admin moderation with proof verification, and a complete coin wallet system with transparent transaction history.

