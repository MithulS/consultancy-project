# AI Chatbot Implementation Guide

## Quick Start

This guide will help you deploy the 24/7 AI chatbot support system to your e-commerce platform.

---

## Prerequisites

- Node.js 18+ and npm installed
- MongoDB database running
- Redis (optional, for caching)
- OpenAI API key (or Anthropic Claude API key)
- Existing e-commerce backend running

---

## Installation Steps

### 1. Install Dependencies

```bash
# Backend dependencies are already installed
# No new packages needed - using existing Express, Mongoose, etc.

# Frontend - add ChatWidget to your application
# Already created in src/components/ChatWidget.jsx
```

### 2. Environment Configuration

Add these variables to your `.env` file:

```bash
# AI/NLP Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo
ANTHROPIC_API_KEY=your_anthropic_key_here  # Optional fallback

# Chatbot Settings
CHATBOT_ENABLED=true
CHATBOT_DEFAULT_LANGUAGE=en
CHATBOT_MAX_MESSAGE_LENGTH=1000

# Optional: Translation API (if not using OpenAI for translation)
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key
```

### 3. Database Setup

#### Initialize Chatbot Configuration

Run the seed script to populate default intents, entities, and settings:

```bash
cd backend
node scripts/seedChatbotConfig.js
```

This will create:
- 10 pre-configured intents (order tracking, returns, product inquiry, etc.)
- Entity extraction patterns (order IDs, emails, phones)
- 6 language configurations (EN, ES, FR, DE, ZH, JA)
- Escalation rules and business logic

### 4. Backend Integration

The chatbot routes are already integrated in `backend/index.js`:

```javascript
app.use('/api/chatbot', require('./routes/chatbot'));
```

**Available Endpoints:**

- `POST /api/chatbot/message` - Send message to bot
- `POST /api/chatbot/action` - Execute specific action (track order, etc.)
- `POST /api/chatbot/escalate` - Escalate to human agent
- `POST /api/chatbot/feedback` - Submit conversation rating
- `GET /api/chatbot/conversation/:sessionId` - Get conversation history
- `POST /api/chatbot/end` - End conversation

**Admin Endpoints:**

- `GET /api/chatbot/admin/config` - Get bot configuration
- `PUT /api/chatbot/admin/config` - Update bot configuration
- `GET /api/chatbot/admin/analytics` - Get chatbot analytics
- `GET /api/chatbot/admin/conversations` - List all conversations
- `GET /api/chatbot/admin/escalated` - Get escalated conversations

### 5. Frontend Integration

#### Option A: Add to Existing App.jsx

```jsx
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <div>
      {/* Your existing app content */}
      
      {/* Add chatbot widget - it will float in bottom-right corner */}
      <ChatWidget />
    </div>
  );
}

export default App;
```

#### Option B: Conditional Loading (Only on certain pages)

```jsx
import { useLocation } from 'react-router-dom';
import ChatWidget from './components/ChatWidget';

function App() {
  const location = useLocation();
  const showChatbot = ['/shop', '/products', '/checkout', '/orders'].includes(location.pathname);

  return (
    <div>
      {/* Your existing app content */}
      
      {showChatbot && <ChatWidget />}
    </div>
  );
}
```

### 6. Start the Services

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The chatbot widget should now appear in the bottom-right corner!

---

## Configuration

### Customizing the Chatbot

#### 1. Update Branding & Colors

Edit the configuration via API or directly in MongoDB:

```javascript
// Via API (requires admin token)
PUT /api/chatbot/admin/config

{
  "uiSettings": {
    "theme": {
      "primaryColor": "#YOUR_BRAND_COLOR",
      "secondaryColor": "#YOUR_ACCENT_COLOR"
    },
    "branding": {
      "botName": "Your Bot Name",
      "welcomeMessage": "Welcome to [Your Brand]! How can I help?"
    }
  }
}
```

#### 2. Add Custom Intents

```javascript
{
  "intents": [
    {
      "name": "your_custom_intent",
      "description": "Description of what this handles",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "phrases": ["exact phrase match", "another phrase"],
      "responses": [
        {
          "text": "Your response here with {entity} placeholders",
          "language": "en"
        }
      ],
      "actions": [
        {
          "type": "api_call",
          "endpoint": "/api/your-endpoint",
          "parameters": { "param": "{entity}" }
        }
      ],
      "isActive": true,
      "priority": 8
    }
  ]
}
```

