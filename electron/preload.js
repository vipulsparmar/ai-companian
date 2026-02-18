const { contextBridge, ipcRenderer } = require('electron');

console.log('preload.js loaded');

contextBridge.exposeInMainWorld('electronAPI', {
  // Capture screenshot
  captureScreenshot: () => ipcRenderer.invoke('capture-screenshot'),
  // Get current window height
  getWindowHeight: () => ipcRenderer.invoke('get-window-height'),
  // Toggle content protection
  toggleContentProtection: (enable) => ipcRenderer.send('toggle-content-protection', enable),
  // Platform info
  platform: process.platform,
  // App version
  appVersion: process.env.npm_package_version || '1.0.0',
}); 