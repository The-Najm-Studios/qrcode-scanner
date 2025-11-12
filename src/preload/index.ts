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
    getStatus: () => ipcRenderer.invoke('scanner-status'),
    reconnect: () => ipcRenderer.invoke('scanner-reconnect'),
    sendCommand: (command: string) => ipcRenderer.invoke('scanner-send-command', command),
    onQRScanned: (callback: (data: string) => void) => {
      ipcRenderer.on('qr-scanned', (_event, data) => callback(data))
    },
    removeQRListener: () => {
      ipcRenderer.removeAllListeners('qr-scanned')
    }
  },
  // Window/Fullscreen API
  window: {
    toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
    setFullscreen: (fullscreen: boolean) => ipcRenderer.invoke('set-fullscreen', fullscreen),
    isFullscreen: () => ipcRenderer.invoke('is-fullscreen')
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
