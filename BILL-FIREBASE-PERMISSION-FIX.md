# Bill shared-data permission fix

## What was fixed
- Bill page waits for Firebase Authentication before starting Firestore listeners.
- Saved Seller/Buyer/Description lists now report Firestore read errors instead of silently showing an empty dropdown.
- Added `firestore.rules` so an enabled user with `permissions.bill == true` can read/write shared Bill data saved by Admin.
- Existing Firebase data is not deleted.

## Important
The rules file must be deployed to the SAME Firebase project used by the Vercel app.

In Firebase Console:
1. Open Firestore Database.
2. Open the Rules tab.
3. Merge the Bill-related rules from `firestore.rules` with your existing rules.
4. Publish.

Do not replace unrelated business-data rules blindly if your project already has custom rules.

After publishing:
- Admin-saved Sellers/Buyers will appear in the Bill user's dropdown.
- A Bill-permission user can save a new Seller/Buyer.
- Existing Seller/Buyer data remains shared.
