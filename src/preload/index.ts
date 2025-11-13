import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Auto-updater API
  updater: {
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
    onUpdateAvailable: (callback: (info: any) => void) => {
      ipcRenderer.on('update-available', (_event, info) => callback(info))
    },
    onUpdateNotAvailable: (callback: (info: any) => void) => {
      ipcRenderer.on('update-not-available', (_event, info) => callback(info))
    },
    onUpdateDownloaded: (callback: (info: any) => void) => {
      ipcRenderer.on('update-downloaded', (_event, info) => callback(info))
    },
    onDownloadProgress: (callback: (progress: any) => void) => {
      ipcRenderer.on('download-progress', (_event, progress) => callback(progress))
    },
    onError: (callback: (error: any) => void) => {
      ipcRenderer.on('updater-error', (_event, error) => callback(error))
    }
  },
  // QR Scanner API
  scanner: {
    getStatus: () => {
      console.log('[Preload] scanner.getStatus() called')
      return ipcRenderer.invoke('scanner-status')
    },
    reconnect: () => {
      console.log('[Preload] scanner.reconnect() called')
      return ipcRenderer.invoke('scanner-reconnect')
    },
    sendCommand: (command: string) => {
      console.log('[Preload] scanner.sendCommand() called with:', command)
      return ipcRenderer.invoke('scanner-send-command', command)
    },
    onQRScanned: (callback: (data: string) => void) => {
      console.log('[Preload] 🎯 scanner.onQRScanned() callback registered')
      console.log('[Preload] 🎯 Callback type:', typeof callback)
      console.log('[Preload] 🎯 Setting up IPC listener for "qr-scanned" event...')
      
      ipcRenderer.on('qr-scanned', (_event, data) => {
        console.log('[Preload] �🚨🚨 qr-scanned IPC event received!')
        console.log('[Preload] 📡 Data:', data)
        console.log('[Preload] � Event object exists:', !!_event)
        console.log('[Preload] �🚀 About to call renderer callback...')
        
        try {
          callback(data)
          console.log('[Preload] ✅ Renderer callback execution completed')
        } catch (error) {
          console.error('[Preload] ❌ Error in renderer callback:', error)
        }
      })
      
      console.log('[Preload] ✅ IPC listener setup completed')
    },
    removeQRListener: () => {
      console.log('[Preload] scanner.removeQRListener() called')
      ipcRenderer.removeAllListeners('qr-scanned')
      console.log('[Preload] ✅ All qr-scanned listeners removed')
    }
  },
  // Window/Fullscreen API
  window: {
    toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
    setFullscreen: (fullscreen: boolean) => ipcRenderer.invoke('set-fullscreen', fullscreen),
    isFullscreen: () => ipcRenderer.invoke('is-fullscreen')
  },
  // Database API for API keys
  apiKeys: {
    getAll: () => ipcRenderer.invoke('apiKeys:list'),
    create: (name: string, value: string) => ipcRenderer.invoke('apiKeys:create', name, value)
  },
  // App API
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
