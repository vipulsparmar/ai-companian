# Setup Guide

## Quick Fix for "Failed to fetch" Error

The error you're seeing is likely because the OpenAI API key is not configured. Here's how to fix it:

### 1. Create Environment File

Create a `.env` file in the root directory of your project:

```bash
# Create .env file
OPENAI_API_KEY=your_actual_openai_api_key_here
NODE_ENV=development
```

### 2. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and paste it in your `.env` file

### 3. Restart the Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### 4. Test the Application

1. Open http://localhost:3000
2. Click the "Listen" button
3. The app should now connect successfully

## Troubleshooting

### If you still get errors:

1. **Check the console** for detailed error messages
2. **Verify your API key** is correct and has credits
3. **Make sure the .env file** is in the root directory
4. **Restart the server** after creating the .env file

### Common Issues:

- **"OpenAI API key not configured"**: Missing or incorrect .env file
- **"No ephemeral key provided"**: API key is invalid or has no credits
- **"Failed to fetch"**: Network issue or server not running

## File Structure

Your project should look like this:
```
openai-realtime-agents/
├── .env                    ← Create this file
├── package.json
├── src/
│   └── app/
│       ├── SimpleApp.tsx
│       ├── components/
│       └── agentConfigs/
└── ...
```

## Need Help?

If you're still having issues, check:
1. Browser console for error messages
2. Terminal/server logs for API errors
3. OpenAI account for API key validity and credits 