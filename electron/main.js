const { app, BrowserWindow, screen, Menu, globalShortcut, ipcMain, nativeImage, desktopCapturer, session } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let baseHeight = 800;
let minHeight = 450;
let maxHeight = 2000;
// Removed tray variable
let nextProcess;

function createWindow() {
  // Get screen dimensions and calculate center position
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
  const winWidth = 550;
  const winHeight = 5000;
  const x = Math.round((screenWidth - winWidth) / 2);
  const y = 5;

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: winWidth,
    height: 800, // Changed from 5000 to 800
    x,
    y,
    transparent: false, // Changed from true to false to ensure visibility
    frame: true, // Show frame for now to find the window
    titleBarStyle: 'default', // standard title bar
    alwaysOnTop: true,
    skipTaskbar: false, // Show in taskbar to help find it
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    },
    show: true // Show immediately
  });

  // Make window invisible to screen capture (Disabled for debugging visibility)
  // mainWindow.setContentProtection(true);

  // Choose URL based on whether the app is packaged
  const isDev = !app.isPackaged;
  // Replace 'https://your-production-url.com' with your actual server URL after deployment
  const prodUrl = 'https://your-new-deployment-url.com';
  const targetUrl = isDev ? 'http://localhost:3000' : prodUrl;

  // Load the target URL
  mainWindow.loadURL(targetUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    // Force set the position before showing
    mainWindow.setPosition(x, y);
    mainWindow.show();

    // Debug: Log the actual window position
    const [actualX, actualY] = mainWindow.getPosition();
    console.log('Window position after show:', { x: actualX, y: actualY });
    console.log('Window bounds:', mainWindow.getBounds());
  });

  // Hide from Alt+Tab and taskbar at runtime as well
  mainWindow.setSkipTaskbar(true);

  // Removed Tray icon setup

  // Hide window instead of closing/minimizing
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  // On macOS, hide dock icon
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create menu template
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Window',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          createWindow();
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: 'Ctrl+Shift+Q',
        click: () => {
          app.isQuiting = true;
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  }
];

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Start Next.js server in production
  if (process.env.NODE_ENV === 'production') {
    nextProcess = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['next', 'start', '-p', '3000'], {
      cwd: path.join(__dirname, '..'),
      shell: true,
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'inherit',
    });
  }
  // Enable full desktop capture for getDisplayMedia in renderer
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
      // Grant access to the first screen found
      callback({ video: sources[0], audio: 'loopback' });
    });
  }, { useSystemPicker: true });

  // Set application menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Register global shortcut for quitting
  globalShortcut.register('Ctrl+Shift+Q', () => {
    app.isQuiting = true;
    app.quit();
  });

  // Register global shortcuts for moving the window
  globalShortcut.register('Ctrl+Alt+Up', () => {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x, y - 20);
  });

  globalShortcut.register('Ctrl+Alt+Down', () => {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x, y + 20);
  });

  globalShortcut.register('Ctrl+Alt+Left', () => {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x - 20, y);
  });

  globalShortcut.register('Ctrl+Alt+Right', () => {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x + 20, y);
  });

  // Add handler to get current window height
  ipcMain.handle('get-window-height', (event) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      return mainWindow.getSize()[1];
    }
    return null;
  });

  // Handle content protection toggle
  ipcMain.on('toggle-content-protection', (event, enable) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setContentProtection(enable);
      console.log('Content protection:', enable ? 'enabled' : 'disabled');
    }
  });

  ipcMain.handle('capture-screenshot', async () => {
    if (!mainWindow || mainWindow.isDestroyed()) return null;
    const image = await mainWindow.capturePage();
    return image.toPNG().toString('base64');
  });

  createWindow();

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Clean up global shortcuts when app is quitting
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (nextProcess) nextProcess.kill();
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
}); 