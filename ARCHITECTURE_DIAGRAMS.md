# System Architecture & Flow Diagrams

## Complete Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          MERN AUTHENTICATION SYSTEM                          │
│                     User Registration & OTP Verification                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   FRONTEND   │
│  (React.js)  │
└──────┬───────┘
       │
       │ 1. User fills registration form
       │    (username, name, email, password)
       │
       ▼
┌─────────────────────────────────────────────┐
│  RegisterModern.jsx                         │
│  ├─ Input validation                        │
│  ├─ Password strength indicator             │
│  ├─ Real-time error feedback                │
│  └─ Submit to backend API                   │
└─────────────────┬───────────────────────────┘
                  │
                  │ POST /api/auth/register
                  │ { username, name, email, password }
                  ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND (Node.js + Express)                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Rate Limiter Middleware                           │ │
│  │  ✓ Check IP rate limit (3 per hour)               │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                       │
│                   ▼                                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Validation                                        │ │
│  │  ├─ Check all fields present                      │ │
│  │  ├─ Validate email format                         │ │
│  │  ├─ Validate password strength                    │ │
│  │  ├─ Check username uniqueness                     │ │
│  │  └─ Check email uniqueness                        │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                       │
│                   ▼                                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Security Processing                               │ │
│  │  ├─ Hash password (bcrypt, 10 rounds)             │ │
│  │  ├─ Generate 6-digit OTP                          │ │
│  │  ├─ Hash OTP (bcrypt, 10 rounds)                  │ │
│  │  └─ Set OTP expiry (10 minutes)                   │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                       │
│                   ▼                                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Database Operation                                │ │
│  │  CREATE User {                                     │ │
│  │    username: "johndoe",                            │ │
│  │    name: "John Doe",                               │ │
│  │    email: "john@example.com",                      │ │
│  │    password: "$2a$10$hashed...",                   │ │
│  │    otp: "$2a$10$hashed...",                        │ │
│  │    otpExpiresAt: Date + 10min,                     │ │
│  │    isVerified: false,                              │ │
│  │    otpAttempts: 0                                  │ │
│  │  }                                                 │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                       │
│                   ▼                                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Email Service (Nodemailer)                        │ │
│  │  SEND Email {                                      │ │
│  │    to: "john@example.com",                         │ │
│  │    subject: "Your verification OTP",               │ │
│  │    body: "Your code is: 123456"                    │ │
│  │  }                                                 │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                       │
│                   ▼                                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Audit Logging                                     │ │
│  │  LOG {                                             │ │
│  │    action: "REGISTER_SUCCESS",                     │ │
│  │    email: "john@example.com",                      │ │
│  │    ipAddress: "192.168.1.1",                       │ │
│  │    timestamp: Date.now()                           │ │
│  │  }                                                 │ │
│  └────────────────┬───────────────────────────────────┘ │
└───────────────────┼───────────────────────────────────────┘
                    │
                    │ Response: 201 Created
                    │ { msg: "User registered. OTP sent" }
                    ▼
┌─────────────────────────────────────────────┐
│  User receives email with OTP: 123456       │
└─────────────────┬───────────────────────────┘
                  │
                  │ 2. User opens verification page
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  VerifyOTPModern.jsx                        │
│  ├─ Email input                             │
│  ├─ 6-digit OTP input                       │
│  ├─ Countdown timer (10:00 → 0:00)          │
│  ├─ Attempts remaining (5 → 0)              │
│  └─ Submit button                           │
└─────────────────┬───────────────────────────┘
                  │
                  │ POST /api/auth/verify-otp
                  │ { email, otp: "123456" }
                  ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND (Node.js + Express)                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Rate Limiter Middleware                           │ │