#### 3. Configure Escalation Rules

```javascript
{
  "escalationRules": {
    "sentimentThreshold": -0.6,        // Escalate if sentiment < -0.6
    "confidenceThreshold": 0.7,       // Escalate if confidence < 0.7
    "maxRepetitions": 3,              // Escalate after 3 same intents
    "maxConversationDuration": 600,   // Escalate after 10 minutes
    "escalationKeywords": [
      "speak to human", "manager", "supervisor", "angry"
    ],
    "vipAutoEscalate": true           // Auto-escalate VIP customers
  }
}
```

### Multilingual Support

#### Enable/Disable Languages

```javascript
PUT /api/chatbot/admin/config

{
  "languages": [
    {
      "code": "en",
      "name": "English",
      "isActive": true,
      "translationProvider": "openai"  // or "google", "deepl", "none"
    },
    {
      "code": "es",
      "name": "Spanish",
      "isActive": true,
      "translationProvider": "openai"
    }
    // Add more languages as needed
  ]
}
```

#### Add Translations for Intents

For each intent, add response variants in different languages:

```javascript
{
  "responses": [
    {
      "text": "Hello! How can I help you today?",
      "language": "en"
    },
    {
      "text": "¡Hola! ¿Cómo puedo ayudarte hoy?",
      "language": "es"
    },
    {
      "text": "Bonjour! Comment puis-je vous aider aujourd'hui?",
      "language": "fr"
    }
  ]
}
```

---

## Integration with External NLP Providers

### Option 1: OpenAI GPT-4 (Recommended)

**Advantages:**
- Best understanding and contextual responses
- Handles 50+ languages natively
- Minimal configuration needed

**Cost:** ~$0.01 per 1K input tokens, $0.03 per 1K output tokens

**Setup:**

1. Get API key from https://platform.openai.com
2. Add to `.env`: `OPENAI_API_KEY=sk-...`
3. Configure in chatbot settings:

```javascript
{
  "nlpProvider": {
    "primary": "openai",
    "modelConfig": {
      "modelName": "gpt-4-turbo",
      "temperature": 0.7,
      "maxTokens": 500
    }
  }
}
```

### Option 2: Anthropic Claude 3.5

**Advantages:**
- Superior reasoning capabilities
- 200K context window
- Lower cost ($0.003/1K tokens)

**Setup:**

1. Get API key from https://console.anthropic.com
2. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`
3. Update provider:

```javascript
{
  "nlpProvider": {
    "primary": "anthropic",
    "modelConfig": {
      "modelName": "claude-3-5-sonnet-20241022",
      "temperature": 0.7,
      "maxTokens": 500
    }
  }
}
```

### Option 3: Self-Hosted Open Source (Llama 3.1)

**Advantages:**
- Zero API costs after setup
- Complete data privacy
- No rate limits

**Setup:**

Requires GPU server (AWS g5.2xlarge or similar):

```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull Llama 3.1 model
ollama pull llama3.1:70b

# Start server
ollama serve
```

Update configuration:

```javascript
{
  "nlpProvider": {
    "primary": "custom",
    "modelConfig": {
      "endpoint": "http://localhost:11434/api/generate",
      "modelName": "llama3.1:70b"
    }
  }
}
```

---

## Advanced Features

### 1. Enable Voice Input (Future Enhancement)

```javascript
{
  "features": {
    "voiceInput": true
  }
}
```

Requires adding Web Speech API support in frontend.

### 2. Add File Upload for Returns/Complaints

```javascript
{
  "conversationSettings": {
    "enableFileUpload": true,
    "allowedFileTypes": [".jpg", ".png", ".pdf"],
    "maxFileSize": 5242880  // 5MB
  }
}
```

### 3. Implement Proactive Chat

Trigger chat based on user behavior:

```jsx
useEffect(() => {
  const timer = setTimeout(() => {
    // User on checkout page for 30 seconds
    if (location.pathname === '/checkout') {
      // Show proactive message
      setChatMessage("Need help completing your order?");
      setIsOpen(true);
    }
  }, 30000);
  
  return () => clearTimeout(timer);
}, [location]);
```

---

## Testing

### 1. Test Common Scenarios

```bash
# Test order tracking
User: "Where is my order?"
Bot: "I can help you track your order! Could you please provide your order number?"
User: "ORDER123456789"
Bot: [Fetches order details and displays status]

