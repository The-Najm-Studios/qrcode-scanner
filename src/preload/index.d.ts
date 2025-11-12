import { ElectronAPI } from '@electron-toolkit/preload'

interface UpdaterAPI {
  checkForUpdates: () => Promise<any>
  downloadUpdate: () => Promise<any>
  quitAndInstall: () => Promise<void>
  onUpdateAvailable: (callback: (info: any) => void) => void
  onUpdateNotAvailable: (callback: (info: any) => void) => void
  onUpdateDownloaded: (callback: (info: any) => void) => void
  onDownloadProgress: (callback: (progress: any) => void) => void
  onError: (callback: (error: any) => void) => void
}

interface ScannerAPI {
  getStatus: () => Promise<boolean>
  sendCommand: (command: string) => Promise<{ success: boolean; error?: string }>
  onQRScanned: (callback: (data: string) => void) => void
  removeQRListener: () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      updater: UpdaterAPI
      scanner: ScannerAPI
    }
  }
}
