# Bill — all saved dropdown data fix

The Bill module now expects every saved reusable value to be shared through
the same Bill-access rule.

Collections covered:
- billSellers
- billBuyers
- billDescriptions
- billDispatchDocs
- billDispatchedThrough
- billDestinations
- billDefaults
- bills

A signed-in user is allowed when:
- role is `admin`, OR
- role is `bill`, OR
- `permissions.bill` is `true`

and the user is not disabled.

## IMPORTANT: publish Firebase rules

The application code cannot change Firestore Security Rules by itself.
Open the Firebase project used by this app:

Firestore Database -> Rules -> replace/merge the Bill-related rules ->
Publish.

Do not delete existing application rules for unrelated collections.

After publishing, refresh the Bill page. Admin-saved Seller, Buyer,
Description, Dispatch Doc, Dispatched Through and Destination values should
all be visible to an authorized Bill user.
