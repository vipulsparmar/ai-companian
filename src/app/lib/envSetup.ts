import dotenv from 'dotenv';

// Load environment variables
dotenv.config({path: './env'});

// For development, also try .env.local and .env.development
if (process.env.NODE_ENV === 'development') {
  dotenv.config({path: './.env.local'});
  dotenv.config({path: './.env.development'});
}

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY is not set. Please create a .env file with your OpenAI API key.');
  console.warn('   You can copy env.sample to .env and add your API key.');
}