│  │  ✓ Check IP rate limit (10 per 15 min)            │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                       │
│                   ▼                                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Validation & Security Checks                      │ │
│  │  ├─ Find user by email                             │ │
│  │  ├─ Check if already verified                      │ │
│  │  ├─ Check if account locked                        │ │
│  │  ├─ Check OTP expiration                           │ │
│  │  └─ Verify OTP (bcrypt compare)                    │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                       │
│         ┌─────────┴─────────┐                             │
│         │                   │                             │
│    ✅ VALID            ❌ INVALID                         │
│         │                   │                             │
│         ▼                   ▼                             │
│  ┌────────────┐    ┌──────────────────────────────────┐ │
│  │ Success    │    │ Failed Attempt Handling          │ │
│  │            │    │ ├─ Increment otpAttempts         │ │
│  │ UPDATE     │    │ ├─ Check if attempts >= 5        │ │
│  │ User {     │    │ │                                 │ │
│  │   isVerif  │    │ ├─ If YES: Lock account         │ │
│  │   ified:   │    │ │   otpLockedUntil = +15min      │ │
│  │   true,    │    │ │   action: "ACCOUNT_LOCKED"     │ │
│  │   otp:     │    │ │                                 │ │
│  │   null,    │    │ └─ If NO: Return remaining       │ │
│  │   otpAtt   │    │     attemptsRemaining = 5 - n    │ │
│  │   empts:0  │    │                                   │ │
│  │ }          │    │ Response: 400/429                │ │
│  │            │    │ { msg, attemptsRemaining }       │ │
│  │ Response:  │    └──────────────────────────────────┘ │
│  │ 200        │                                          │
│  │ { msg: "V  │                                          │
│  │   erified" │                                          │
│  │ }          │                                          │
│  └────────────┘                                          │
└─────────────────────────────────────────────────────────┘
         │
         │ 3. Redirect to login
         ▼
┌─────────────────────────────────────────────┐
│  LoginModern.jsx                            │
│  ├─ Email input                             │
│  ├─ Password input (show/hide toggle)       │
│  ├─ Remember Me checkbox                    │
│  ├─ Forgot Password link                    │
│  └─ Login button                            │
└─────────────────┬───────────────────────────┘
                  │
                  │ POST /api/auth/login
                  │ { email, password }
                  ▼
