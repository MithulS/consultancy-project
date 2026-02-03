@echo off
echo ============================================
echo Google OAuth Quick Checker
echo ============================================
echo.
echo Opening Google Cloud Console Credentials page...
echo.
start https://console.cloud.google.com/apis/credentials
echo.
echo Instructions:
echo 1. Look for an OAuth Client ID named something like "E-Commerce" or "Web Client"
echo 2. Click the edit icon (pencil) next to it
echo 3. Verify the Client ID matches: 513465967830-s6djtj28aeojt17tfgsr114t5sqq74s.apps.googleusercontent.com
echo 4. Check that Authorized redirect URIs includes: http://localhost:5000/api/auth/google/callback
echo 5. If not found or different, create a NEW OAuth Client ID
echo.
echo ============================================
pause
