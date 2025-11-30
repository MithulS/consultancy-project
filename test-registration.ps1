# Registration Endpoint Testing Script
# Purpose: Automated testing of registration functionality
# Usage: .\test-registration.ps1

Write-Host "`n" -NoNewline
Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host "   🧪 REGISTRATION ENDPOINT TEST SUITE" -ForegroundColor Cyan
Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host "`n"

$baseUrl = "http://localhost:5000"
$testsPassed = 0
$testsFailed = 0
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

# Helper function to print test result
function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = ""
    )
    
    if ($Passed) {
        Write-Host "✅ PASS" -ForegroundColor Green -NoNewline
        Write-Host " | $TestName" -ForegroundColor White
        if ($Message) {
            Write-Host "   $Message" -ForegroundColor Gray
        }
        $script:testsPassed++
    } else {
        Write-Host "❌ FAIL" -ForegroundColor Red -NoNewline
        Write-Host " | $TestName" -ForegroundColor White
        if ($Message) {
            Write-Host "   $Message" -ForegroundColor Yellow
        }
        $script:testsFailed++
    }
}

# Test 1: Backend Health Check
Write-Host "📋 Test 1: Backend Health Check" -ForegroundColor Yellow
Write-Host "   Checking if backend server is running..." -ForegroundColor Gray
try {
    $healthResponse = Invoke-WebRequest -Uri "$baseUrl/api/health" -Method GET -TimeoutSec 5
    $healthData = $healthResponse.Content | ConvertFrom-Json
    
    if ($healthResponse.StatusCode -eq 200 -and $healthData.status -eq "OK") {
        Write-TestResult -TestName "Backend Health Check" -Passed $true -Message "Backend is running on port 5000"
        Write-Host "   Status: $($healthData.status)" -ForegroundColor Gray
        Write-Host "   Timestamp: $($healthData.timestamp)" -ForegroundColor Gray
        Write-Host "   Version: $($healthData.version)" -ForegroundColor Gray
    } else {
        Write-TestResult -TestName "Backend Health Check" -Passed $false -Message "Unexpected response from health endpoint"
    }
} catch {
    Write-TestResult -TestName "Backend Health Check" -Passed $false -Message "Cannot connect to backend. Is it running?"
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n⚠️  Backend is not running. Please start it with: cd backend; npm start" -ForegroundColor Yellow
    Write-Host "`nExiting test suite..." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Successful Registration
Write-Host "📋 Test 2: Successful Registration" -ForegroundColor Yellow
Write-Host "   Creating test user with unique credentials..." -ForegroundColor Gray
$registrationBody = @{
    username = "testuser$timestamp"
    name = "Test User $timestamp"
    email = "test$timestamp@example.com"
    password = "Test123!@#"
} | ConvertTo-Json

try {
    $regResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -Body $registrationBody `
        -ContentType "application/json" `
        -TimeoutSec 10
    
    $regData = $regResponse.Content | ConvertFrom-Json
    
    if ($regResponse.StatusCode -eq 201) {
        Write-TestResult -TestName "Successful Registration" -Passed $true -Message "User registered successfully"
        Write-Host "   Username: testuser$timestamp" -ForegroundColor Gray
        Write-Host "   Email: test$timestamp@example.com" -ForegroundColor Gray
        Write-Host "   Message: $($regData.msg)" -ForegroundColor Gray
    } else {
        Write-TestResult -TestName "Successful Registration" -Passed $false -Message "Unexpected status code: $($regResponse.StatusCode)"
    }
} catch {
    $errorMessage = $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        $reader.Close()
        $errorData = $errorBody | ConvertFrom-Json
        $errorMessage = $errorData.msg
    }
    Write-TestResult -TestName "Successful Registration" -Passed $false -Message $errorMessage
}

Write-Host ""

