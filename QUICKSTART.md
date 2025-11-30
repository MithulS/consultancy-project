# 🚀 Quick Start Guide

Get the MERN Authentication System running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js installed (v14+)
- [ ] MongoDB installed and running
- [ ] Gmail account with 2FA enabled
- [ ] Code editor (VS Code recommended)

## Step 1: Clone & Install (2 minutes)

```bash
# Navigate to project directory
cd consultancy

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Environment Setup (2 minutes)

### Backend Configuration

Create `backend/.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/consultancy_db
JWT_SECRET=generate-random-secret-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
CLIENT_URL=http://localhost:5173
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Get Gmail App Password:**
1. Visit: https://myaccount.google.com/apppasswords
2. Select "Mail" → "Other (Custom name)" → "MERN Auth"
3. Copy the 16-character password (no spaces)
4. Paste as `EMAIL_PASS` value

### Frontend Configuration

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000
```

## Step 3: Start MongoDB (30 seconds)

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# OR
brew services start mongodb-community
```

Verify: MongoDB should be running on port 27017

## Step 4: Launch Application (1 minute)

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
✅ Server running on http://localhost:5000

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend running on http://localhost:5173

## Step 5: Test It! (2 minutes)

1. Open browser: http://localhost:5173
2. Register with your email
3. Check email for OTP
4. Verify email
5. Login
6. View dashboard

**Done!** 🎉

---

## Quick Verification

### Backend Health Check
```bash
curl http://localhost:5000/api/auth/profile
```
Expected: `{"msg":"No token, authorization denied"}`

### Frontend Health Check
Open http://localhost:5173 - Should see registration form

### MongoDB Health Check
```bash
mongosh
> show dbs
> use consultancy_db
> show collections
```

---

## Common Issues

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Start MongoDB
mongod  # or: brew services start mongodb-community
```

### "Failed to send OTP email"
- Verify EMAIL_USER and EMAIL_PASS in backend/.env
- Check that 2FA is enabled on Google account
- Ensure App Password is exactly 16 characters
- Check backend console for specific error

### "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill
```

### "Cannot GET /"
Frontend should run on port 5173, not 5000
Backend is on port 5000

---

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Check [TESTING.md](TESTING.md) for test scenarios
- Customize the UI in `frontend/src/components/`
- Add more features to the API

---

## Project Structure Quick Reference

```
consultancy/
├── backend/
│   ├── .env                   ← Configure this!
│   ├── index.js               ← Server entry
│   ├── routes/auth.js         ← API endpoints
│   └── models/user.js         ← User schema
│
├── frontend/
│   ├── .env                   ← Configure this!
│   └── src/
│       ├── App.jsx            ← Main component
│       └── components/        ← UI components
│
└── README.md                  ← Full documentation
```

---

## Development Commands

### Backend
```bash
npm start       # Production mode
npm run dev     # Development mode (nodemon)
```

### Frontend
```bash
npm run dev     # Development server
npm run build   # Build for production
npm run preview # Preview production build
```

---

## Need Help?

1. Check the error message in browser console (F12)
2. Check backend terminal for errors
3. Review [TESTING.md](TESTING.md) for test scenarios
4. Check [README.md](README.md) troubleshooting section

---

**Pro Tips:**
- Use MongoDB Compass for visual database management
- Use Postman to test API endpoints directly
- Enable nodemon for auto-restart on code changes
- Check email spam folder if OTP not received

---

Last Updated: November 30, 2025
