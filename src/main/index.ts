import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { GM60Scanner } from './gm60-scanner'
import icon from '../../resources/icon.png?asset'

// Configure auto-updater
autoUpdater.checkForUpdatesAndNotify()

let mainWindow: BrowserWindow
let qrScanner: GM60Scanner

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info)
  if (mainWindow) {
    // Send only serializable data
    const sanitizedInfo = {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseName: info.releaseName,
      releaseNotes: info.releaseNotes
    }
    mainWindow.webContents.send('update-available', sanitizedInfo)
  }
})

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info)
  if (mainWindow) {
    // Send only serializable data
    const sanitizedInfo = {
      version: info.version,
      releaseDate: info.releaseDate
    }
    mainWindow.webContents.send('update-not-available', sanitizedInfo)
  }
})

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater:', err)
  if (mainWindow) {
    // Send only the error message, not the full error object
    const sanitizedError = {
      message: err instanceof Error ? err.message : 'Unknown error',
      name: err instanceof Error ? err.name : 'Error'
    }
    mainWindow.webContents.send('updater-error', sanitizedError)
  }
})

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = `Download speed: ${progressObj.bytesPerSecond}`
  log_message = log_message + ` - Downloaded ${progressObj.percent}%`
  log_message = log_message + ` (${progressObj.transferred}/${progressObj.total})`
  console.log(log_message)
  if (mainWindow) {
    // This object should already be serializable, but ensure clean structure
    const sanitizedProgress = {
      bytesPerSecond: progressObj.bytesPerSecond,
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total
    }
    mainWindow.webContents.send('download-progress', sanitizedProgress)
  }
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info)
  if (mainWindow) {
    // Send only serializable data
    const sanitizedInfo = {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseName: info.releaseName,
      releaseNotes: info.releaseNotes
    }
    mainWindow.webContents.send('update-downloaded', sanitizedInfo)
  }
})

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Auto-updater IPC handlers
  ipcMain.handle('check-for-updates', async () => {
    if (!is.dev) {
      try {
        const result = await autoUpdater.checkForUpdates()
        // Extract only serializable data to avoid cloning errors
        return {
          updateInfo: result ? {
            version: result.updateInfo?.version,
            files: result.updateInfo?.files?.map(file => ({
              url: file.url,
              sha512: file.sha512,
              size: file.size
            })),
            path: result.updateInfo?.path,
            sha512: result.updateInfo?.sha512,
            releaseDate: result.updateInfo?.releaseDate
          } : null,
          cancellationToken: null, // Don't send the cancellation token
          versionInfo: result ? {
            version: result.updateInfo?.version
          } : null
        }
      } catch (error) {
        console.error('Error checking for updates:', error)
        return { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
    return null
  })

  ipcMain.handle('download-update', async () => {
    if (!is.dev) {
      try {
        await autoUpdater.downloadUpdate()
        // Return a simple success indicator instead of complex objects
        return { success: true }
      } catch (error) {
        console.error('Error downloading update:', error)
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    }
    return { success: false, error: 'Development mode' }
  })

  ipcMain.handle('quit-and-install', () => {
    if (!is.dev) {
      autoUpdater.quitAndInstall()
    }
  })

  // QR Scanner IPC handlers
  ipcMain.handle('scanner-status', () => {
    return qrScanner ? qrScanner.isConnected() : false
  })

  ipcMain.handle('scanner-reconnect', async () => {
    if (qrScanner) {
      try {
        const success = await qrScanner.reconnect()
        return { success, connected: qrScanner.isConnected() }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, connected: false, error: errorMessage }
      }
    }
    return { success: false, connected: false, error: 'Scanner not initialized' }
  })

  ipcMain.handle('scanner-send-command', async (_, command: string) => {
    if (qrScanner) {
      try {
        await qrScanner.sendCommand(command)
        return { success: true }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: errorMessage }
      }
    }
    return { success: false, error: 'Scanner not initialized' }
  })

  // Initialize QR Scanner
  qrScanner = new GM60Scanner()
  qrScanner.onScan((data) => {
    // Send scanned data to renderer
    if (mainWindow) {
      mainWindow.webContents.send('qr-scanned', data)
    }
  })

  createWindow()

  // Check for updates after app is ready (only in production)
  if (!is.dev) {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify()
    }, 2000) // Wait 2 seconds after app start
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  // Cleanup QR scanner
  if (qrScanner) {
    await qrScanner.disconnect()
  }

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
