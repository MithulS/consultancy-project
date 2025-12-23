/**
 * Chatbot Routes - API endpoints for chatbot interactions
 */

const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const chatbotService = require('../services/chatbotService');
const integrationService = require('../services/integrationService');
const Conversation = require('../models/conversation');
const ChatbotConfig = require('../models/chatbotConfig');
const logger = require('../config/logger');

/**
 * @route   POST /api/chatbot/message
 * @desc    Send a message to the chatbot
 * @access  Public (with optional auth)
 */
router.post('/message', [
  body('message').notEmpty().trim().isLength({ max: 1000 }),
  body('sessionId').notEmpty(),
  body('language').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, sessionId, language } = req.body;
    const userId = req.user?.userId || null;

    // Get or create conversation
    let conversation = await Conversation.findOne({ sessionId, status: 'active' });

    if (!conversation) {
      // Get user info if authenticated
      let userInfo = {};
      if (userId) {
        const profileData = await integrationService.getUserProfile(userId);
        if (profileData.success) {
          userInfo = profileData.data;
        }
      }

      conversation = new Conversation({
        userId,
        sessionId,
        language: language || 'en',
        userInfo,
        channel: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'web',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop'
      });
    }

    // Add user message to conversation
    conversation.addMessage('user', message);

    // Process message with chatbot service
    const botResponse = await chatbotService.processMessage(
      conversation._id.toString(),
      userId,
      message,
      {
        userInfo: conversation.userInfo,
        language: conversation.language
      }
    );

    // Add bot response to conversation
    conversation.addMessage('bot', botResponse.response, {
      intent: botResponse.intent,
      entities: botResponse.entities,
      confidence: botResponse.confidence,
      sentiment: botResponse.sentiment
    });

    // Update context
    if (botResponse.intent) {
      conversation.context.currentIntent = botResponse.intent;
      conversation.context.lastIntent = conversation.context.currentIntent;
    }

    if (botResponse.entities) {
      Object.assign(conversation.context.entities, botResponse.entities);
    }

    // Check if escalation is needed
    if (botResponse.escalate) {
      conversation.escalate(botResponse.escalationReason);
    }

    // Save conversation
    await conversation.save();

    // Log interaction for analytics
    await integrationService.logChatInteraction(
      conversation._id,
      botResponse.intent,
      !botResponse.escalate,
      userId
    );

    res.json({
      success: true,
      conversationId: conversation._id,
      sessionId: conversation.sessionId,
      response: botResponse.response,
      quickReplies: botResponse.quickReplies || [],
      intent: botResponse.intent,
      escalate: botResponse.escalate || false,
      metadata: botResponse.metadata || {}
    });

  } catch (error) {
    logger.error('Error processing chatbot message:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred processing your message.',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/chatbot/action
 * @desc    Execute a specific action (track order, check inventory, etc.)
 * @access  Public (with optional auth)
 */
router.post('/action', [
  body('action').notEmpty().isIn([
    'track_order', 'cancel_order', 'check_stock', 'search_products',
    'get_order_history', 'get_shipping_estimate', 'get_tracking_info'
  ]),
  body('sessionId').notEmpty(),
  body('parameters').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, sessionId, parameters } = req.body;
    const userId = req.user?.userId || null;

    let result;

    switch (action) {
      case 'track_order':
        result = await integrationService.trackOrder(parameters.orderId, userId);
        break;

      case 'cancel_order':
        result = await integrationService.cancelOrder(
          parameters.orderId,
          userId,
          parameters.reason
        );
        break;

      case 'check_stock':
        result = await integrationService.checkProductAvailability(
          parameters.productId,
          parameters.quantity || 1
        );
        break;

      case 'search_products':
        result = await integrationService.searchProducts(
          parameters.query,
          parameters.filters || {}
        );
        break;

      case 'get_order_history':
        if (!userId) {
          return res.status(401).json({
            success: false,
            message: 'Please log in to view your order history.'
          });
        }
        result = await integrationService.getOrderHistory(userId, parameters.limit || 10);
        break;

      case 'get_shipping_estimate':
        result = await integrationService.getShippingEstimate(
          parameters.address,
          parameters.items
        );
        break;

      case 'get_tracking_info':
        result = await integrationService.getTrackingInfo(parameters.trackingNumber);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action specified.'
        });
    }

    res.json(result);

  } catch (error) {
    logger.error('Error executing chatbot action:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred executing the action.',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/chatbot/escalate
 * @desc    Escalate conversation to human agent
 * @access  Public
 */
router.post('/escalate', [
  body('sessionId').notEmpty(),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const { sessionId, reason } = req.body;

    const conversation = await Conversation.findOne({ sessionId, status: 'active' });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.'
      });
    }

    conversation.escalate(reason || 'user_request');
    await conversation.save();

    res.json({
      success: true,
      message: 'Your conversation has been escalated to a human agent.',
      conversationId: conversation._id,
      queuePosition: 1, // In production, calculate actual queue position
      estimatedWaitTime: 120 // In production, calculate based on agent availability
    });

  } catch (error) {
    logger.error('Error escalating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred escalating the conversation.'
    });
  }
});

