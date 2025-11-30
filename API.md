# 📡 API Documentation

Complete API reference for the MERN Authentication System.

## Base URL

```
http://localhost:5000/api/auth
```

---

## Endpoints

### 1. Register User

Creates a new user account and sends OTP to email.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- `name`: Required, non-empty string
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (!@#$%^&*)

**Success Response (201):**
```json
{
  "msg": "User registered. OTP sent to email.",
  "email": "john@example.com"
}
```

**Error Responses:**

400 - Missing fields:
```json
{
  "msg": "Missing fields"
}
```

400 - Email already registered:
```json
{
  "msg": "Email already registered"
}
```

500 - Email send failure:
```json
{
  "msg": "Failed to send OTP email. Check EMAIL config.",
  "error": "Error details"
}
```

**Notes:**
- OTP is valid for 10 minutes
- Password is hashed using bcrypt before storage
- User account created with `isVerified: false`

---

### 2. Verify OTP

Verifies the email address using the OTP sent during registration.

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Validation Rules:**
- `email`: Required, must match registered email
- `otp`: Required, 6-digit string

**Success Response (200):**
```json
{
  "msg": "Email verified successfully"
}
```

**Error Responses:**

400 - Missing fields:
```json
{
  "msg": "Missing fields"
}
```

400 - User not found:
```json
{
  "msg": "No user found with this email"
}
```

400 - Already verified:
```json
{
  "msg": "User already verified"
}
```

400 - OTP expired:
```json
{
  "msg": "OTP expired or not set. Please request a new OTP."
}
```

400 - Invalid OTP:
```json
{
  "msg": "Invalid OTP"
}
```

**Notes:**
- OTP is hashed in database, verified using bcrypt
- After successful verification, OTP fields are cleared
- User status updated to `isVerified: true`

---

### 3. Resend OTP

Generates and sends a new OTP to the user's email.

**Endpoint:** `POST /api/auth/resend-otp`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Validation Rules:**
- `email`: Required, must match registered email
- User must not be verified already

**Success Response (200):**
```json
{
  "msg": "OTP resent to email"
}
```

**Error Responses:**

400 - Missing email:
```json
{
  "msg": "Missing email"
}
```

400 - User not found:
```json
{
  "msg": "No user found"
}
```

400 - Already verified:
```json
{
  "msg": "User already verified"
}
```

500 - Email send failure:
```json
{
  "msg": "Failed to send OTP email. Check EMAIL config.",
  "error": "Error details"
}
```

**Notes:**
- New OTP overwrites old one
- New expiration time set (10 minutes from resend)
- Old OTP becomes invalid

---

### 4. Login

Authenticates user and returns JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- `email`: Required, valid email
- `password`: Required
- User must be verified

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**

400 - Missing fields:
```json
{
  "msg": "Missing fields"
}
```

400 - Invalid credentials:
```json
{
  "msg": "Invalid credentials"
}
```

403 - Email not verified:
```json
{
  "msg": "Email not verified"
}
```

**Notes:**
- JWT token expires in 7 days
- Token contains: `userId`, `email`
- Password verified using bcrypt comparison
- Store token securely on client (localStorage/sessionStorage)

---

### 5. Get Profile (Protected)

Retrieves authenticated user's profile information.

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

401 - No token:
```json
{
  "msg": "No token, authorization denied"
}
```

401 - Invalid token:
```json
{
  "msg": "Token is not valid"
}
```

401 - Expired token:
```json
{
  "msg": "Token has expired"
}
```

404 - User not found:
```json
{
  "msg": "User not found"
}
```

**Notes:**
- Requires valid JWT in Authorization header
- Password and OTP fields excluded from response
- Protected by authentication middleware

---

## Authentication Flow

### Complete Registration & Login Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB
    participant Email

    Client->>API: POST /register
    API->>DB: Create user (unverified)
    API->>Email: Send OTP
    Email-->>Client: 6-digit OTP
    API-->>Client: Success message
    
    Client->>API: POST /verify-otp
    API->>DB: Verify & update user
    API-->>Client: Verified success
    
    Client->>API: POST /login
    API->>DB: Check credentials
    API-->>Client: JWT token + user data
    
    Client->>API: GET /profile (with token)
    API->>DB: Fetch user data
    API-->>Client: User profile
```

---

## Error Codes Reference

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 200 | Success | Request completed successfully |
| 201 | Created | User registered successfully |
| 400 | Bad Request | Invalid input, validation error |
| 401 | Unauthorized | Missing/invalid/expired token |
| 403 | Forbidden | Email not verified |
| 404 | Not Found | User doesn't exist |
| 500 | Server Error | Database/email service error |

---

## Request Examples

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Using JavaScript Fetch

**Register:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});
const data = await response.json();
console.log(data);
```

**Login:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});
const data = await response.json();
localStorage.setItem('token', data.token);
```

**Get Profile:**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:5000/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
console.log(data);
```

### Using Python Requests

**Register:**
```python
import requests

response = requests.post(
    'http://localhost:5000/api/auth/register',
    json={
        'name': 'John Doe',
        'email': 'john@example.com',
        'password': 'SecurePass123!'
    }
)
print(response.json())
```

**Get Profile:**
```python
import requests

token = 'your_jwt_token_here'
headers = {'Authorization': f'Bearer {token}'}

response = requests.get(
    'http://localhost:5000/api/auth/profile',
    headers=headers
)
print(response.json())
```

---

## Rate Limiting (Future Enhancement)

Consider implementing rate limiting for production:

```javascript
// Example rate limit configuration
{
  register: 3 requests per hour per IP,
  verify-otp: 5 requests per 15 minutes per email,
  resend-otp: 3 requests per hour per email,
  login: 10 requests per hour per IP
}
```

---

## Security Best Practices

### Client-Side (Frontend)

1. **Token Storage:**
   - Store JWT in `localStorage` or `httpOnly` cookies
   - Clear token on logout
   - Don't expose token in URL or logs

2. **Password Validation:**
   - Validate before sending to API
   - Show password strength indicator
   - Prevent common passwords

3. **HTTPS:**
   - Always use HTTPS in production
   - Never send credentials over HTTP

### Server-Side (Backend)

1. **Password Hashing:**
   - Always hash passwords with bcrypt
   - Use appropriate salt rounds (10+)
   - Never log or expose passwords

2. **JWT Security:**
   - Use strong, random secret key
   - Set appropriate expiration time
   - Validate on every protected route

3. **Input Validation:**
   - Validate all inputs server-side
   - Sanitize user data
   - Use prepared statements (MongoDB)

4. **Email Security:**
   - Use App Passwords, not account password
   - Limit OTP resend frequency
   - Expire OTPs appropriately

---

## Testing Endpoints

### Postman Collection

Import this collection to test all endpoints:

```json
{
  "info": {
    "name": "MERN Auth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/auth/register",
        "body": {
          "mode": "raw",
          "raw": "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"Test@123\"}"
        }
      }
    },
    {
      "name": "Verify OTP",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/auth/verify-otp",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@example.com\",\"otp\":\"123456\"}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test@example.com\",\"password\":\"Test@123\"}"
        }
      }
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/auth/profile",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## Changelog

### Version 1.0.0 (Current)
- User registration with email verification
- OTP-based email verification
- JWT authentication
- Protected profile endpoint
- Resend OTP functionality

### Future Enhancements
- Password reset functionality
- Refresh token support
- Social authentication (Google, Facebook)
- Two-factor authentication (2FA)
- Rate limiting
- Account deactivation
- Email change with verification
- Role-based access control (RBAC)

---

Last Updated: November 30, 2025
