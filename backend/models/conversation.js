const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  // User identification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous users
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Conversation metadata
  status: {
    type: String,
    enum: ['active', 'resolved', 'escalated', 'abandoned'],
    default: 'active',
    index: true
  },
  channel: {
    type: String,
    enum: ['web', 'mobile', 'api'],
    default: 'web'
  },
  language: {
    type: String,
    default: 'en',
    index: true
  },
  
  // Messages array
  messages: [{
    messageId: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      enum: ['user', 'bot', 'agent'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    intent: {
      type: String,
      default: null
    },
    entities: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null
    },
    sentiment: {
      score: { type: Number, min: -1, max: 1 },
      label: { type: String, enum: ['positive', 'neutral', 'negative'] }
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  
  // Context tracking
  context: {
    currentIntent: String,
    lastIntent: String,
    entities: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    orderId: String,
    productId: String,
    variables: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  
  // Escalation information
  escalation: {
    isEscalated: {
      type: Boolean,
      default: false
    },
    reason: {
      type: String,
      enum: [
        'complex_query',
        'negative_sentiment',
        'user_request',
        'technical_issue',
        'vip_customer',
        'policy_exception',
        'timeout'
      ]
    },
    escalatedAt: Date,
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    agentName: String,
    notes: String
  },
  
  // Analytics
  analytics: {
    totalMessages: {
      type: Number,
      default: 0
    },
    botMessages: {
      type: Number,
      default: 0
    },
    userMessages: {
      type: Number,
      default: 0
    },
    averageSentiment: {
      type: Number,
      min: -1,
      max: 1
    },
    duration: Number, // in seconds
    resolved: {
      type: Boolean,
      default: false
    },
    resolutionTime: Number, // in seconds
    satisfactionScore: {
      type: Number,
      min: 1,
      max: 5
    },
    feedbackComment: String,
    tags: [String]
  },
  
  // System information
  startedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  endedAt: Date,
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  
  // User information (cached for analytics)
  userInfo: {
    email: String,
    name: String,
    isAuthenticated: Boolean,
    customerSegment: {
      type: String,
      enum: ['new', 'regular', 'vip', 'at-risk']
    },
    orderCount: Number,
    lifetimeValue: Number
  },
  
  // Technical metadata
  ipAddress: String,
  userAgent: String,
  referrer: String,
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet']
  },
  
  // Flags
  isDeleted: {
    type: Boolean,
    default: false
  },
  isAnonymized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'conversations'
});

// Indexes for performance
conversationSchema.index({ userId: 1, startedAt: -1 });
conversationSchema.index({ sessionId: 1, startedAt: -1 });
conversationSchema.index({ status: 1, startedAt: -1 });
conversationSchema.index({ 'escalation.isEscalated': 1, 'escalation.agentId': 1 });
conversationSchema.index({ language: 1, startedAt: -1 });
conversationSchema.index({ startedAt: -1 });

// TTL index for automatic deletion after 90 days (GDPR compliance)
conversationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Virtual for conversation duration
conversationSchema.virtual('durationMinutes').get(function() {
  if (this.endedAt && this.startedAt) {
    return Math.round((this.endedAt - this.startedAt) / 60000);
  }
  return null;
});

// Methods
conversationSchema.methods.addMessage = function(sender, content, metadata = {}) {
  const message = {
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sender,
    content,
    timestamp: new Date(),
    ...metadata
  };
  
  this.messages.push(message);
  this.analytics.totalMessages++;
  
  if (sender === 'bot') {
    this.analytics.botMessages++;
  } else if (sender === 'user') {
    this.analytics.userMessages++;
  }
  
  this.lastActivityAt = new Date();
  
  return message;
};

conversationSchema.methods.escalate = function(reason, agentInfo = {}) {
  this.escalation.isEscalated = true;
  this.escalation.reason = reason;
  this.escalation.escalatedAt = new Date();
  
  if (agentInfo.agentId) {
    this.escalation.agentId = agentInfo.agentId;
  }
  if (agentInfo.agentName) {
    this.escalation.agentName = agentInfo.agentName;
  }
  
  this.status = 'escalated';
};

conversationSchema.methods.resolve = function(satisfactionScore = null, feedbackComment = null) {
  this.status = 'resolved';
  this.endedAt = new Date();
  this.analytics.resolved = true;
  this.analytics.duration = Math.round((this.endedAt - this.startedAt) / 1000);
  
  if (satisfactionScore) {
    this.analytics.satisfactionScore = satisfactionScore;
  }
  if (feedbackComment) {
    this.analytics.feedbackComment = feedbackComment;
  }
};

conversationSchema.methods.calculateAverageSentiment = function() {
  const sentiments = this.messages
    .filter(m => m.sentiment && m.sentiment.score !== undefined)
    .map(m => m.sentiment.score);
  
  if (sentiments.length > 0) {
    this.analytics.averageSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
  }
  
  return this.analytics.averageSentiment;
};

conversationSchema.methods.anonymize = function() {
  // Remove PII for GDPR compliance
  this.userInfo.email = null;
  this.userInfo.name = 'Anonymous';
  this.ipAddress = null;
  this.userAgent = null;
  this.isAnonymized = true;
  
  // Redact PII from messages
  this.messages.forEach(message => {
    // Basic email/phone redaction
    message.content = message.content
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]');
  });
};

