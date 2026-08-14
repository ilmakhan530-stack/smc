Final Vercel CSS Modules fix.

Fixed the error:
Selector "hero h1 span,h2 span" is not pure.

All homepage selectors are now anchored to local CSS Module classes.
Also fixed the homepage sections that were using plain string class names
instead of CSS Module classes.

Firebase and existing modules are preserved.
