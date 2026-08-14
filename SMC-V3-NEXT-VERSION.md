# SMC V3 Next Version

## Changes
- Advance is a separate module: select Staff/Labour, enter amount, save.
- Salary sheet no longer needs an advance-entry field.
- Salary employee name/detail flow shows monthly attendance, in/out, OT hours, Sunday 2x pay, advances, opening balance and final balance.
- Negative final balance is treated as due and carried to the next month.
- OT is represented as hours, not Yes/No.
- Sunday 2x and OT amounts are included in balance rather than separate salary-sheet columns.

## Deployment
Firebase/Vercel environment variables are not bundled in this ZIP. Keep the existing Firebase project/data unchanged.
