# Authentication Debug Logs

I've added comprehensive console logging throughout the authentication flow. Here's where to look and what to check:

## Where to Check Logs

### Browser Console (F12 → Console Tab)
You'll see logs prefixed with `[CLIENT]` showing:
- Form submission
- Server action calls
- Results from authentication
- Redirect attempts

### Server Logs (Vercel Dashboard or Terminal)
You'll see logs prefixed with `[SERVER]` showing:
- Server action execution
- Supabase authentication results
- Session creation status

### Middleware Logs (Vercel Dashboard)
You'll see logs prefixed with `[MIDDLEWARE]` showing:
- Each request path
- Whether a user is authenticated
- Redirect decisions

### Login Page Logs (Server)
You'll see logs prefixed with `[LOGIN PAGE]` showing:
- If user is already authenticated when accessing /login
- Redirect attempts

## Expected Flow for Successful Login

1. **[CLIENT] Form submitted** - User clicks sign in
2. **[CLIENT] Calling signIn...** - Client calls server action
3. **[SERVER] signIn called with email** - Server receives request
4. **[SERVER] signIn result: { hasSession: true, hasUser: true }** - Supabase authenticated successfully
5. **[SERVER] signIn success, session created** - Session created
6. **[CLIENT] signIn result: { success: true }** - Client receives success
7. **[CLIENT] signIn success, redirecting to home...** - Client initiates redirect
8. **[MIDDLEWARE] { path: '/', hasUser: true }** - Middleware sees authenticated user on home page

## What to Look For

### If Stuck on Login:
- Check if `[CLIENT] signIn success, redirecting to home...` appears
- Check if `window.location.replace` is called
- Check if `[MIDDLEWARE]` logs show `hasUser: false` after login
- Check if cookies are being blocked by browser

### If Authentication Fails:
- Look for `[SERVER] signIn error:` messages
- Check if Supabase credentials are correct
- Verify user exists in Supabase

### If Redirect Happens But Returns to Login:
- Check `[MIDDLEWARE]` logs - does it show `hasUser: true`?
- Check `[LOGIN PAGE]` logs - is it redirecting?
- May indicate cookie/session persistence issue

## How to Test

1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear console
4. Try to log in
5. Copy ALL console logs and send them to me
6. Also check Vercel deployment logs for server-side logs

## Common Issues

### No logs appear:
- Make sure you've deployed the latest version
- Check you're looking at the right deployment in Vercel
- Browser might be caching old code - hard refresh (Ctrl+Shift+R)

### "success: true" but no redirect:
- Browser might be blocking navigation
- Check for JavaScript errors in console
- Check if `window.location.replace` is being called

### "hasUser: false" in middleware after login:
- Cookies not being set properly
- Check browser cookie settings
- Check Supabase URL/key environment variables

