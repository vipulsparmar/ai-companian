# Electron App - Realtime Examples

This is the Electron version of the Realtime Examples application.

## Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

### Installation
```bash
npm install
```

### Environment Setup
1. Copy the sample environment file:
   ```bash
   cp env.sample .env
   ```
2. Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   NODE_ENV=development
   ```

### Running in Development Mode
```bash
npm run electron-dev
```

This will:
1. Start the Next.js development server (with API routes enabled)
2. Wait for the server to be ready
3. Launch the Electron app

### Running Electron Only (after Next.js is built)
```bash
npm run build
npm run electron
```

## Building for Production

### Development Build (with API routes)
```bash
npm run electron-pack
```

### Static Export Build (standalone, no API routes)
```bash
npm run electron-pack-static
```

### Create distributable installers
```bash
# Development build with API routes
npm run electron-build

# Static export build
npm run electron-build-static
```

The built files will be available in the `dist` directory.

## Build Types

### Development Build
- Uses Next.js development server
- API routes work (`/api/session`)
- Requires server to be running
- Larger bundle size

### Static Export Build
- Completely standalone
- No API routes (requires backend service)
- Smaller bundle size
- Works offline (except for API calls)

## Project Structure

- `electron/main.js` - Main Electron process
- `electron/preload.js` - Preload script for secure IPC
- `out/` - Static export of Next.js app (generated after build)
- `dist/` - Electron build output

## Features

- Desktop application with native window controls
- Menu bar with standard options (File, Edit, View, Window)
- Development tools integration
- Cross-platform support (Windows, macOS, Linux)
- Secure context isolation
- Support for both development and production builds

## Scripts

- `npm run electron-dev` - Development mode with hot reload
- `npm run electron` - Run Electron with built Next.js app
- `npm run electron-pack` - Package the app for distribution (dev build)
- `npm run electron-pack-static` - Package the app for distribution (static build)
- `npm run electron-build` - Build installers for all platforms (dev build)
- `npm run electron-build-static` - Build installers for all platforms (static build)

## Notes

- **Development**: Uses Next.js dev server with full API support
- **Production**: Can use either development build (with API routes) or static export
- API routes require a running server in production
- The app maintains the same UI and functionality as the web version
- For standalone distribution, use the static export build 