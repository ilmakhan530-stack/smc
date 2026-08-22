# SMC V10 fixes

1. GLOBAL INPUT FOCUS FIX
   AuthGuard no longer restarts its secure-access effect when a page creates
   an inline allowedRoles array. This prevents the page/form from being
   unmounted while typing, so inputs accept continuous typing normally.

2. LOGOUT
   A Logout button is now present at the bottom of the sidebar for logged-in
   users. It signs out Firebase Auth and returns to /login.

3. HIDDEN LOGIN
   The visible Login button on the public home page has been removed.
   The SMC logo itself is the secure login entry: click the logo to open /login.

4. 15-MINUTE AUTO LOGOUT
   Existing SessionTracker inactivity behavior is retained.

5. PERMISSION-BASED NAVIGATION
   Existing permission filtering is retained: users only see modules they
   are allowed to access.

After deploying, hard-refresh the browser once.
