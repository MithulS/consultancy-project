# How to See OTP Code - Complete Guide

## ⚡ Quick Solution

The OTP **IS being generated** but you need to look in the **correct terminal**.

### Step-by-Step:

1. **Open TWO separate PowerShell terminals**

2. **Terminal 1 (Server)** - Run this and LEAVE IT OPEN:
   ```powershell
   cd D:\consultancy\backend
   node index.js
   ```
   
   Keep watching this terminal - **OTP will appear HERE**

3. **Terminal 2 (Testing)** - Use this to register users:
   ```powershell
   # Register a user
   $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
   $body = @{
     username="testuser$timestamp"
     name="Test User"
     email="test${timestamp}@example.com"
     password="Test@1234"
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
     -Method POST `
     -Body $body `
     -ContentType "application/json"
   ```

4. **Look at Terminal 1** immediately after registration - you'll see:

   ```
   🔍 DEBUG: sendOtpEmail called with: { toEmail: '...', otpPlain: '123456', ... }

   ██████████████████████████████████████████████████████████████████████
   █                                                                    █
   █  📧 OTP EMAIL (DEVELOPMENT MODE)                                  █
   █                                                                    █
   ██████████████████████████████████████████████████████████████████████
   █  To: test@example.com                                             █
   █  Name: Test User                                                  █
   █                                                                    █
   █  🔑 OTP CODE: 123456                                              █
   █                                                                    █
   █  ⏰ Expires: 10 minutes                                           █
   █                                                                    █
   ██████████████████████████████████████████████████████████████████████
   ```

## ❌ Common Mistakes

1. **Looking in the wrong terminal** - OTP appears in the SERVER terminal (Terminal 1), not the command terminal (Terminal 2)

2. **Using the same terminal** - If you run commands in the server terminal, it stops the server

3. **Rate limiting** - After 3 registration attempts, you'll be blocked for 1 hour
   - Solution: Use different email addresses
   - Or wait 1 hour
   - Or restart MongoDB to clear rate limit data

4. **Old server code** - If you don't see the OTP box:
   - Stop the server (Ctrl+C)
   - Start it again: `node index.js`

## 🧪 Test Script

Save this as `test-registration.ps1`:

```powershell
# Test Registration with OTP Display
Write-Host "`n=== OTP Registration Test ===" -ForegroundColor Cyan

# Generate unique data
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$email = "test${timestamp}@example.com"

Write-Host "`n1. Registering user: $email" -ForegroundColor Yellow

$body = @{
    username = "user$timestamp"
    name = "Test User"
    email = $email
    password = "Test@1234"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:5000/api/auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "📧 Email: $($response.email)" -ForegroundColor Gray
    
    Write-Host "`n" -ForegroundColor Yellow
    Write-Host "████████████████████████████████████████████████████" -ForegroundColor Yellow
    Write-Host "█                                                  █" -ForegroundColor Yellow
    Write-Host "█  👆 CHECK THE SERVER TERMINAL NOW!              █" -ForegroundColor Yellow
    Write-Host "█                                                  █" -ForegroundColor Yellow
    Write-Host "█  Look for a BOX with your OTP code inside       █" -ForegroundColor Yellow
    Write-Host "█                                                  █" -ForegroundColor Yellow
    Write-Host "████████████████████████████████████████████████████" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host "❌ Registration failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Message -like "*Too many*") {
        Write-Host "`n⚠️  Rate limit reached. Wait 1 hour or use a different email pattern." -ForegroundColor Yellow
    }
}
```

Run it:
```powershell
.\test-registration.ps1
```

## 🔧 Troubleshooting

### Server won't start
```powershell
# Check if node is already running
Get-Process -Name node

# Kill all node processes
Get-Process -Name node | Stop-Process -Force

# Try starting again
cd D:\consultancy\backend
node index.js
```

### Port 5000 already in use
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
Stop-Process -Id PID -Force
```

### MongoDB not connected
```powershell
# Check MongoDB is running
Get-Service -Name MongoDB

# Start MongoDB if stopped
Start-Service -Name MongoDB
```

### Still no OTP visible
1. Make sure you're looking at the **server terminal** (where you ran `node index.js`)
2. Scroll up - the OTP box might have scrolled past
3. The OTP appears IMMEDIATELY after you submit registration
4. Try maximizing the terminal window

## 📱 Using from Frontend

When registering from `http://localhost:5173`:

1. Make sure backend server is running in a terminal
2. Fill out the registration form
3. Click "Register"
4. **Immediately switch to the backend terminal**
5. Scroll to the bottom - you'll see the OTP box
6. Copy the 6-digit code
7. Enter it in the frontend OTP verification screen

## 🎯 Why Email Doesn't Work

Email delivery is blocked because:
- Your network firewall blocks SMTP port 587
- Error: `connect ETIMEDOUT 74.125.130.108:587`

**This is NORMAL** - the system automatically falls back to console display in development mode.

## ✅ Verification Checklist

- [ ] Two terminals open
- [ ] Backend server running in Terminal 1 (`node index.js`)
- [ ] Server shows "MongoDB connected successfully"
- [ ] Registration command run in Terminal 2
- [ ] Looking at Terminal 1 (not Terminal 2)
- [ ] Scrolling to see latest output in Terminal 1

---

**Last Updated**: December 4, 2024
**Status**: System working correctly - OTP displays in server console
