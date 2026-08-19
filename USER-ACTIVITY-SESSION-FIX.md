# User Activity & Force Logout

Added an Admin-only **User Activity** page at `/admin/sessions`.

It records each signed-in session in Firestore collection `activeSessions` with:
- User UID / email
- role
- current route/page
- last seen timestamp
- online/offline state
- forceLogout flag

The Admin can press **Logout** on an online session. The target user's AuthGuard listens to that session document and signs the user out immediately.

## Firestore security
Use rules that allow authenticated users to read/write only their own `activeSessions/{sessionId}` records, while Admin users can read all session records and set `forceLogout`. Do not allow arbitrary users to force-logout other sessions.
