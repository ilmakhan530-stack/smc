# Bill Firebase access fix

This build fixes the Bill page so its Firebase listeners start only after the
current user is authenticated. It also adds clear per-list error reporting.

Firebase Rules included in `firestore.rules` allow:
- Admin
- role `bill`
- any enabled user with `permissions.bill == true`

to read/write the shared Bill collections:
`billSellers`, `billBuyers`, `billDescriptions`, `billDispatchDocs`,
`billDispatchedThrough`, `billDestinations`, `billDefaults`, and `bills`.

## Required Firebase step

Publish the included `firestore.rules` in the SAME Firebase project used by
the app. Existing Firestore documents are not deleted by these changes.

After publishing, a Bill-authorized user should see the same saved Seller and
Buyer records that Admin saved.
