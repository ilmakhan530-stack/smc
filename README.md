# SMC Office Management System — V0.5.0

## Firebase Authentication milestone
- Firebase Email/Password login
- No public signup
- Firestore `users/{uid}` role lookup
- Protected Dashboard and Attendance routes
- Roles: admin, attendance, stock, accounts
- Logout
- Existing blue/white SMC UI retained

## Setup
1. Create/choose a Firebase project.
2. Enable Authentication > Email/Password.
3. Create the first user in Firebase Authentication.
4. In Firestore create `users/{UID}` with a `role` field, e.g. `admin`.
5. Copy `.env.example` to `.env.local` and enter Firebase web app config.
6. Commit and deploy on Vercel.

Important: Firebase client configuration is safe to use in a web app, but Firestore Security Rules must protect the `users` collection and all business data. Do not put Firebase Admin SDK private keys in this repository.

Custom domain: smc.site.je


## Bill shared-data permission fix
See `BILL-FIREBASE-PERMISSION-FIX.md`. The Bill user's Firebase permissions must allow reads/writes to the shared `billSellers`, `billBuyers`, `billDescriptions`, and related Bill collections.