┌─────────────────────────────────────────────────────────┐
│  BACKEND (Node.js + Express)                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Rate Limiter Middleware                           │ │
│  │  ✓ Check IP rate limit (5 per 15 min)             │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                       │
│                   ▼                                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Authentication                                    │ │
│  │  ├─ Find user by email                            │ │
│  │  ├─ Verify password (bcrypt compare)              │ │
│  │  ├─ Check if email verified                       │ │
│  │  └─ Generate JWT token                            │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                       │
│         ┌─────────┴─────────┐                             │
│         │                   │                             │
│    ✅ SUCCESS          ❌ FAILURE                         │
│         │                   │                             │
│         ▼                   ▼                             │
│  ┌────────────┐    ┌──────────────────────────────────┐ │
│  │ Generate   │    │ Log Failed Attempt                │ │
│  │ JWT Token  │    │                                   │ │
│  │            │    │ LOG {                             │ │
│  │ const pay  │    │   action: "LOGIN_FAILED",         │ │
│  │ load = {   │    │   email: "john@example.com",      │ │
│  │   userId,  │    │   reason: "Invalid password"      │ │
│  │   email    │    │ }                                 │ │
│  │ };         │    │                                   │ │
│  │            │    │ Response: 400/403                 │ │
│  │ const tok  │    │ { msg: "Invalid credentials" }    │ │
│  │ en = jwt.  │    └──────────────────────────────────┘ │
│  │ sign(      │                                          │
│  │   payload  │                                          │
│  │   secret,  │                                          │
│  │   {exp:'7d │                                          │
│  │   '}       │                                          │
│  │ );         │                                          │
│  │            │                                          │
│  │ LOG {      │                                          │
│  │   action:  │                                          │
│  │   "LOGIN_  │                                          │
│  │   SUCCESS" │                                          │
│  │ }          │                                          │
│  │            │                                          │
│  │ Response:  │                                          │
│  │ 200        │                                          │
│  │ { token,   │                                          │
│  │   user }   │                                          │
│  └────────────┘                                          │
└─────────────────────────────────────────────────────────┘
         │
         │ 4. Store token, redirect to dashboard
         ▼
┌─────────────────────────────────────────────┐
│  Dashboard.jsx                              │
│  ├─ Display user info                       │
│  ├─ Show verification status                │
│  ├─ Account created date                    │
│  └─ Logout button                           │
└─────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                            │
└───────────────────────────────────────────────────────────────┘

Layer 1: FRONTEND VALIDATION
┌────────────────────────────────────────────────────────────┐
│  • Email format validation (regex)                          │
│  • Password strength requirements check                     │
│  • Real-time user feedback                                  │
│  • Client-side sanitization                                 │
└────────────────────────────────────────────────────────────┘
                          ↓
Layer 2: RATE LIMITING (IP-based)
┌────────────────────────────────────────────────────────────┐
│  Endpoint          │ Limit │ Window    │ Purpose           │
│  ─────────────────────────────────────────────────────────│
│  /register         │  3    │ 1 hour    │ Spam prevention   │
│  /verify-otp       │ 10    │ 15 min    │ Brute-force block │
│  /resend-otp       │  3    │ 5 min     │ Email abuse block │
│  /login            │  5    │ 15 min    │ Credential stuff  │
│  /forgot-password  │  5    │ 15 min    │ Reset abuse block │
└────────────────────────────────────────────────────────────┘
                          ↓
Layer 3: INPUT VALIDATION & SANITIZATION
┌────────────────────────────────────────────────────────────┐
│  • Schema validation (Mongoose)                             │
│  • Type checking                                            │
│  • SQL injection prevention                                 │
│  • XSS attack prevention                                    │
│  • Length limits enforcement                                │
└────────────────────────────────────────────────────────────┘
                          ↓
Layer 4: AUTHENTICATION & AUTHORIZATION
┌────────────────────────────────────────────────────────────┐
│  • Password hashing (bcrypt, 10 rounds)                     │
│  • OTP hashing (bcrypt, 10 rounds)                          │
│  • JWT token signing (HS256)                                │
│  • Token expiration (7 days)                                │
│  • Protected route middleware                               │
└────────────────────────────────────────────────────────────┘
                          ↓
Layer 5: ACCOUNT PROTECTION
┌────────────────────────────────────────────────────────────┐
│  • OTP attempt tracking (max 5)                             │
│  • Account locking (15 minutes)                             │
│  • Email verification requirement                           │
│  • Time-based OTP expiration (10 min)                       │
│  • Automatic unlock mechanisms                              │
└────────────────────────────────────────────────────────────┘
                          ↓
Layer 6: AUDIT LOGGING
┌────────────────────────────────────────────────────────────┐
│  Logged Data:                                               │
│  • User ID and email                                        │
│  • Action type (15 event types)                             │
│  • IP address (proxy-aware)                                 │
│  • User agent (browser/device)                              │
│  • Timestamp                                                │
│  • Additional details                                       │
│                                                             │
│  Used for:                                                  │
│  • Security incident investigation                          │
│  • Compliance reporting (GDPR)                              │
│  • Fraud detection                                          │
│  • User behavior analysis                                   │
└────────────────────────────────────────────────────────────┘
                          ↓
Layer 7: DATABASE SECURITY
┌────────────────────────────────────────────────────────────┐
│  • MongoDB with authentication                              │
│  • Indexed fields (email, username)                         │
│  • Unique constraints                                       │
│  • Connection pooling                                       │
│  • Encrypted connections                                    │
└────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW                                   │
└──────────────────────────────────────────────────────────────────────┘

USER                 FRONTEND              BACKEND              DATABASE
 │                      │                      │                    │
 │ 1. Fill form         │                      │                    │
 ├─────────────────────>│                      │                    │
 │                      │                      │                    │
 │                      │ 2. Validate input    │                    │
 │                      │      (client)        │                    │
 │                      │                      │                    │
 │                      │ 3. POST /register    │                    │
 │                      ├─────────────────────>│                    │
 │                      │                      │                    │
 │                      │                      │ 4. Rate limit check│
 │                      │                      │                    │
 │                      │                      │ 5. Validate input  │
 │                      │                      │    (server)        │
 │                      │                      │                    │
 │                      │                      │ 6. Hash password   │
 │                      │                      │                    │
 │                      │                      │ 7. Generate OTP    │
 │                      │                      │                    │
 │                      │                      │ 8. Hash OTP        │
 │                      │                      │                    │
 │                      │                      │ 9. Save user       │
 │                      │                      ├───────────────────>│
 │                      │                      │                    │
 │                      │                      │<───────────────────│
 │                      │                      │ 10. User created   │
 │                      │                      │                    │
 │                      │                      │ 11. Send email     │
 │                      │                      │     (OTP code)     │
 │  ┌──────────────────┐│                      │                    │
 │  │ Email arrives    ││                      │                    │
 │<─┘                   ││                      │                    │
 │                      │                      │ 12. Log audit      │
 │                      │                      ├───────────────────>│
 │                      │                      │                    │
 │                      │<─────────────────────│                    │
 │                      │ 13. Success response │                    │
 │<─────────────────────│                      │                    │
 │ 14. Show success msg │                      │                    │
 │                      │                      │                    │
 │ 15. Navigate to      │                      │                    │
 │     verify page      │                      │                    │
 ├─────────────────────>│                      │                    │
 │                      │                      │                    │
 │ 16. Enter OTP code   │                      │                    │
 ├─────────────────────>│                      │                    │
 │                      │                      │                    │
 │                      │ 17. POST /verify-otp │                    │
 │                      ├─────────────────────>│                    │
 │                      │                      │                    │
 │                      │                      │ 18. Fetch user     │
 │                      │                      ├───────────────────>│
 │                      │                      │<───────────────────│
 │                      │                      │                    │
 │                      │                      │ 19. Check lock     │
 │                      │                      │                    │
 │                      │                      │ 20. Verify OTP     │
 │                      │                      │     (bcrypt)       │
 │                      │                      │                    │
 │                      │                      │ 21. Update user    │
 │                      │                      │     isVerified=true│
 │                      │                      ├───────────────────>│
 │                      │                      │<───────────────────│
 │                      │                      │                    │
 │                      │                      │ 22. Log audit      │
 │                      │                      ├───────────────────>│
 │                      │                      │                    │
 │                      │<─────────────────────│                    │
 │                      │ 23. Success response │                    │
 │<─────────────────────│                      │                    │
 │ 24. Show verified msg│                      │                    │
 │                      │                      │                    │
 │ 25. Navigate to login│                      │                    │
 ├─────────────────────>│                      │                    │
 │                      │                      │                    │
 │ 26. Enter credentials│                      │                    │
 ├─────────────────────>│                      │                    │
 │                      │                      │                    │
 │                      │ 27. POST /login      │                    │
 │                      ├─────────────────────>│                    │
 │                      │                      │                    │
 │                      │                      │ 28. Authenticate   │
 │                      │                      ├───────────────────>│
 │                      │                      │<───────────────────│
 │                      │                      │                    │
 │                      │                      │ 29. Generate JWT   │
 │                      │                      │                    │
 │                      │                      │ 30. Log audit      │
 │                      │                      ├───────────────────>│
 │                      │                      │                    │
 │                      │<─────────────────────│                    │
 │                      │ 31. { token, user }  │                    │
 │<─────────────────────│                      │                    │
 │ 32. Store token      │                      │                    │
 │                      │                      │                    │
 │ 33. Navigate to      │                      │                    │
 │     dashboard        │                      │                    │
 ├─────────────────────>│                      │                    │
 │                      │                      │                    │
 │                      │ 34. GET /profile     │                    │
 │                      │    (with JWT token)  │                    │
 │                      ├─────────────────────>│                    │
 │                      │                      │                    │
 │                      │                      │ 35. Verify JWT     │
 │                      │                      │                    │
 │                      │                      │ 36. Fetch profile  │
 │                      │                      ├───────────────────>│
 │                      │                      │<───────────────────│
 │                      │                      │                    │
 │                      │<─────────────────────│                    │
 │                      │ 37. User profile     │                    │
 │<─────────────────────│                      │                    │
 │ 38. Display dashboard│                      │                    │
 │                      │                      │                    │
```

---

## Technology Stack

```
┌───────────────────────────────────────────────────────────────┐
│                      MERN STACK                                │
└───────────────────────────────────────────────────────────────┘

FRONTEND (React.js 19.2.0)
├── Build Tool: Vite 7.2.5
├── Routing: Hash-based routing
├── Styling: Inline CSS-in-JS
├── State: React Hooks (useState, useEffect)
└── HTTP: Fetch API

BACKEND (Node.js + Express.js 5.1.0)
├── Authentication: jsonwebtoken 9.0.2
├── Password Hashing: bcryptjs 3.0.3
├── Email: nodemailer 7.0.11
├── Rate Limiting: express-rate-limit 8.2.1
├── Security: cors 2.8.5
└── Environment: dotenv 17.2.3

DATABASE (MongoDB + Mongoose 9.0.0)
├── User Collection
├── AuditLog Collection
├── Indexes on email, username
└── TTL index on audit logs

TESTING
├── Jest 30.2.0
├── Supertest 7.1.4
└── MongoDB Memory Server 10.3.0

DEPLOYMENT
├── Backend: Node.js server (PM2)
├── Frontend: Static files (Nginx)
├── Database: MongoDB Atlas
└── Email: Gmail SMTP
```

---

## File Structure

```
consultancy/
│
├── backend/
│   ├── index.js                      # Express server entry
│   ├── package.json                  # Dependencies
│   ├── jest.config.js                # Test configuration
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Environment template
│   │
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   │
│   ├── models/
│   │   ├── user.js                   # User schema
│   │   └── auditLog.js               # Audit log schema
│   │
│   ├── routes/
│   │   └── auth.js                   # Auth endpoints
│   │
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification
│   │   └── rateLimiter.js            # Rate limit configs
│   │
│   ├── utils/
│   │   └── auditLogger.js            # Audit utilities
│   │
│   └── tests/
│       └── auth.test.js              # Integration tests
│
├── frontend/
│   ├── index.html                    # HTML entry
│   ├── package.json                  # Dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Environment template
│   │
│   ├── src/
│   │   ├── main.jsx                  # React entry
│   │   ├── App.jsx                   # Main component
│   │   ├── App.css                   # Global styles
│   │   │
│   │   └── components/
│   │       ├── LoginModern.jsx       # Login page
│   │       ├── RegisterModern.jsx    # Registration page
│   │       ├── VerifyOTPModern.jsx   # OTP verification
│   │       ├── Dashboard.jsx         # User dashboard
│   │       ├── ForgotPassword.jsx    # Password reset
│   │       └── ResetPassword.jsx     # New password
│   │
│   └── public/                       # Static assets
│
└── Documentation/
    ├── README.md                     # Project overview
    ├── QUICKSTART.md                 # Setup guide
    ├── API_DOCUMENTATION.md          # API reference
    ├── SECURITY_DEPLOYMENT.md        # Security & deploy
    ├── IMPLEMENTATION_SUMMARY.md     # Feature summary
    ├── USER_GUIDE.md                 # End-user guide
    └── ARCHITECTURE_DIAGRAMS.md      # This file
```

---

This comprehensive diagram system provides visual understanding of:
- Complete authentication flow
- Security architecture layers
- Detailed data flow between components
- Technology stack overview
- Project file structure

Use these diagrams for:
- Onboarding new developers
- System documentation
- Architecture presentations
- Troubleshooting issues
- Planning enhancements
