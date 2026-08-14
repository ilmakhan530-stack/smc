# Vercel Build Fix

The previous homepage failed because `app/page.tsx` used `<style jsx>`, which caused the Server Component error:
"styled-jsx ... only works in a Client Component".

This version moves homepage styling to `app/home.module.css`, so the homepage remains a Server Component and can build on Vercel.

No Firebase environment values are included or changed.
