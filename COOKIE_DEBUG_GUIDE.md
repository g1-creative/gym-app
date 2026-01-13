# Cookie Debugging Guide

## What We Just Fixed

I added more logging and a longer delay (1000ms) to help debug the cookie persistence issue.

## What to Look For

When you log in now, you should see these new logs:

```
[CLIENT] signIn success with session
[CLIENT] Session token: eyJhbGciOiJIUzI1N...
[CLIENT] Session confirmed after getSession: true
[CLIENT] Waiting for cookies to propagate...
[CLIENT] Current cookies: ['cookie1', 'cookie2', 'sb-xxxxx-auth-token']
[CLIENT] Has Supabase auth cookie: true
[CLIENT] Redirecting to home page...
```

## Key Things to Check

### 1. Cookie Names
Look for cookies starting with:
- `sb-` (Supabase cookies)
- Your Supabase project ref (e.g., `sb-abc123xyz-auth-token`)

### 2. Cookie Presence
The log `[CLIENT] Has Supabase auth cookie: true` should show `true`.

If it shows `false`, it means:
- Cookies aren't being set by the browser client
- Possible cookie domain mismatch
- Possible security policy blocking cookies

### 3. After Redirect
After the redirect, check if you land on:
- `/` (home page) ✅ = Cookies are working!
- `/login` (login page) ❌ = Cookies still not persisting

## If Cookies Show FALSE

This indicates a Supabase configuration issue. Check:

1. **Supabase URL matches your deployment domain**
   - In Vercel environment variables
   - Should be your actual Supabase project URL

2. **Cookie domain settings**
   - Cookies might be set for localhost but not Vercel domain
   - Or vice versa

3. **Browser Cookie Settings**
   - Third-party cookies might be blocked
   - Try in an incognito window

## If Cookies Show TRUE But Still Redirects to /Login

This means:
- Cookies ARE being set in the browser
- But the server-side middleware can't read them
- Likely a cookie format/scope mismatch between:
  - `@supabase/ssr` browser client (sets cookies)
  - `@supabase/ssr` server client (reads cookies)

**Solution**: We may need to configure custom cookie options to ensure compatibility.

## Next Steps

1. Try logging in with the latest deploy
2. Copy ALL the console logs (including the cookie information)
3. Share them here
4. Also check your browser's DevTools → Application → Cookies tab
   - Look for cookies under your Vercel domain
   - Screenshot if possible


