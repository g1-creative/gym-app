# Disable Email Confirmation in Supabase

To allow users to sign up without email confirmation, follow these steps:

## Steps to Disable Email Confirmation

1. **Go to your Supabase Dashboard**
   - Navigate to [supabase.com](https://supabase.com)
   - Open your project

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "Providers" or go to "Settings" → "Auth"

3. **Disable Email Confirmation**
   - Look for "Email Auth" settings
   - Find the option "Enable email confirmations" or "Confirm email"
   - **Turn OFF** email confirmation (toggle it off)
   - Save the changes

4. **Alternative: Using SQL**
   - Go to SQL Editor
   - Run this query:
   ```sql
   UPDATE auth.config 
   SET enable_signup = true,
       enable_confirmations = false;
   ```
   - Or update via the dashboard under Authentication → Settings

## What This Does

- Users can sign up and immediately start using the app
- No email confirmation link required
- Users are automatically signed in after sign-up
- The app will automatically detect this and redirect users to the home page

## Security Considerations

⚠️ **Note**: Disabling email confirmation means:
- Anyone with a valid email can create an account
- Consider adding other security measures if needed (rate limiting, CAPTCHA, etc.)
- For production apps, you may want to keep email confirmation enabled

## Testing

After disabling email confirmation:
1. Try signing up with a new account
2. You should be automatically signed in and redirected to the home page
3. No email confirmation message should appear

