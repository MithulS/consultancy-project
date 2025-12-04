# Test Registration with OTP Display
# Save as: test-registration.ps1
# Run from: D:\consultancy\backend

Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "║          OTP REGISTRATION TEST                        ║" -ForegroundColor Cyan
Write-Host "║                                                       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Generate unique data
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$email = "test${timestamp}@example.com"

Write-Host "📝 Test Data:" -ForegroundColor Yellow
Write-Host "   Email: $email" -ForegroundColor Gray
Write-Host "   Username: user$timestamp" -ForegroundColor Gray
Write-Host "   Password: Test@1234`n" -ForegroundColor Gray

Write-Host "🚀 Sending registration request..." -ForegroundColor Cyan

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
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "`n✅ SUCCESS! Registration completed" -ForegroundColor Green
    Write-Host "📧 Registered Email: $($response.email)" -ForegroundColor Gray
    Write-Host "💬 Message: $($response.msg)`n" -ForegroundColor Gray
    
    Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║                                                                   ║" -ForegroundColor Yellow
    Write-Host "║   👆👆👆  NOW CHECK THE SERVER TERMINAL!  👆👆👆            ║" -ForegroundColor Yellow
    Write-Host "║                                                                   ║" -ForegroundColor Yellow
    Write-Host "║   The OTP code is displayed there in a BOX format like this:     ║" -ForegroundColor Yellow
    Write-Host "║                                                                   ║" -ForegroundColor Yellow
    Write-Host "║   ██████████████████████████████████████████████████████████     ║" -ForegroundColor Yellow
    Write-Host "║   █  📧 OTP EMAIL (DEVELOPMENT MODE)                      █     ║" -ForegroundColor Yellow
    Write-Host "║   █  🔑 OTP CODE: 123456                                  █     ║" -ForegroundColor Yellow
    Write-Host "║   ██████████████████████████████████████████████████████████     ║" -ForegroundColor Yellow
    Write-Host "║                                                                   ║" -ForegroundColor Yellow
    Write-Host "║   Look in the terminal where you ran: node index.js              ║" -ForegroundColor Yellow
    Write-Host "║                                                                   ║" -ForegroundColor Yellow
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Yellow
    
    Write-Host "💡 TIP: If you don't see it, scroll up in the server terminal`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ REGISTRATION FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*Too many*") {
        Write-Host "⚠️  RATE LIMIT REACHED" -ForegroundColor Yellow
        Write-Host "   You've made too many registration attempts." -ForegroundColor Gray
        Write-Host "   Solutions:" -ForegroundColor Gray
        Write-Host "   1. Wait 1 hour" -ForegroundColor Gray
        Write-Host "   2. Use a different email pattern" -ForegroundColor Gray
        Write-Host "   3. Restart MongoDB to clear limits`n" -ForegroundColor Gray
    }
    elseif ($_.Exception.Message -like "*connect*") {
        Write-Host "⚠️  CANNOT CONNECT TO SERVER" -ForegroundColor Yellow
        Write-Host "   Make sure the backend server is running:" -ForegroundColor Gray
        Write-Host "   cd D:\consultancy\backend" -ForegroundColor Gray
        Write-Host "   node index.js`n" -ForegroundColor Gray
    }
    else {
        Write-Host "   Check the server terminal for error details`n" -ForegroundColor Gray
    }
}
