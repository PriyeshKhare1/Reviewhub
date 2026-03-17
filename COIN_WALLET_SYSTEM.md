# ReviewHub — Coin Wallet System

## Overview

Users earn coins by writing genuine, helpful reviews. The coin system rewards quality over quantity — fake or spam reviews result in coin revocation.

---

## Coin Earning Rules

| Action | Coins | Condition |
|--------|-------|-----------|
| Publish a review | **+1** | Review must be 100+ characters (not a draft) |
| Review gets helpful votes | **+1** | When your review reaches 5+ helpful votes (one time only) |
| Admin verifies your proof image | **+2** | Admin clicks "Verify Proof" on your review |
| Admin hides your review | **-1** | Review flagged as fake or spam |

---

## Files Changed






















### Backend

| File | Change |
|------|--------|
| `models/CoinTransaction.js` | **New** — stores every coin transaction with amount, reason, review reference |
| `models/User.js` | Added `coins` field (Number, default: 0) |
| `models/Review.js` | Added `coinAwarded` and `bonusCoinAwarded` boolean fields |
| `controllers/reviewController.js` | Awards +1 coin on publish; awards +1 bonus coin on 5 helpful votes |
| `controllers/adminController.js` | Awards +2 coins on proof verify; revokes -1 coin on review hide |
| `controllers/userController.js` | Added `getCoinWallet` function — returns balance + transaction history |
| `routes/userRoutes.js` | Added `GET /api/users/wallet/coins` protected route |

### Frontend

| File | Change |
|------|--------|
| `pages/Wallet.jsx` | **New** — Wallet page with coin balance, how-to-earn guide, transaction history |
| `App.jsx` | Added `/wallet` protected route |
| `components/Navbar.jsx` | Shows coin count in user dropdown; added "My Wallet" link with coin badge |

---

## API Endpoint

```
GET /api/users/wallet/coins
Authorization: Bearer <token>

Response:
{
  "coins": 5,
  "transactions": [
    {
      "_id": "...",
      "amount": 1,
      "reason": "review_published",
      "description": "+1 coin for publishing review: \"My Review Title\"",
      "review": { "_id": "...", "title": "My Review Title" },
      "createdAt": "2026-03-08T..."
    }
  ]
}
```

---

## Transaction Reasons

| Reason | Amount | Description |
|--------|--------|-------------|
| `review_published` | +1 | Published a review with 100+ characters |
| `helpful_votes` | +1 | Review reached 5+ helpful votes |
| `proof_verified` | +2 | Admin verified the proof image |
| `review_hidden` | -1 | Admin hid the review for violating guidelines |

---

## Anti-Fake Review Logic

- **Minimum 100 characters** required to earn a coin on publish (strips HTML tags before counting)
- **Drafts never earn coins** — only published reviews qualify
- **Coin revoked if hidden** — if a review is hidden by admin, the base coin is taken back
- **Bonus coin is permanent** — helpful vote bonus is NOT revoked even if review is later hidden (community already validated it)
- **One bonus coin per review** — tracked by `bonusCoinAwarded` flag on the review

---

## Database Schema

### CoinTransaction

```js
{
  user:        ObjectId (ref: User),
  amount:      Number,           // positive = earned, negative = revoked
  reason:      String (enum),    // review_published | helpful_votes | proof_verified | review_hidden
  review:      ObjectId (ref: Review),
  description: String,
  createdAt:   Date
}
```

### User (added field)

```js
coins: { type: Number, default: 0 }
```

### Review (added fields)

```js
coinAwarded:       { type: Boolean, default: false }  // base +1 awarded
bonusCoinAwarded:  { type: Boolean, default: false }  // bonus +1 awarded
```

---

## How to Test

1. Register and verify email
2. Write a review with 100+ characters → check `/wallet` → **+1 coin**
3. Have 5 users click "Helpful" on your review → **+1 bonus coin**
4. Login as admin → go to `/admin` → click **Verify Proof** on a review with image → **+2 coins**
5. Admin hides a review → **-1 coin revoked**
6. Click avatar in navbar → see live coin count and "My Wallet" link

---

## Future / Phase 3 Ideas

- Redeem coins for discount coupons from partner brands
- Daily login bonus coins
- Leaderboard — top coin earners of the month
- Coin milestones (badge at 10, 25, 50, 100 coins)
- Cashback integration (₹1 per 10 coins via UPI)
