SMC V2 Vercel fix #2

Fixed CSS Modules error:
Selector "*" was invalid in app/home.module.css because CSS Modules require a local class/id.
The universal selector is now scoped under .home.

Also removed any remaining styled-jsx from app/page.tsx.
Firebase and existing modules were preserved.
