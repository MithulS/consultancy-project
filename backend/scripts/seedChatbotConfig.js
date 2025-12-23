/**
 * Seed Chatbot Configuration
 * Run this script to initialize the chatbot with default intents, entities, and settings
 */

const mongoose = require('mongoose');
const ChatbotConfig = require('../models/chatbotConfig');
const logger = require('../config/logger');
require('dotenv').config();

const defaultConfiguration = {
  // Intent definitions
  intents: [
    {
      name: 'order_tracking',
      description: 'Track order status and delivery',
      keywords: ['track', 'order', 'delivery', 'shipment', 'package', 'where is'],
      phrases: [
        'where is my order',
        'track my order',
        'order status',
        'delivery status',
        'when will my order arrive'
      ],
      responses: [
        {
          text: "I can help you track your order! Could you please provide your order number? It looks like ORDER123456789.",
          language: 'en',
          variants: [
            "I'd be happy to track your order. Please share your order number.",
            "Let me help you find your order. What's your order number?"
          ]
        },
        {
          text: "¡Puedo ayudarte a rastrear tu pedido! ¿Podrías proporcionarme tu número de pedido?",
          language: 'es'
        }
      ],
      requiredEntities: ['orderId'],
      actions: [
        {
          type: 'api_call',
          endpoint: '/api/orders/{orderId}',
          parameters: { orderId: '{orderId}' }
        }
      ],
      isActive: true,
      priority: 10
    },
    {
      name: 'order_cancellation',
      description: 'Cancel an existing order',
      keywords: ['cancel', 'order', 'stop', 'remove'],
      phrases: [
        'cancel my order',
        'i want to cancel',
        'stop my order',
        'cancel order'
      ],
      responses: [
        {
          text: "I understand you want to cancel your order. Let me help you with that. Could you provide your order number?",
          language: 'en'
        }
      ],
      requiredEntities: ['orderId'],
      actions: [
        {
          type: 'api_call',
          endpoint: '/api/orders/{orderId}/cancel',
          parameters: { orderId: '{orderId}' }
        }
      ],
      isActive: true,
      priority: 9
    },
    {
      name: 'product_inquiry',
      description: 'Ask about product details and availability',
      keywords: ['product', 'item', 'available', 'stock', 'price', 'cost'],
      phrases: [
        'do you have',
        'is this available',
        'how much is',
        'product details',
        'tell me about'
      ],
      responses: [
        {
          text: "I can help you find product information! What product are you interested in?",
          language: 'en',
          variants: [
            "I'd be happy to help with product information. Which item would you like to know about?",
            "Let me help you with that product. Can you tell me which one?"
          ]
        }
      ],
      actions: [
        {
          type: 'database_query',
          endpoint: '/api/products/search',
          parameters: { query: '{productName}' }
        }
      ],
      isActive: true,
      priority: 8
    },
    {
      name: 'returns_refunds',
      description: 'Process returns and refunds',
      keywords: ['return', 'refund', 'exchange', 'money back', 'send back'],
      phrases: [
        'i want to return',
        'how do i return',
        'refund request',
        'exchange item',
        'return policy'
      ],
      responses: [
        {
          text: "I'm sorry the product didn't meet your expectations. I can help you with a return. Our return policy allows returns within 30 days. Do you have your order number?",
          language: 'en'
        }
      ],
      requiredEntities: ['orderId'],
      isActive: true,
      priority: 9
    },
    {
      name: 'shipping_inquiry',
      description: 'Shipping costs and delivery times',
      keywords: ['shipping', 'delivery', 'freight', 'postage', 'shipping cost'],
      phrases: [
        'how much is shipping',
        'shipping cost',
        'delivery time',
        'how long does shipping take',
        'shipping options'
      ],
      responses: [
        {
          text: "We offer multiple shipping options:\n• Standard Shipping (5-7 days): $9.99\n• Express (2-3 days): $19.99\n• Overnight (1 day): $29.99\n\nFree shipping on orders over $50!",
          language: 'en'
        }
      ],
      isActive: true,
      priority: 7
    },
    {
      name: 'payment_help',
      description: 'Payment issues and methods',
      keywords: ['payment', 'pay', 'credit card', 'billing', 'charge', 'card declined'],
      phrases: [
        'payment failed',
        'card declined',
        'payment methods',
        'how to pay',
        'billing issue'
      ],
      responses: [
        {
          text: "I can help with payment issues. We accept:\n• Credit/Debit Cards (Visa, Mastercard, Amex)\n• PayPal\n• Apple Pay\n• Google Pay\n\nWhat seems to be the problem?",
          language: 'en'
        }
      ],
      isActive: true,
      priority: 8
    },
    {
      name: 'account_help',
      description: 'Account management and login issues',
      keywords: ['account', 'login', 'password', 'profile', 'sign in', 'reset'],
      phrases: [
        'forgot password',
        'cant login',
        'reset password',
        'account settings',
        'update profile'
      ],
      responses: [
        {
          text: "I can help with your account. What do you need assistance with?\n• Reset password\n• Update profile\n• Login issues\n• Account security",
          language: 'en'
        }
      ],
      isActive: true,
      priority: 7
    },
    {
      name: 'general_inquiry',
      description: 'General questions about the business',
      keywords: ['hours', 'location', 'contact', 'about', 'company'],
      phrases: [
        'business hours',
        'contact number',
        'email address',
        'where are you located',
        'about your company'
      ],
      responses: [
        {
          text: "We're here to help! 📞 Call us: 1-800-123-4567\n✉️ Email: support@example.com\n🕒 Hours: Mon-Fri 9AM-6PM EST\n\nHow can I assist you today?",
          language: 'en'
        }
      ],
      isActive: true,
      priority: 5
    },
    {
      name: 'greeting',
      description: 'User greetings',
      keywords: ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon'],
      phrases: ['hi', 'hello', 'hey there', 'good morning', 'good afternoon'],
      responses: [
        {
          text: "Hello! 👋 I'm your AI support assistant. How can I help you today?",
          language: 'en',
          variants: [
            "Hi there! Welcome! What can I help you with?",
            "Hey! Great to see you. How can I assist?"
          ]
        },
        {
          text: "¡Hola! 👋 Soy tu asistente de soporte. ¿Cómo puedo ayudarte?",
          language: 'es'
        }
      ],
      isActive: true,
      priority: 6
    },
    {
      name: 'farewell',
      description: 'User goodbyes',
      keywords: ['bye', 'goodbye', 'thanks', 'thank you', 'see you'],
      phrases: ['bye', 'goodbye', 'thanks', 'thank you', 'see you later'],
      responses: [
        {
          text: "Thank you for chatting with me! If you need anything else, I'm here 24/7. Have a great day! 😊",
          language: 'en'
        }
      ],
      isActive: true,
      priority: 6
    }
  ],

  // Entity definitions
  entities: [
    {
      name: 'orderId',
      type: 'pattern',
      pattern: '^[A-Z0-9]{10,15}$',
      validation: {
        required: true,
        minLength: 10,
        maxLength: 15
      }
    },
    {
      name: 'email',
      type: 'pattern',
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      validation: {
        required: false
      }
    },
    {
      name: 'phone',
      type: 'pattern',
      pattern: '^\\+?[\\d\\s\\-()]{10,}$',
      validation: {
        required: false
      }
    },
    {
      name: 'productName',
      type: 'custom',
      validation: {
        minLength: 2,
        maxLength: 100
      }
    }
  ],

  // Language configurations
  languages: [
    {
      code: 'en',
      name: 'English',
      isActive: true,
      translationProvider: 'openai',
      greetings: ['Hello!', 'Hi there!', 'Welcome!'],
      fallbackMessages: ["I'm not sure I understand. Could you rephrase that?"],
      errorMessages: ["I'm having trouble processing that. Please try again."],
      escalationMessages: ["Let me connect you with a specialist who can help."]
    },
    {
      code: 'es',
      name: 'Spanish',
      isActive: true,
      translationProvider: 'openai',
      greetings: ['¡Hola!', '¡Bienvenido!'],
      fallbackMessages: ['No estoy seguro de entender. ¿Podrías reformular eso?'],
      errorMessages: ['Tengo problemas para procesar eso. Por favor, inténtalo de nuevo.'],
      escalationMessages: ['Déjame conectarte con un especialista que pueda ayudar.']
    },
    {
      code: 'fr',
      name: 'French',
      isActive: true,
      translationProvider: 'openai',
      greetings: ['Bonjour!', 'Bienvenue!'],
      fallbackMessages: ["Je ne suis pas sûr de comprendre. Pourriez-vous reformuler?"],
      errorMessages: ["J'ai du mal à traiter cela. Veuillez réessayer."]
    },
    {
      code: 'de',
      name: 'German',
      isActive: true,
      translationProvider: 'openai',
      greetings: ['Hallo!', 'Willkommen!'],
      fallbackMessages: ['Ich bin mir nicht sicher, ob ich das verstehe. Könnten Sie das umformulieren?']
    },
    {
      code: 'zh',
      name: 'Chinese',
      isActive: true,
      translationProvider: 'openai',
      greetings: ['你好！', '欢迎！']
    },
    {
      code: 'ja',
      name: 'Japanese',
      isActive: true,
      translationProvider: 'openai',
      greetings: ['こんにちは！', 'ようこそ！']
    }
  ],

  // NLP provider configuration
  nlpProvider: {
    primary: 'openai',
    fallback: 'rule-based',
    modelConfig: {
      modelName: 'gpt-4-turbo',
      temperature: 0.7,
      maxTokens: 500,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    }
  },

  // System prompts
  systemPrompts: {
    mainPrompt: `You are a helpful e-commerce customer support assistant for an online store. 
Your role is to:
- Help customers track orders, process returns, and answer product questions
- Be friendly, professional, and concise
- Resolve issues efficiently without unnecessary escalation
- Escalate to human agents when needed (complex issues, negative sentiment, explicit requests)
- Always maintain a positive, helpful tone

Guidelines:
- Keep responses under 3 sentences when possible
- Use emojis sparingly (1-2 per response) for warmth
- Ask clarifying questions when information is missing
- Provide specific next steps or actions
- If you don't know something, admit it and offer to escalate`,
    greetingPrompt: 'Greet the user warmly and ask how you can help.',
    escalationPrompt: 'Apologize for not resolving the issue and explain you are connecting them to a specialist.',
    closingPrompt: 'Thank the user and invite them to return if they need more help.'
  },

  // Escalation rules
  escalationRules: {
    sentimentThreshold: -0.6,
    confidenceThreshold: 0.7,
    maxRepetitions: 3,
    maxConversationDuration: 600,
    escalationKeywords: [
      'speak to human', 'talk to agent', 'manager', 'supervisor',
      'lawyer', 'legal', 'lawsuit', 'fraud', 'scam', 'terrible',
      'worst', 'hate', 'angry', 'furious'
    ],
    vipAutoEscalate: false,
    businessHoursOnly: false
  },

  // Business hours (24/7 for chatbot, but useful for agent escalation)
  businessHours: [
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', timezone: 'America/New_York' },
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', timezone: 'America/New_York' },
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', timezone: 'America/New_York' },
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', timezone: 'America/New_York' },
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', timezone: 'America/New_York' }
  ],

  // Conversation settings
  conversationSettings: {
    maxIdleTime: 300,
    enableTypingIndicator: true,
    typingDelay: 1000,
    enableQuickReplies: true,
    maxMessageLength: 1000,
    enableEmoji: true,
    enableFileUpload: true,
    allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxFileSize: 5242880
  },

  // Integration settings
  integrations: {
    orderSystem: { enabled: true },
    inventorySystem: { enabled: true },
    crmSystem: { enabled: true },
    paymentSystem: { enabled: true },
    knowledgeBase: { enabled: true, vectorDb: 'none' }
  },

  // UI customization
  uiSettings: {
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      botMessageColor: '#F3F4F6',
      userMessageColor: '#3B82F6'
    },
    branding: {
      botName: 'AI Support Assistant',
      botAvatarUrl: '',
      companyLogoUrl: '',
      welcomeMessage: 'Hi! How can I help you today?',
      poweredByText: 'Powered by AI'
    },
    position: 'bottom-right',
    widgetSize: { width: 400, height: 600 }
  },

  // Analytics settings
  analyticsSettings: {
    enabled: true,
    trackUserJourney: true,
    enableSentimentAnalysis: true,
    enableConversionTracking: true,
    reportingInterval: 'daily'
  },

  // Cache settings
  cacheSettings: {
    enabled: true,
    responseCacheTTL: 300,
    userContextTTL: 1800,
    intentCacheTTL: 3600
  },

  // Rate limiting
  rateLimiting: {
    enabled: true,
    maxMessagesPerMinute: 20,
    maxMessagesPerHour: 100,
    blockDuration: 300
  },

  // Feature flags
  features: {
    multilingualSupport: true,
    voiceInput: false,
    videoSupport: false,
    screenSharing: false,
    cobrowsing: false,
    feedbackCollection: true,
    conversationRating: true
  },

  // Compliance settings
  compliance: {
    gdprEnabled: true,
    ccpaEnabled: false,
    dataRetentionDays: 90,
    enablePIIRedaction: true,
    consentRequired: true,
    consentText: 'By using this chat, you agree to our Privacy Policy and Terms of Service.',
    privacyPolicyUrl: '/privacy',
    termsOfServiceUrl: '/terms'
  },

  // Metadata
  version: '1.0.0',
  isActive: true,
  environment: 'production'
};

async function seedChatbotConfig() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');

    // Check if config already exists
    const existingConfig = await ChatbotConfig.findOne({ environment: 'production', isActive: true });

    if (existingConfig) {
      logger.info('Chatbot configuration already exists. Skipping seed.');
      return;
    }

    // Create new configuration
    const config = new ChatbotConfig(defaultConfiguration);
    await config.save();

    logger.info('✅ Chatbot configuration seeded successfully!');
    logger.info(`Configuration ID: ${config._id}`);
    logger.info(`Intents configured: ${config.intents.length}`);
    logger.info(`Languages supported: ${config.languages.length}`);

  } catch (error) {
    logger.error('Error seeding chatbot configuration:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  seedChatbotConfig();
}

module.exports = seedChatbotConfig;
