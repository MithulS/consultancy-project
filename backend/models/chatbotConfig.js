const mongoose = require('mongoose');

const chatbotConfigSchema = new mongoose.Schema({
  // Intent definitions
  intents: [{
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: String,
    keywords: [String],
    phrases: [String],
    responses: [{
      text: String,
      language: {
        type: String,
        default: 'en'
      },
      variants: [String] // Multiple response variations
    }],
    requiredEntities: [String],
    actions: [{
      type: {
        type: String,
        enum: ['api_call', 'database_query', 'escalate', 'transfer', 'collect_info']
      },
      endpoint: String,
      parameters: mongoose.Schema.Types.Mixed
    }],
    followUpQuestions: [String],
    isActive: {
      type: Boolean,
      default: true
    },
    priority: {
      type: Number,
      default: 0
    }
  }],
  
  // Entity definitions
  entities: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['pattern', 'list', 'numeric', 'date', 'email', 'phone', 'custom']
    },
    pattern: String, // Regex pattern
    values: [String], // For list type
    validation: {
      required: Boolean,
      minLength: Number,
      maxLength: Number,
      customValidator: String
    }
  }],
  
  // Language configurations
  languages: [{
    code: {
      type: String,
      required: true
    },
    name: String,
    isActive: {
      type: Boolean,
      default: true
    },
    translationProvider: {
      type: String,
      enum: ['openai', 'google', 'deepl', 'none'],
      default: 'openai'
    },
    greetings: [String],
    fallbackMessages: [String],
    errorMessages: [String],
    escalationMessages: [String]
  }],
  
  // NLP provider configuration
  nlpProvider: {
    primary: {
      type: String,
      enum: ['openai', 'anthropic', 'huggingface', 'custom'],
      default: 'openai'
    },
    fallback: {
      type: String,
      enum: ['openai', 'anthropic', 'huggingface', 'rule-based', 'none'],
      default: 'rule-based'
    },
    modelConfig: {
      modelName: String,
      temperature: {
        type: Number,
        default: 0.7,
        min: 0,
        max: 2
      },
      maxTokens: {
        type: Number,
        default: 500
      },
      topP: {
        type: Number,
        default: 1
      },
      frequencyPenalty: {
        type: Number,
        default: 0
      },
      presencePenalty: {
        type: Number,
        default: 0
      }
    }
  },
  
  // System prompts
  systemPrompts: {
    mainPrompt: {
      type: String,
      default: `You are a helpful e-commerce customer support assistant. Be friendly, professional, and concise. 
Always try to resolve customer issues efficiently. If you cannot help, escalate to a human agent.`
    },
    greetingPrompt: String,
    escalationPrompt: String,
    closingPrompt: String,
    contextInstructions: String
  },
  
  // Escalation rules
  escalationRules: {
    sentimentThreshold: {
      type: Number,
      default: -0.6,
      min: -1,
      max: 0
    },
    confidenceThreshold: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 1
    },
    maxRepetitions: {
      type: Number,
      default: 3
    },
    maxConversationDuration: {
      type: Number,
      default: 600 // 10 minutes
    },
    escalationKeywords: [String],
    vipAutoEscalate: {
      type: Boolean,
      default: false
    },
    businessHoursOnly: {
      type: Boolean,
      default: false
    }
  },
  
  // Business hours
  businessHours: [{
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6 // 0 = Sunday, 6 = Saturday
    },
    startTime: String, // HH:MM format
    endTime: String,
    timezone: {
      type: String,
      default: 'America/New_York'
    }
  }],
  
  // Conversation settings
  conversationSettings: {
    maxIdleTime: {
      type: Number,
      default: 300 // 5 minutes
    },
    enableTypingIndicator: {
      type: Boolean,
      default: true
    },
    typingDelay: {
      type: Number,
      default: 1000 // milliseconds
    },
    enableQuickReplies: {
      type: Boolean,
      default: true
    },
    maxMessageLength: {
      type: Number,
      default: 1000
    },
    enableEmoji: {
      type: Boolean,
      default: true
    },
    enableFileUpload: {
      type: Boolean,
      default: true
    },
    allowedFileTypes: [String],
    maxFileSize: {
      type: Number,
      default: 5242880 // 5MB
    }
  },
  
  // Integration settings
  integrations: {
    orderSystem: {
      enabled: {
        type: Boolean,
        default: true
      },
      endpoint: String,
      apiKey: String
    },
    inventorySystem: {
      enabled: {
        type: Boolean,
        default: true
      },
      endpoint: String,
      apiKey: String
    },
    crmSystem: {
      enabled: {
        type: Boolean,
        default: true
      },
      endpoint: String,
      apiKey: String
    },
    paymentSystem: {
      enabled: {
        type: Boolean,
        default: true
      },
      endpoint: String,
      apiKey: String
    },
    knowledgeBase: {
      enabled: {
        type: Boolean,
        default: true
      },
      endpoint: String,
      apiKey: String,
      vectorDb: {
        type: String,
        enum: ['pinecone', 'chroma', 'weaviate', 'none'],
        default: 'none'
      }
    }
  },
  
  // UI customization
  uiSettings: {
    theme: {
      primaryColor: {
        type: String,
        default: '#3B82F6'
      },
      secondaryColor: {
        type: String,
        default: '#10B981'
      },
      backgroundColor: {
        type: String,
        default: '#FFFFFF'
      },
      textColor: {
        type: String,
        default: '#1F2937'
      },
      botMessageColor: {
        type: String,
        default: '#F3F4F6'
      },
      userMessageColor: {
        type: String,
        default: '#3B82F6'
      }
    },
    branding: {
      botName: {
        type: String,
        default: 'Support Assistant'
      },
      botAvatarUrl: String,
      companyLogoUrl: String,
      welcomeMessage: {
        type: String,
        default: 'Hi! How can I help you today?'
      },
      poweredByText: String
    },
    position: {
      type: String,
      enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
      default: 'bottom-right'
    },
    widgetSize: {
      width: {
        type: Number,
        default: 400
      },
      height: {
        type: Number,
        default: 600
      }
    }
  },
  
  // Analytics and monitoring
  analyticsSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    trackUserJourney: {
      type: Boolean,
      default: true
    },
    enableSentimentAnalysis: {
      type: Boolean,
      default: true
    },
    enableConversionTracking: {
      type: Boolean,
      default: true
    },
    reportingInterval: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly'],
      default: 'daily'
    }
  },
  
  // Caching configuration
  cacheSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    responseCacheTTL: {
      type: Number,
      default: 300 // 5 minutes
    },
    userContextTTL: {
      type: Number,
      default: 1800 // 30 minutes
    },
    intentCacheTTL: {
      type: Number,
      default: 3600 // 1 hour
    }
  },
  
  // Rate limiting
  rateLimiting: {
    enabled: {
      type: Boolean,
      default: true
    },
    maxMessagesPerMinute: {
      type: Number,
      default: 20
    },
    maxMessagesPerHour: {
      type: Number,
      default: 100
    },
    blockDuration: {
      type: Number,
      default: 300 // 5 minutes
    }
  },
  
  // Feature flags
  features: {
    multilingualSupport: {
      type: Boolean,
      default: true
    },
    voiceInput: {
      type: Boolean,
      default: false
    },
    videoSupport: {
      type: Boolean,
      default: false
    },
    screenSharing: {
      type: Boolean,
      default: false
    },
    cobrowsing: {
      type: Boolean,
      default: false
    },
    feedbackCollection: {
      type: Boolean,
      default: true
    },
    conversationRating: {
      type: Boolean,
      default: true
    }
  },
  
  // Compliance settings
  compliance: {
    gdprEnabled: {
      type: Boolean,
      default: true
    },
    ccpaEnabled: {
      type: Boolean,
      default: false
    },
    dataRetentionDays: {
      type: Number,
      default: 90
    },
    enablePIIRedaction: {
      type: Boolean,
      default: true
    },
    consentRequired: {
      type: Boolean,
      default: true
    },
    consentText: String,
    privacyPolicyUrl: String,
    termsOfServiceUrl: String
  },
  
  // Metadata
  version: {
    type: String,
    default: '1.0.0'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  environment: {
    type: String,
    enum: ['development', 'staging', 'production'],
    default: 'production'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, {
  timestamps: true,
  collection: 'chatbot_configs'
});

// Ensure only one active config per environment
chatbotConfigSchema.index({ environment: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

// Statics
chatbotConfigSchema.statics.getActiveConfig = function(environment = 'production') {
  return this.findOne({ environment, isActive: true });
};

chatbotConfigSchema.statics.getIntent = async function(intentName) {
  const config = await this.getActiveConfig();
  if (!config) return null;
  
  return config.intents.find(intent => intent.name === intentName && intent.isActive);
};

chatbotConfigSchema.statics.getLanguageConfig = async function(languageCode) {
  const config = await this.getActiveConfig();
  if (!config) return null;
  
  return config.languages.find(lang => lang.code === languageCode && lang.isActive);
};

module.exports = mongoose.model('ChatbotConfig', chatbotConfigSchema);