# Test product inquiry
User: "Do you have Nike Air Max in size 10?"
Bot: [Searches inventory and shows availability]

# Test escalation
User: "I want to speak to a human"
Bot: "Of course! I'm connecting you with a live agent now."
[Conversation escalated]
```

### 2. Test Languages

Change language in widget dropdown and verify:
- UI updates to selected language
- Bot responds in correct language
- Quick replies are translated

### 3. Test Sentiment Detection

```bash
# Negative sentiment should trigger escalation
User: "This is terrible! I hate your service!"
Bot: [Detects negative sentiment, auto-escalates]
"I sense you're frustrated. Let me connect you with a specialist..."
```

### 4. Load Testing

```bash
# Install artillery
npm install -g artillery

# Create test script (artillery-chatbot.yml)
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "Chatbot conversation"
    flow:
      - post:
          url: "/api/chatbot/message"
          json:
            message: "Hello"
            sessionId: "test_{{ $uuid }}"
            language: "en"

# Run test
artillery run artillery-chatbot.yml
```

---

## Monitoring & Analytics

### 1. Access Analytics Dashboard

```bash
GET /api/chatbot/admin/analytics?startDate=2025-01-01&endDate=2025-01-31
```

**Key Metrics:**
- Total conversations
- Resolution rate (% resolved without human)
- Average satisfaction score
- Escalation rate
- Average response time
- Language breakdown
- Intent breakdown

### 2. Set Up Alerts

Monitor critical metrics:

```javascript
// In your monitoring service (e.g., DataDog, New Relic)
if (escalationRate > 25%) {
  alert("High escalation rate - check bot performance");
}

if (satisfactionScore < 3.5) {
  alert("Low satisfaction - review recent conversations");
}

if (errorRate > 5%) {
  alert("High error rate - check API integrations");
}
```

### 3. Review Escalated Conversations

```bash
GET /api/chatbot/admin/escalated
```

Analyze why conversations are being escalated:
- Are intents missing?
- Is sentiment detection too sensitive?
- Are entities not being extracted properly?

Use insights to improve configuration.

---

## Optimization

### 1. Cache Common Responses

Enable response caching for frequently asked questions:

```javascript
{
  "cacheSettings": {
    "enabled": true,
    "responseCacheTTL": 300,      // 5 minutes
    "userContextTTL": 1800,       // 30 minutes
    "intentCacheTTL": 3600        // 1 hour
  }
}
```

### 2. Implement Rate Limiting

Protect against abuse:

```javascript
{
  "rateLimiting": {
    "enabled": true,
    "maxMessagesPerMinute": 20,
    "maxMessagesPerHour": 100,
    "blockDuration": 300          // 5 minutes
  }
}
```

### 3. Use Redis for Session Management

```javascript
// In backend/config/redis.js (already exists)
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

// Cache conversation context
await redisClient.setEx(
  `chat:session:${sessionId}`,
  1800,  // 30 min TTL
  JSON.stringify(context)
);
```

---

## Security Best Practices

### 1. PII Redaction

Automatically redact sensitive information:

```javascript
// Already implemented in conversation model
conversation.anonymize();  // Removes emails, phones, names
```

### 2. Rate Limiting

```javascript
// Already configured in rateLimiter.js
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // 100 requests per window
});

app.use('/api/chatbot', limiter);
```

### 3. Input Validation

```javascript
// Already implemented in routes/chatbot.js
body('message').notEmpty().trim().isLength({ max: 1000 })
```

### 4. GDPR Compliance

- Conversations auto-delete after 90 days (TTL index)
- Users can request data export
- PII redaction enabled by default
- Consent collected before chat starts

---

## Troubleshooting

### Issue: Bot not responding

**Check:**
1. Backend server running? `http://localhost:5000/health`
2. Chatbot routes loaded? Check console logs
3. Configuration seeded? Run `node scripts/seedChatbotConfig.js`
4. API key configured? Check `.env` file

### Issue: Poor intent classification

**Fix:**
1. Add more keywords/phrases to intent
2. Increase priority for important intents
3. Review analytics to see which intents are being missed
4. Consider using GPT-4 instead of rule-based matching

### Issue: High escalation rate

