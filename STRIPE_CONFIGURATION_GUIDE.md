# Stripe Payment Integration Configuration Guide

## Overview
This guide will help you configure Stripe payment processing for ElectroStore.

## Prerequisites
1. Stripe account (sign up at https://stripe.com)
2. Test API keys for development
3. Live API keys for production (after testing)

---

## Step 1: Get Your Stripe API Keys

### For Testing (Development):
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### For Production:
1. Complete Stripe account verification
2. Go to https://dashboard.stripe.com/apikeys
3. Copy your **Live Publishable key** (starts with `pk_live_`)
4. Copy your **Live Secret key** (starts with `sk_live_`)

---

## Step 2: Configure Backend

### Add to `backend/.env`:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Webhook Secret (for production)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# For production, use live keys:
# STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
# STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
```

### Example with test keys:
```env
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY_HERE
```

---

## Step 3: Configure Frontend

### Add to `frontend/.env`:
```env
# Stripe Publishable Key (safe to expose in frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# For production:
# VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
```

**Important**: Only use publishable keys (pk_*) in frontend. Never expose secret keys (sk_*) in client-side code!

---

## Step 4: Test Payment Flow

### Test Card Numbers:
Stripe provides test card numbers for development:

| Card Number         | Brand      | Result                           |
|---------------------|------------|----------------------------------|
| 4242 4242 4242 4242 | Visa       | ✅ Success                        |
| 4000 0025 0000 3155 | Visa       | ✅ Success (requires 3D Secure)   |
| 4000 0000 0000 9995 | Visa       | ❌ Declined (insufficient funds)  |
| 4000 0000 0000 0002 | Visa       | ❌ Declined (card declined)       |
| 5555 5555 5555 4444 | Mastercard | ✅ Success                        |
| 3782 822463 10005   | Amex       | ✅ Success                        |

**Any future expiry date** (e.g., 12/34)  
**Any 3-digit CVC** (e.g., 123)  
**Any ZIP code** (e.g., 12345)

### Testing Steps:
1. Start your backend: `cd backend && npm start`
2. Start your frontend: `cd frontend && npm run dev`
3. Add items to cart
4. Go to checkout
5. Select "Credit/Debit Card" payment method
6. Use test card: `4242 4242 4242 4242`
7. Enter any future expiry, CVC, and ZIP
8. Complete order
9. Check Stripe Dashboard → Payments to see the test payment

---

## Step 5: Verify Configuration

### Check Backend Environment:
```bash
cd backend
node -e "console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...')"
```

### Check Frontend Environment:
```bash
cd frontend
node -e "console.log('Vite Stripe Key:', process.env.VITE_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) + '...')"
```

### Check Browser Console:
Open DevTools → Console and look for:
```
Stripe initialized with publishable key: pk_test_...
```

---

## Step 6: Production Deployment

### Before going live:

1. **Switch to Live Keys**:
   - Update `.env` files with `pk_live_` and `sk_live_` keys
   - Remove test keys

2. **Enable Webhooks** (optional but recommended):
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/payments/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

3. **Test in Production**:
   - Use real card first (small amount like $0.50)
   - Verify payment appears in Stripe Dashboard
   - Check order is created in your database
   - Test refund process

4. **Security Checklist**:
   - ✅ Secret keys never exposed in frontend
   - ✅ API requests go through your backend
   - ✅ Environment variables properly configured
   - ✅ HTTPS enabled on production domain
   - ✅ CORS configured correctly

---

## Step 7: Monitor Payments

### Stripe Dashboard:
- **Payments**: View all transactions
- **Customers**: Manage customer data
- **Balance**: Check available funds
- **Logs**: Debug API requests

### Your Backend Logs:
```bash
# Watch for payment events
tail -f backend/logs/payment.log
```

---

## Troubleshooting

### Common Issues:

#### 1. "No such payment method"
**Solution**: Ensure `paymentMethod` is created correctly in frontend before sending to backend.

#### 2. "Invalid API Key"
**Solution**: 
- Verify key starts with `sk_test_` or `sk_live_`
- Check for extra spaces or newlines in `.env`
- Restart backend after updating `.env`

#### 3. "Publishable key is required"
**Solution**:
- Frontend `.env` must use `VITE_` prefix
- Restart frontend dev server after updating `.env`
- Check browser console for Stripe errors

#### 4. "Card declined"
**Solution**: In test mode, use Stripe test cards (4242 4242 4242 4242)

#### 5. CORS errors
**Solution**: 
- Ensure backend allows frontend origin
- Check `allowedOrigins` in `backend/index.js`

---

## File Locations

- Backend configuration: `backend/.env`
- Frontend configuration: `frontend/.env`
- Payment routes: `backend/routes/payments.js`
- Checkout component: `frontend/src/components/Checkout.jsx`

---

## Support Resources

- Stripe Documentation: https://stripe.com/docs
- Stripe Testing: https://stripe.com/docs/testing
- API Reference: https://stripe.com/docs/api
- Support: https://support.stripe.com

---

## Quick Start Commands

```bash
# Backend
cd backend
echo "STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE" >> .env
echo "STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE" >> .env
npm start

# Frontend
cd frontend
echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE" >> .env
npm run dev
```

---

## Example .env Files

### backend/.env (Complete Example):
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/electrostore

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Email (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5174
```

### frontend/.env (Complete Example):
```env
# API
VITE_API_URL=http://localhost:5000

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Jqxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Next Steps

1. ✅ Add keys to `.env` files
2. ✅ Restart both servers
3. ✅ Test with card 4242 4242 4242 4242
4. ✅ Check Stripe Dashboard for payment
5. ✅ Verify order created in database
6. 📈 When ready for production, switch to live keys

---

**Need help?** Check the Stripe Dashboard → Logs for detailed error messages.
