/**
 * Chatbot Service - Core NLP Processing and Conversation Management
 * Handles intent classification, entity extraction, sentiment analysis, and response generation
 */

const logger = require('../config/logger');

class ChatbotService {
  constructor() {
    this.config = null;
    this.conversationContexts = new Map(); // In-memory context cache
    this.responseCache = new Map(); // Cache for common responses
  }

  /**
   * Initialize service with configuration
   */
  async initialize(config) {
    this.config = config;
    logger.info('ChatbotService initialized');
  }

  /**
   * Process incoming message
   */
  async processMessage(conversationId, userId, message, sessionContext = {}) {
    try {
      const startTime = Date.now();

      // Step 1: Detect language
      const language = await this.detectLanguage(message);

      // Step 2: Preprocess message
      const processedMessage = this.preprocessMessage(message);

      // Step 3: Check cache for common queries
      const cachedResponse = this.checkResponseCache(processedMessage, language);
      if (cachedResponse) {
        logger.info(`Cache hit for message: ${processedMessage.substring(0, 50)}`);
        return cachedResponse;
      }

      // Step 4: Analyze sentiment
      const sentiment = await this.analyzeSentiment(processedMessage);

      // Step 5: Classify intent
      const intent = await this.classifyIntent(processedMessage, language);

      // Step 6: Extract entities
      const entities = await this.extractEntities(processedMessage, intent);

      // Step 7: Get or create conversation context
      const context = this.getConversationContext(conversationId, sessionContext);

      // Step 8: Update context with new information
      this.updateContext(context, intent, entities);

      // Step 9: Check for escalation triggers
      const shouldEscalate = this.checkEscalationTriggers(
        sentiment,
        intent,
        context,
        processedMessage
      );

      if (shouldEscalate.escalate) {
        return this.handleEscalation(shouldEscalate.reason, context);
      }

      // Step 10: Generate response
      const response = await this.generateResponse(
        processedMessage,
        intent,
        entities,
        context,
        language
      );

      // Step 11: Execute any required actions
      if (intent.actions && intent.actions.length > 0) {
        await this.executeActions(intent.actions, entities, context);
      }

      // Step 12: Cache response if applicable
      if (intent.priority > 5) {
        this.cacheResponse(processedMessage, language, response);
      }

      const processingTime = Date.now() - startTime;
      logger.info(`Message processed in ${processingTime}ms`);

      return {
        response: response.text,
        intent: intent.name,
        entities,
        sentiment,
        confidence: intent.confidence,
        language,
        quickReplies: response.quickReplies || [],
        metadata: {
          processingTime,
          cached: false
        }
      };

    } catch (error) {
      logger.error('Error processing message:', error);
      return this.getErrorResponse(error);
    }
  }