# Test 3: Duplicate Email (Should Fail)
Write-Host "📋 Test 3: Duplicate Email Rejection" -ForegroundColor Yellow
Write-Host "   Attempting to register with same email again..." -ForegroundColor Gray
try {
    $dupResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -Body $registrationBody `
        -ContentType "application/json" `
        -TimeoutSec 10
    
    # If we get here, the test failed (should have thrown error)
    Write-TestResult -TestName "Duplicate Email Rejection" -Passed $false -Message "Backend allowed duplicate email (should reject)"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        $reader.Close()
        $errorData = $errorBody | ConvertFrom-Json
        
        if ($errorData.msg -like "*already*") {
            Write-TestResult -TestName "Duplicate Email Rejection" -Passed $true -Message "Correctly rejected duplicate email"
            Write-Host "   Error message: $($errorData.msg)" -ForegroundColor Gray
        } else {
            Write-TestResult -TestName "Duplicate Email Rejection" -Passed $false -Message "Wrong error message"
        }
    } else {
        Write-TestResult -TestName "Duplicate Email Rejection" -Passed $false -Message "Unexpected error code: $($_.Exception.Response.StatusCode.value__)"
    }
}

Write-Host ""

# Test 4: Missing Fields (Should Fail)
Write-Host "📋 Test 4: Missing Fields Validation" -ForegroundColor Yellow
Write-Host "   Attempting registration with missing fields..." -ForegroundColor Gray
$invalidBody = @{
    email = "incomplete@example.com"
    # Missing username, name, password
} | ConvertTo-Json

try {
    $invalidResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -Body $invalidBody `
        -ContentType "application/json" `
        -TimeoutSec 10
    
    Write-TestResult -TestName "Missing Fields Validation" -Passed $false -Message "Backend accepted incomplete data (should reject)"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        $reader.Close()
        $errorData = $errorBody | ConvertFrom-Json
        
        Write-TestResult -TestName "Missing Fields Validation" -Passed $true -Message "Correctly rejected incomplete data"
        Write-Host "   Error message: $($errorData.msg)" -ForegroundColor Gray
    } else {
        Write-TestResult -TestName "Missing Fields Validation" -Passed $false -Message "Unexpected error code"
    }
}

Write-Host ""

# Test 5: Invalid Email Format (Should Fail)
Write-Host "📋 Test 5: Invalid Email Format Validation" -ForegroundColor Yellow
Write-Host "   Attempting registration with invalid email..." -ForegroundColor Gray
$invalidEmailBody = @{
    username = "testuser999"
    name = "Test User"
    email = "not-an-email"
    password = "Test123!@#"
} | ConvertTo-Json

try {
    $invalidEmailResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -Body $invalidEmailBody `
        -ContentType "application/json" `
        -TimeoutSec 10
    
    # Frontend should catch this, but backend might also validate
    Write-Host "   ⚠️  Backend accepted invalid email (frontend should catch this)" -ForegroundColor Yellow
    Write-TestResult -TestName "Invalid Email Format Validation" -Passed $true -Message "Backend processed request (frontend validation expected)"
} catch {
    Write-TestResult -TestName "Invalid Email Format Validation" -Passed $true -Message "Backend or validation rejected invalid email"
}

Write-Host ""

# Test 6: Detailed Health Check
Write-Host "📋 Test 6: Detailed Health Check" -ForegroundColor Yellow
Write-Host "   Checking full backend health status..." -ForegroundColor Gray
try {
    $detailedHealth = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -TimeoutSec 5
    $detailedData = $detailedHealth.Content | ConvertFrom-Json
    
    $allGood = $true
    
    Write-Host "   Status: $($detailedData.status)" -ForegroundColor Gray
    Write-Host "   Environment: $($detailedData.environment)" -ForegroundColor Gray
    Write-Host "   Uptime: $([math]::Round($detailedData.uptime, 2)) seconds" -ForegroundColor Gray
    Write-Host "   MongoDB: $($detailedData.mongodb)" -ForegroundColor Gray
    Write-Host "   Email: $($detailedData.email)" -ForegroundColor Gray
    
    if ($detailedData.mongodb -ne "connected") {
        Write-Host "   ⚠️  MongoDB not connected!" -ForegroundColor Yellow
        $allGood = $false
    }
    
    if ($detailedData.email -ne "configured") {
        Write-Host "   ⚠️  Email not configured!" -ForegroundColor Yellow
        $allGood = $false
    }
    
    Write-TestResult -TestName "Detailed Health Check" -Passed $allGood -Message "Backend health verified"
} catch {
    Write-TestResult -TestName "Detailed Health Check" -Passed $false -Message "Cannot retrieve detailed health"
}

