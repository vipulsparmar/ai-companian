# OpenAI Realtime Agents

A real-time AI assistant application built with Next.js, React, and OpenAI's Realtime API. This application provides a conversational AI experience with voice capabilities, agent handoffs, and content moderation.

## 🚀 Features

- **Real-time AI Conversations**: Powered by GPT-4o-mini with real-time response capabilities
- **Voice Interaction**: Audio input and transcription support
- **Agent Handoffs**: Seamless transfer between different AI agents
- **Content Moderation**: Built-in guardrails for safe conversations
- **Cross-platform**: Available as web app and Electron desktop application
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **OpenAI API Key** with access to GPT-4o-mini models
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd openai-realtime-agents
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp env.sample .env.local
```

Edit `.env.local` and add your OpenAI API key:

```env
# OpenAI API Configuration
# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_actual_openai_api_key_here

# Optional: Set to 'development' for debug logging
NODE_ENV=development
```

## 🏃‍♂️ Running the Application

### Web Application

#### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

#### Production Mode
```bash
npm run build
npm start
```

### Desktop Application (Electron)

#### Development Mode
```bash
npm run electron-dev
```

#### Production Build
```bash
npm run electron-build
```

## 🎯 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build the application for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run electron` | Run Electron app (requires built app) |
| `npm run electron-dev` | Run Electron in development mode |
| `npm run electron-build` | Build Electron app for distribution |
| `npm run electron-pack` | Package Electron app without building |

## 🏗️ Project Structure

```
src/
├── app/
│   ├── agentConfigs/          # AI agent configurations
│   │   ├── generalAI.ts       # General AI assistant
│   │   ├── guardrails.ts      # Content moderation
│   │   └── voiceAgentMetaprompt.txt
│   ├── api/                   # API routes
│   │   ├── responses/         # OpenAI API proxy
│   │   └── session/           # Session management
│   ├── components/            # React components
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utility functions
├── electron/                  # Electron main process
└── public/                    # Static assets
```

## 🤖 AI Agent Configuration

### General AI Assistant

The main AI agent is configured in `src/app/agentConfigs/generalAI.ts`:

- **Capabilities**: Answer questions on any subject, problem-solving, creative ideas
- **Personality**: Helpful, friendly, approachable, conversational
- **Model**: GPT-4o-mini-realtime-preview

### Content Moderation

Guardrails are implemented in `src/app/agentConfigs/guardrails.ts`:

- **Offensive Content**: Hate speech, discriminatory language, insults
- **Off-brand Content**: Competitor disparagement
- **Violence**: Threats, incitement of harm
- **Model**: GPT-4o-mini for classification

## 🔧 Configuration Options

### Audio Codec Selection

You can specify audio codecs via URL parameters:

```
http://localhost:3000?codec=opus    # Default (high quality)
http://localhost:3000?codec=pcm     # Uncompressed
http://localhost:3000?codec=ulaw    # Narrow-band simulation
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `NODE_ENV` | Environment mode (development/production) | No |

## 🎮 Usage

### Starting a Conversation

1. **Web App**: Open `http://localhost:3000` in your browser
2. **Desktop App**: Launch the Electron application
3. Click the microphone button to start voice interaction
4. Speak clearly and wait for AI responses

### Text Input

- Type messages in the text input field
- Press Enter to send
- Use the interrupt button to stop AI responses

### Voice Controls

- **Push-to-Talk**: Hold the microphone button while speaking
- **Continuous Mode**: Click once to start, click again to stop
- **Mute**: Use the mute button to disable audio input

## 🔒 Security & Privacy

- API keys are stored locally and never transmitted to third parties
- Audio processing happens in real-time and is not stored
- Content moderation prevents inappropriate responses
- All communications use secure HTTPS/WebRTC protocols

## 🐛 Troubleshooting

### Common Issues

#### "OpenAI API key not configured"
- Ensure your `.env.local` file exists and contains a valid API key
- Restart the development server after adding the API key

#### Audio not working
- Check microphone permissions in your browser
- Ensure you're using HTTPS in production (required for WebRTC)
- Try different audio codecs via URL parameters

#### Build errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Update Node.js to version 18 or higher
- Check for TypeScript errors: `npm run lint`

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env.local` file.

## 📦 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- **Netlify**: Use `npm run build` and deploy the `out` directory
- **Railway**: Connect repository and add environment variables
- **Docker**: Use the provided Dockerfile (if available)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [OpenAI Realtime API](https://platform.openai.com/docs/realtime)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Desktop app with [Electron](https://www.electronjs.org/)

## 📞 Support

For issues and questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Search existing [GitHub issues](https://github.com/your-repo/issues)
3. Create a new issue with detailed information about your problem

---

**Note**: This application requires an active OpenAI API key with access to GPT-4o-mini models. Ensure you have sufficient API credits for your usage. 