  /**
   * Detect language from text
   */
  async detectLanguage(text) {
    // Simple language detection based on character sets and common words
    // In production, use a library like franc or call an API
    
    const patterns = {
      en: /\b(the|is|are|was|were|have|has|will|would|can|could)\b/i,
      es: /\b(el|la|los|las|un|una|es|son|está|están)\b/i,
      fr: /\b(le|la|les|un|une|est|sont|été|avoir)\b/i,
      de: /\b(der|die|das|ein|eine|ist|sind|war|waren)\b/i,
      it: /\b(il|la|gli|le|un|una|è|sono|essere|avere)\b/i,
      pt: /\b(o|a|os|as|um|uma|é|são|está|estão)\b/i,
      zh: /[\u4e00-\u9fa5]/,
      ja: /[\u3040-\u309f\u30a0-\u30ff]/,
      ar: /[\u0600-\u06ff]/
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    return 'en'; // Default to English
  }

  /**
   * Preprocess message
   */
  preprocessMessage(message) {
    return message
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .toLowerCase();
  }

  /**
   * Analyze sentiment
   */
  async analyzeSentiment(text) {
    // Basic sentiment analysis using keyword matching
    // In production, use a proper NLP model or API

    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'love', 'perfect', 'best', 'happy', 'pleased', 'satisfied', 'thank'
    ];

    const negativeWords = [
      'bad', 'terrible', 'horrible', 'awful', 'worst', 'hate', 'angry',
      'frustrated', 'disappointed', 'sad', 'upset', 'problem', 'issue',
      'broken', 'wrong', 'fail', 'never', 'cancel', 'refund'
    ];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.1;
      if (negativeWords.includes(word)) score -= 0.15;
    });

    // Normalize to -1 to 1 range
    score = Math.max(-1, Math.min(1, score));

    let label = 'neutral';
    if (score > 0.2) label = 'positive';
    if (score < -0.2) label = 'negative';

    return { score, label };
  }

  /**
   * Classify intent
   */
  async classifyIntent(text, language = 'en') {
    if (!this.config || !this.config.intents) {
      return { name: 'general_inquiry', confidence: 0.5, actions: [] };
    }

    let bestMatch = null;
    let highestScore = 0;

    // Simple keyword-based matching
    // In production, use a proper NLP model (BERT, GPT-4, etc.)
    for (const intent of this.config.intents) {
      if (!intent.isActive) continue;

      let score = 0;
      const keywordCount = intent.keywords?.length || 0;
      const phraseCount = intent.phrases?.length || 0;

      // Check keywords
      if (intent.keywords) {
        intent.keywords.forEach(keyword => {
          if (text.includes(keyword.toLowerCase())) {
            score += 1 / keywordCount;
          }
        });
      }

      // Check phrases
      if (intent.phrases) {
        intent.phrases.forEach(phrase => {
          if (text.includes(phrase.toLowerCase())) {
            score += 2 / phraseCount; // Phrases weighted higher than keywords
          }
        });
      }

      // Apply priority weight
      score *= (1 + (intent.priority || 0) / 10);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = intent;
      }
    }

    if (!bestMatch || highestScore < 0.3) {
      return {
        name: 'unknown',
        confidence: highestScore,
        actions: [],
        requiresEscalation: true
      };
    }

    return {
      name: bestMatch.name,
      confidence: Math.min(highestScore, 1),
      actions: bestMatch.actions || [],
      requiredEntities: bestMatch.requiredEntities || [],
      responses: bestMatch.responses || []
    };
  }

  /**
   * Extract entities from text
   */
  async extractEntities(text, intent) {
    const entities = {};

    if (!this.config || !this.config.entities) {
      return entities;
    }

    // Order ID pattern
    const orderIdMatch = text.match(/\b[A-Z0-9]{10,15}\b/);
    if (orderIdMatch) {
      entities.orderId = orderIdMatch[0];
    }

    // Email pattern
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      entities.email = emailMatch[0];
    }

    // Phone pattern
    const phoneMatch = text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
    if (phoneMatch) {
      entities.phone = phoneMatch[0];
    }

    // Price pattern
    const priceMatch = text.match(/\$?\d+\.?\d{0,2}/);
    if (priceMatch) {
      entities.price = priceMatch[0];
    }

    // Product mentions (extract capitalized words)
    const productMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
    if (productMatches) {
      entities.products = productMatches;
    }

    // Numbers
    const numberMatch = text.match(/\b\d+\b/);
    if (numberMatch) {
      entities.number = parseInt(numberMatch[0]);
    }

    return entities;
  }

  /**
   * Get or create conversation context
   */
  getConversationContext(conversationId, sessionContext = {}) {
    if (this.conversationContexts.has(conversationId)) {
      return this.conversationContexts.get(conversationId);
    }

    const context = {
      conversationId,
      startTime: Date.now(),
      messageCount: 0,
      intents: [],
      entities: {},
      lastIntent: null,
      currentIntent: null,
      variables: {},
      userInfo: sessionContext.userInfo || {},
      ...sessionContext
    };

    this.conversationContexts.set(conversationId, context);
    return context;
  }

  /**
   * Update conversation context
   */
  updateContext(context, intent, entities) {
    context.messageCount++;
    context.lastIntent = context.currentIntent;
    context.currentIntent = intent.name;
    context.intents.push({
      name: intent.name,
      timestamp: Date.now(),
      confidence: intent.confidence
    });

    // Merge entities
    Object.assign(context.entities, entities);

    // Update last activity
    context.lastActivity = Date.now();
  }

  /**
   * Check escalation triggers
   */
  checkEscalationTriggers(sentiment, intent, context, message) {
    const rules = this.config?.escalationRules || {};

    // Negative sentiment
    if (sentiment.score < (rules.sentimentThreshold || -0.6)) {
      return { escalate: true, reason: 'negative_sentiment' };
    }

    // Low confidence
    if (intent.confidence < (rules.confidenceThreshold || 0.7)) {
      return { escalate: true, reason: 'low_confidence' };
    }

    // Repeated same intent
    const recentIntents = context.intents.slice(-3);
    if (recentIntents.length >= 3 && 
        recentIntents.every(i => i.name === intent.name)) {
      return { escalate: true, reason: 'repetition' };
    }

    // Long conversation
    const duration = (Date.now() - context.startTime) / 1000;
    if (duration > (rules.maxConversationDuration || 600)) {
      return { escalate: true, reason: 'timeout' };
    }

    // Escalation keywords
    const keywords = rules.escalationKeywords || [
      'speak to human', 'talk to agent', 'manager', 'supervisor',
      'lawyer', 'legal', 'lawsuit', 'fraud', 'scam'
    ];

    for (const keyword of keywords) {
      if (message.includes(keyword.toLowerCase())) {
        return { escalate: true, reason: 'user_request' };
      }
    }

    // VIP customer
    if (rules.vipAutoEscalate && context.userInfo?.customerSegment === 'vip') {
      return { escalate: true, reason: 'vip_customer' };
    }

    return { escalate: false };
  }

  /**
   * Handle escalation
   */
  handleEscalation(reason, context) {
    logger.info(`Escalating conversation ${context.conversationId}: ${reason}`);

    const messages = {
      negative_sentiment: "I sense you're frustrated. Let me connect you with one of our specialists who can better assist you.",
      low_confidence: "I want to make sure you get the best help. Let me transfer you to a human agent.",
      repetition: "I apologize for not resolving this yet. Let me get a specialist to help you right away.",
      timeout: "I want to ensure this gets resolved. Let me connect you with an agent who can assist further.",
      user_request: "Of course! I'm connecting you with a live agent now.",
      vip_customer: "As a valued customer, I'm connecting you directly with our priority support team."
    };

    return {
      response: messages[reason] || messages.low_confidence,
      intent: 'escalation',
      escalate: true,
      escalationReason: reason,
      metadata: {
        context: {
          conversationId: context.conversationId,
          messageCount: context.messageCount,
          duration: (Date.now() - context.startTime) / 1000,
          intents: context.intents,
          entities: context.entities,
          userInfo: context.userInfo
        }
      }
    };
  }

  /**
   * Generate response
   */
  async generateResponse(message, intent, entities, context, language) {
    // Get response template from intent configuration
    let responseText = '';
    const quickReplies = [];

    if (intent.responses && intent.responses.length > 0) {
      // Find response in requested language or fallback to English
      let response = intent.responses.find(r => r.language === language);
      if (!response) {
        response = intent.responses.find(r => r.language === 'en');
      }

      if (response) {
        // Pick random variant if available
        if (response.variants && response.variants.length > 0) {
          const randomIndex = Math.floor(Math.random() * response.variants.length);
          responseText = response.variants[randomIndex];
        } else {
          responseText = response.text;
        }
      }
    }

    // Fallback response
    if (!responseText) {
      responseText = "I understand you need help. Let me assist you with that.";
    }

    // Replace placeholders with entity values
    Object.entries(entities).forEach(([key, value]) => {
      responseText = responseText.replace(`{${key}}`, value);
    });

    // Add quick replies based on intent
    if (intent.name === 'order_tracking' && entities.orderId) {
      quickReplies.push('Cancel Order', 'Change Address', 'Contact Shipping Carrier');
    } else if (intent.name === 'product_inquiry') {
      quickReplies.push('Add to Cart', 'View Similar Products', 'Check Stock');
    } else if (intent.name === 'general_inquiry') {
      quickReplies.push('Track Order', 'Return Item', 'Payment Help', 'Speak to Agent');
    }

    return {
      text: responseText,
      quickReplies,
      language
    };
  }

  /**
   * Execute intent actions
   */
  async executeActions(actions, entities, context) {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'api_call':
            // Make API call to integrated systems
            logger.info(`Executing API call to ${action.endpoint}`);
            break;

          case 'database_query':
            // Query database
            logger.info('Executing database query');
            break;

          case 'collect_info':
            // Mark that we need to collect specific information
            context.variables.awaitingInfo = action.parameters;
            break;

          default:
            logger.warn(`Unknown action type: ${action.type}`);
        }
      } catch (error) {
        logger.error(`Error executing action ${action.type}:`, error);
      }
    }
  }

  /**
   * Check response cache
   */
  checkResponseCache(message, language) {
    const cacheKey = `${language}:${message}`;
    return this.responseCache.get(cacheKey);
  }

  /**
   * Cache response
   */
  cacheResponse(message, language, response, ttl = 300000) {
    const cacheKey = `${language}:${message}`;
    this.responseCache.set(cacheKey, response);

    // Auto-expire after TTL
    setTimeout(() => {
      this.responseCache.delete(cacheKey);
    }, ttl);
  }

  /**
   * Get error response
   */
  getErrorResponse(error) {
    logger.error('Chatbot service error:', error);

    return {
      response: "I'm having trouble processing that right now. Would you like to speak with a human agent?",
      intent: 'error',
      escalate: true,
      escalationReason: 'technical_issue',
      metadata: {
        error: error.message
      }
    };
  }

  /**
   * Clear conversation context
   */
  clearContext(conversationId) {
    this.conversationContexts.delete(conversationId);
  }

  /**
   * Get conversation statistics
   */
  getStats() {
    return {
      activeContexts: this.conversationContexts.size,
      cachedResponses: this.responseCache.size
    };
  }
}

module.exports = new ChatbotService();