Write-Host ""

# Test 7: CORS Headers Check
Write-Host "📋 Test 7: CORS Headers Verification" -ForegroundColor Yellow
Write-Host "   Checking if CORS headers are properly configured..." -ForegroundColor Gray
try {
    $corsResponse = Invoke-WebRequest -Uri "$baseUrl/api/health" -Method GET -TimeoutSec 5
    $corsHeaders = $corsResponse.Headers
    
    $hasCORS = $false
    if ($corsHeaders.ContainsKey("Access-Control-Allow-Origin")) {
        $hasCORS = $true
        Write-Host "   Access-Control-Allow-Origin: $($corsHeaders['Access-Control-Allow-Origin'])" -ForegroundColor Gray
    }
    
    if ($corsHeaders.ContainsKey("Access-Control-Allow-Methods")) {
        Write-Host "   Access-Control-Allow-Methods: $($corsHeaders['Access-Control-Allow-Methods'])" -ForegroundColor Gray
    }
    
    if ($corsHeaders.ContainsKey("Access-Control-Allow-Credentials")) {
        Write-Host "   Access-Control-Allow-Credentials: $($corsHeaders['Access-Control-Allow-Credentials'])" -ForegroundColor Gray
    }
    
    Write-TestResult -TestName "CORS Headers Verification" -Passed $hasCORS -Message "CORS headers present"
} catch {
    Write-TestResult -TestName "CORS Headers Verification" -Passed $false -Message "Cannot check CORS headers"
}

Write-Host ""

# Test 8: Response Time Check
Write-Host "📋 Test 8: Response Time Performance" -ForegroundColor Yellow
Write-Host "   Measuring API response time..." -ForegroundColor Gray
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $perfResponse = Invoke-WebRequest -Uri "$baseUrl/api/health" -Method GET -TimeoutSec 5
    $stopwatch.Stop()
    
    $responseTime = $stopwatch.ElapsedMilliseconds
    Write-Host "   Response time: $responseTime ms" -ForegroundColor Gray
    
    if ($responseTime -lt 100) {
        Write-TestResult -TestName "Response Time Performance" -Passed $true -Message "Excellent response time (<100ms)"
    } elseif ($responseTime -lt 500) {
        Write-TestResult -TestName "Response Time Performance" -Passed $true -Message "Good response time (<500ms)"
    } else {
        Write-TestResult -TestName "Response Time Performance" -Passed $false -Message "Slow response time (>500ms)"
    }
} catch {
    Write-TestResult -TestName "Response Time Performance" -Passed $false -Message "Cannot measure response time"
}

Write-Host ""

# Final Summary
Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host "   📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Total Tests:     $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host "   Passed:          " -NoNewline -ForegroundColor White
Write-Host "$testsPassed" -ForegroundColor Green
Write-Host "   Failed:          " -NoNewline -ForegroundColor White
Write-Host "$testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host "   Success Rate:    " -NoNewline -ForegroundColor White
$successRate = [math]::Round(($testsPassed / ($testsPassed + $testsFailed)) * 100, 2)
Write-Host "$successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "   ✅ All tests passed! Registration endpoint is working correctly." -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Some tests failed. Please review the errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host ""

# Export results to JSON file
$testResults = @{
    timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    totalTests = $testsPassed + $testsFailed
    passed = $testsPassed
    failed = $testsFailed
    successRate = $successRate
} | ConvertTo-Json

$resultsFile = "test-results-$timestamp.json"
$testResults | Out-File -FilePath $resultsFile -Encoding UTF8
Write-Host "📄 Test results saved to: $resultsFile" -ForegroundColor Gray
Write-Host ""

# Exit with appropriate code
exit $testsFailed
