#!/usr/bin/env node

/**
 * Chatbot Quick Setup Script
 * Automates the initial setup and configuration of the AI chatbot system
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}\n`)
};

async function main() {
  console.clear();
  log.header('🤖 AI Chatbot Setup Wizard');
  
  log.info('This wizard will help you set up the chatbot support system.');
  console.log('');

  // Step 1: Check environment
  log.header('Step 1: Environment Check');
  
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    log.success('.env file found');
    envContent = fs.readFileSync(envPath, 'utf8');
  } else {
    log.warning('.env file not found - will create one');
  }

  // Step 2: API Keys
  log.header('Step 2: AI Provider Configuration');
  
  const hasOpenAI = envContent.includes('OPENAI_API_KEY=') && 
                    !envContent.includes('OPENAI_API_KEY=your_');
  
  if (hasOpenAI) {
    log.success('OpenAI API key already configured');
  } else {
    log.info('You need an OpenAI API key for the chatbot to function.');
    log.info('Get one at: https://platform.openai.com/api-keys');
    console.log('');
    
    const apiKey = await question('Enter your OpenAI API key (or press Enter to skip): ');
    
    if (apiKey && apiKey.startsWith('sk-')) {
      envContent += `\n# AI Chatbot Configuration\nOPENAI_API_KEY=${apiKey}\n`;
      envContent += `OPENAI_MODEL=gpt-4-turbo\n`;
      log.success('OpenAI API key added');
    } else if (apiKey) {
      log.error('Invalid API key format. Keys should start with "sk-"');
    } else {
      log.warning('Skipped - you can add this later in .env file');
    }
  }

  // Step 3: Chatbot Settings
  log.header('Step 3: Chatbot Configuration');
  
  const botName = await question('Bot name (default: AI Support Assistant): ') || 'AI Support Assistant';
  const welcomeMsg = await question('Welcome message (default: Hi! How can I help you today?): ') || 'Hi! How can I help you today?';
  const primaryColor = await question('Primary color (default: #3B82F6): ') || '#3B82F6';
  
  envContent += `\n# Chatbot Settings\n`;
  envContent += `CHATBOT_ENABLED=true\n`;
  envContent += `CHATBOT_BOT_NAME=${botName}\n`;
  envContent += `CHATBOT_WELCOME_MESSAGE=${welcomeMsg}\n`;
  envContent += `CHATBOT_PRIMARY_COLOR=${primaryColor}\n`;
  envContent += `CHATBOT_DEFAULT_LANGUAGE=en\n`;
  envContent += `CHATBOT_MAX_MESSAGE_LENGTH=1000\n`;

  log.success('Chatbot configuration added');

  // Step 4: Save .env
  log.header('Step 4: Saving Configuration');
  
  try {
    fs.writeFileSync(envPath, envContent);
    log.success('.env file updated successfully');
  } catch (error) {
    log.error(`Failed to save .env file: ${error.message}`);
    process.exit(1);
  }

  // Step 5: Seed Database
  log.header('Step 5: Database Setup');
  
  const shouldSeed = await question('Would you like to seed the chatbot configuration now? (y/n): ');
  
  if (shouldSeed.toLowerCase() === 'y') {
    log.info('Seeding chatbot configuration...');
    
    try {
      require('dotenv').config({ path: envPath });
      const seedChatbot = require('./seedChatbotConfig');
      await seedChatbot();
      log.success('Database seeded successfully');
    } catch (error) {
      log.error(`Failed to seed database: ${error.message}`);
      log.warning('You can run this manually later: node backend/scripts/seedChatbotConfig.js');
    }
  } else {
    log.info('Skipped - run manually: node backend/scripts/seedChatbotConfig.js');
  }

  // Step 6: Installation Summary
  log.header('🎉 Setup Complete!');
  
  console.log('Next steps:');
  console.log('');
  console.log('1. Start the backend server:');
  console.log('   cd backend && npm run dev');
  console.log('');
  console.log('2. Start the frontend:');
  console.log('   cd frontend && npm run dev');
  console.log('');
  console.log('3. Open your browser and test the chatbot widget');
  console.log('');
  console.log('4. Customize the configuration:');
  console.log('   - Edit intents: GET/PUT /api/chatbot/admin/config');
  console.log('   - View analytics: GET /api/chatbot/admin/analytics');
  console.log('   - Monitor conversations: GET /api/chatbot/admin/conversations');
  console.log('');
  console.log('📚 Documentation:');
  console.log('   - Implementation Guide: CHATBOT_IMPLEMENTATION_GUIDE.md');
  console.log('   - Architecture: AI_CHATBOT_ARCHITECTURE.md');
  console.log('');
  
  const viewGuide = await question('Would you like to view the implementation guide? (y/n): ');
  
  if (viewGuide.toLowerCase() === 'y') {
    const guidePath = path.join(__dirname, '..', '..', 'CHATBOT_IMPLEMENTATION_GUIDE.md');
    if (fs.existsSync(guidePath)) {
      const guide = fs.readFileSync(guidePath, 'utf8');
      console.log('\n' + guide);
    } else {
      log.warning('Implementation guide not found at expected location');
    }
  }

  log.success('Setup wizard completed successfully!');
  console.log('');
  
  rl.close();
}

// Run the setup wizard
main().catch(error => {
  log.error(`Setup failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