// Statics
conversationSchema.statics.getActiveConversations = function(limit = 100) {
  return this.find({ status: 'active' })
    .sort({ lastActivityAt: -1 })
    .limit(limit);
};

conversationSchema.statics.getEscalatedConversations = function(agentId = null) {
  const query = { 'escalation.isEscalated': true, status: 'escalated' };
  
  if (agentId) {
    query['escalation.agentId'] = agentId;
  }
  
  return this.find(query).sort({ 'escalation.escalatedAt': -1 });
};

conversationSchema.statics.getAnalytics = async function(startDate, endDate) {
  const conversations = await this.find({
    startedAt: { $gte: startDate, $lte: endDate }
  });
  
  const analytics = {
    totalConversations: conversations.length,
    resolvedConversations: conversations.filter(c => c.analytics.resolved).length,
    escalatedConversations: conversations.filter(c => c.escalation.isEscalated).length,
    averageDuration: 0,
    averageSatisfaction: 0,
    totalMessages: 0,
    languageBreakdown: {},
    intentBreakdown: {},
    resolutionRate: 0,
    escalationRate: 0
  };
  
  let totalDuration = 0;
  let totalSatisfaction = 0;
  let satisfactionCount = 0;
  
  conversations.forEach(conv => {
    analytics.totalMessages += conv.analytics.totalMessages;
    
    if (conv.analytics.duration) {
      totalDuration += conv.analytics.duration;
    }
    
    if (conv.analytics.satisfactionScore) {
      totalSatisfaction += conv.analytics.satisfactionScore;
      satisfactionCount++;
    }
    
    // Language breakdown
    analytics.languageBreakdown[conv.language] = 
      (analytics.languageBreakdown[conv.language] || 0) + 1;
    
    // Intent breakdown
    if (conv.context.currentIntent) {
      analytics.intentBreakdown[conv.context.currentIntent] = 
        (analytics.intentBreakdown[conv.context.currentIntent] || 0) + 1;
    }
  });
  
  analytics.averageDuration = conversations.length > 0 
    ? Math.round(totalDuration / conversations.length) 
    : 0;
  
  analytics.averageSatisfaction = satisfactionCount > 0 
    ? (totalSatisfaction / satisfactionCount).toFixed(2) 
    : 0;
  
  analytics.resolutionRate = conversations.length > 0 
    ? ((analytics.resolvedConversations / conversations.length) * 100).toFixed(2) 
    : 0;
  
  analytics.escalationRate = conversations.length > 0 
    ? ((analytics.escalatedConversations / conversations.length) * 100).toFixed(2) 
    : 0;
  
  return analytics;
};

module.exports = mongoose.model('Conversation', conversationSchema);