**Fix:**
1. Lower `sentimentThreshold` (less sensitive)
2. Add more intent variations
3. Improve entity extraction patterns
4. Review escalation keywords - remove overly broad terms

### Issue: Translations not working

**Check:**
1. OpenAI API key configured
2. Translation provider set: `translationProvider: "openai"`
3. Language is active in configuration
4. Try changing language in widget - check browser console for errors

---

## Production Deployment

### 1. Environment Variables

```bash
# Production .env
NODE_ENV=production
OPENAI_API_KEY=sk-prod-...
MONGODB_URI=mongodb+srv://prod-cluster...
REDIS_URL=redis://prod-redis...

# Security
CHATBOT_MAX_MESSAGE_LENGTH=1000
RATE_LIMIT_ENABLED=true
PII_REDACTION_ENABLED=true

# Performance
RESPONSE_CACHE_TTL=300
ENABLE_COMPRESSION=true
```

### 2. Scaling

#### Horizontal Scaling (Multiple Instances)

```javascript
// Use Redis for shared session state
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

#### Load Balancing

```nginx
# nginx.conf
upstream chatbot_backend {
  server 10.0.1.10:5000;
  server 10.0.1.11:5000;
  server 10.0.1.12:5000;
}

server {
  listen 80;
  
  location /api/chatbot {
    proxy_pass http://chatbot_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

### 3. Monitoring Setup

```javascript
// Add Prometheus metrics
const prometheus = require('prom-client');

const chatbotMetrics = {
  messagesTotal: new prometheus.Counter({
    name: 'chatbot_messages_total',
    help: 'Total messages processed'
  }),
  escalationsTotal: new prometheus.Counter({
    name: 'chatbot_escalations_total',
    help: 'Total escalations to human agents'
  }),
  responseTime: new prometheus.Histogram({
    name: 'chatbot_response_time_seconds',
    help: 'Response time in seconds'
  })
};
```

---

## Cost Estimation

### Monthly Costs (Production)

**Infrastructure:**
- AWS EC2 (t3.medium × 3): $150
- MongoDB Atlas (Dedicated): $200
- Redis (ElastiCache): $80
- **Total Infrastructure: $430/month**

**AI/ML (100K conversations/month, 10 msgs/conversation):**
- OpenAI GPT-4 Turbo: $5,500/month
- Anthropic Claude 3.5: $2,550/month (54% savings)
- Self-hosted Llama 3.1: $1,200/month + GPU instance

**Total Operating Cost:**
- With OpenAI: ~$5,930/month
- With Claude: ~$2,980/month
- With Llama: ~$1,630/month

**Cost Savings vs. Human Agents:**
- 10 agents @ $3,500/month = $35,000
- Monthly savings: $29,000 - $32,000 (83-89% reduction)
- Annual savings: $348,000 - $384,000

**Break-even:** Less than 1 week!

---

## Support & Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Review escalated conversations
- Check system health dashboard

**Weekly:**
- Analyze conversation analytics
- Update knowledge base with new FAQs
- Review and approve response improvements

**Monthly:**
- Retrain intent classification (if using custom models)
- Update conversation flows based on feedback
- Security patches and dependency updates
- Cost analysis and optimization

---

## Next Steps

1. ✅ Complete this implementation guide
2. 🚀 Deploy to staging environment
3. 🧪 Run comprehensive testing (all scenarios)
4. 👥 Pilot with 10% of traffic
5. 📊 Collect feedback and analytics for 1 week
6. 🔧 Optimize based on results
7. 🌐 Full production rollout
8. 📈 Monitor and continuously improve

---

## Getting Help

**Documentation:**
- [AI_CHATBOT_ARCHITECTURE.md](./AI_CHATBOT_ARCHITECTURE.md) - Full technical architecture
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API endpoints reference

**Support Channels:**
- GitHub Issues: For bugs and feature requests
- Email: dev-team@example.com
- Slack: #chatbot-support

---

## Success Metrics (Track These!)

- **Resolution Rate:** Target 75% automated resolution
- **Average Response Time:** Target < 2 seconds
- **Customer Satisfaction:** Target > 4.2/5
- **Escalation Rate:** Target < 25%
- **Cost per Conversation:** Target < $0.10
- **Uptime:** Target 99.9%

Monitor these weekly and adjust configuration as needed!

---

**Congratulations! Your 24/7 AI chatbot support system is now ready to serve your customers!** 🎉
