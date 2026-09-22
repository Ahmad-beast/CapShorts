const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let backendProcess = null;

// Determine if we are in dev mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = 5173;
const BACKEND_PORT = 8000;

// Check if Python backend is already running on port 8000
function checkBackendHealthy() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${BACKEND_PORT}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Spawn Python backend if not active
async function ensureBackendRunning() {
  const isHealthy = await checkBackendHealthy();
  if (isHealthy) {
    console.log('[Electron] Python AI backend is already active on port 8000.');
    return;
  }

  console.log('[Electron] Starting Python AI backend engine...');
  const backendDir = path.resolve(__dirname, '../../backend');
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

  try {
    backendProcess = spawn(pythonCmd, ['engine.py'], {
      cwd: backendDir,
      stdio: 'ignore',
      detached: false,
      env: process.env
    });

    backendProcess.on('error', (err) => {
      console.warn('[Electron] Failed to auto-start Python backend:', err.message);
    });

    console.log('[Electron] Spawned Python backend daemon with PID:', backendProcess.pid);
  } catch (err) {
    console.warn('[Electron] Backend spawn error:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    center: true,
    backgroundColor: '#09090b',
    title: 'CapShorts - Desktop AI Video Studio',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: process.platform === 'darwin' ? { x: 16, y: 16 } : undefined,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: false
    }
  });

  // Open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  const targetUrl = isDev
    ? `http://localhost:${PORT}`
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  // Try loading dev URL with automatic retry until Vite is ready
  const loadWithRetry = (url, maxRetries = 15, interval = 500) => {
    let attempts = 0;
    const tryLoad = () => {
      attempts++;
      mainWindow.loadURL(url).catch(() => {
        if (attempts < maxRetries) {
          setTimeout(tryLoad, interval);
        } else {
          // Fallback to local build if dev server is unavailable
          mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
        }
      });
    };
    tryLoad();
  };

  loadWithRetry(targetUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App Lifecycle
app.whenReady().then(async () => {
  await ensureBackendRunning();
  createWindow();

  // Create standard macOS application menu
  if (process.platform === 'darwin') {
    const template = [
      {
        label: 'CapShorts',
        submenu: [
          { role: 'about', label: 'About CapShorts' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide', label: 'Hide CapShorts' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit', label: 'Quit CapShorts' }
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
          { role: 'paste' },
          { role: 'selectAll' }
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
          { role: 'zoom' },
          { type: 'separator' },
          { role: 'front' }
        ]
      }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (backendProcess) {
    try {
      backendProcess.kill();
    } catch (e) {
      // Ignore
    }
    backendProcess = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (backendProcess) {
    try {
      backendProcess.kill();
    } catch (e) {
      // Ignore
    }
  }
});