/**
 * @route   POST /api/chatbot/feedback
 * @desc    Submit feedback for a conversation
 * @access  Public
 */
router.post('/feedback', [
  body('sessionId').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isString()
], async (req, res) => {
  try {
    const { sessionId, rating, comment } = req.body;

    const conversation = await Conversation.findOne({ sessionId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.'
      });
    }

    conversation.analytics.satisfactionScore = rating;
    conversation.analytics.feedbackComment = comment;

    if (!conversation.endedAt) {
      conversation.resolve(rating, comment);
    }

    await conversation.save();

    res.json({
      success: true,
      message: 'Thank you for your feedback!'
    });

  } catch (error) {
    logger.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred submitting feedback.'
    });
  }
});

/**
 * @route   GET /api/chatbot/conversation/:sessionId
 * @desc    Get conversation history
 * @access  Public
 */
router.get('/conversation/:sessionId', [
  param('sessionId').notEmpty()
], async (req, res) => {
  try {
    const { sessionId } = req.params;

    const conversation = await Conversation.findOne({ sessionId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.'
      });
    }

    res.json({
      success: true,
      data: {
        conversationId: conversation._id,
        sessionId: conversation.sessionId,
        status: conversation.status,
        messages: conversation.messages.map(msg => ({
          messageId: msg.messageId,
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp,
          intent: msg.intent
        })),
        startedAt: conversation.startedAt,
        endedAt: conversation.endedAt,
        language: conversation.language
      }
    });

  } catch (error) {
    logger.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred fetching the conversation.'
    });
  }
});

/**
 * @route   POST /api/chatbot/end
 * @desc    End a conversation
 * @access  Public
 */
router.post('/end', [
  body('sessionId').notEmpty()
], async (req, res) => {
  try {
    const { sessionId } = req.body;

    const conversation = await Conversation.findOne({ sessionId, status: 'active' });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Active conversation not found.'
      });
    }

    conversation.resolve();
    await conversation.save();

    // Clear context from chatbot service
    chatbotService.clearContext(conversation._id.toString());

    res.json({
      success: true,
      message: 'Conversation ended successfully.'
    });

  } catch (error) {
    logger.error('Error ending conversation:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred ending the conversation.'
    });
  }
});

/**
 * ADMIN ROUTES (Protected)
 */

/**
 * @route   GET /api/chatbot/admin/config
 * @desc    Get chatbot configuration
 * @access  Private (Admin)
 */
router.get('/admin/config', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required.'
      });
    }

    const config = await ChatbotConfig.getActiveConfig();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No active configuration found.'
      });
    }

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    logger.error('Error fetching chatbot config:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred fetching the configuration.'
    });
  }
});

/**
 * @route   PUT /api/chatbot/admin/config
 * @desc    Update chatbot configuration
 * @access  Private (Admin)
 */
router.put('/admin/config', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required.'
      });
    }

    const config = await ChatbotConfig.getActiveConfig();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'No active configuration found.'
      });
    }

    // Update config fields
    Object.assign(config, req.body);
    config.lastModifiedBy = req.user.userId;
    await config.save();

    // Reinitialize chatbot service with new config
    await chatbotService.initialize(config);

    res.json({
      success: true,
      message: 'Configuration updated successfully.',
      data: config
    });

  } catch (error) {
    logger.error('Error updating chatbot config:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred updating the configuration.'
    });
  }
});

/**
 * @route   GET /api/chatbot/admin/analytics
 * @desc    Get chatbot analytics
 * @access  Private (Admin)
 */
router.get('/admin/analytics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required.'
      });
    }

    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = await Conversation.getAnalytics(start, end);

    // Add service stats
    const serviceStats = chatbotService.getStats();

    res.json({
      success: true,
      data: {
        ...analytics,
        serviceStats,
        dateRange: { start, end }
      }
    });

  } catch (error) {
    logger.error('Error fetching chatbot analytics:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred fetching analytics.'
    });
  }
});

/**
 * @route   GET /api/chatbot/admin/conversations
 * @desc    Get all conversations (with filters)
 * @access  Private (Admin)
 */
router.get('/admin/conversations', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required.'
      });
    }

    const { status, language, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (language) query.language = language;

    const conversations = await Conversation.find(query)
      .sort({ startedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Conversation.countDocuments(query);

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred fetching conversations.'
    });
  }
});

/**
 * @route   GET /api/chatbot/admin/escalated
 * @desc    Get escalated conversations
 * @access  Private (Admin/Agent)
 */
router.get('/admin/escalated', auth, async (req, res) => {
  try {
    if (!['admin', 'agent'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Agent or admin access required.'
      });
    }

    const agentId = req.user.role === 'agent' ? req.user.userId : null;
    const escalated = await Conversation.getEscalatedConversations(agentId);

    res.json({
      success: true,
      data: escalated
    });

  } catch (error) {
    logger.error('Error fetching escalated conversations:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred fetching escalated conversations.'
    });
  }
});

module.exports = router;
