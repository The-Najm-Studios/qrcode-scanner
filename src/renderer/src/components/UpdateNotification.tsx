import { useEffect, useState } from 'react'

interface UpdateInfo {
  version: string
  releaseNotes?: string
  releaseName?: string
}

interface DownloadProgress {
  bytesPerSecond: number
  percent: number
  transferred: number
  total: number
}

const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [updateReady, setUpdateReady] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!window.api?.updater) return

    // Set up event listeners
    window.api.updater.onUpdateAvailable((info: UpdateInfo) => {
      setUpdateAvailable(true)
      setUpdateInfo(info)
      setError(null)
    })

    window.api.updater.onUpdateNotAvailable(() => {
      setUpdateAvailable(false)
      setUpdateInfo(null)
    })

    window.api.updater.onDownloadProgress((progress: DownloadProgress) => {
      setDownloading(true)
      setDownloadProgress(progress)
    })

    window.api.updater.onUpdateDownloaded((info: UpdateInfo) => {
      setDownloading(false)
      setDownloadProgress(null)
      setUpdateReady(true)
      setUpdateInfo(info)
    })

    window.api.updater.onError((err: any) => {
      setError(err.message || 'Update error occurred')
      setDownloading(false)
      setDownloadProgress(null)
    })
  }, [])

  const handleDownloadUpdate = async () => {
    try {
      setDownloading(true)
      setError(null)
      await window.api.updater.downloadUpdate()
    } catch (err) {
      setDownloading(false)
      setError('Failed to download update')
    }
  }

  const handleInstallUpdate = async () => {
    try {
      setInstalling(true)
      setError(null)
      await window.api.updater.quitAndInstall()
    } catch (err) {
      setInstalling(false)
      setError('Failed to install update')
    }
  }

  const handleCheckForUpdates = async () => {
    try {
      await window.api.updater.checkForUpdates()
    } catch (err) {
      setError('Failed to check for updates')
    }
  }

  if (error) {
    return (
      <div className="update-notification error">
        <p>⚠️ Update Error: {error}</p>
        <button onClick={() => setError(null)}>Dismiss</button>
      </div>
    )
  }

  if (installing) {
    return (
      <div className="update-notification installing">
        <h3>⚙️ Installing Update...</h3>
        <div className="spinner"></div>
        <p>Installing update and restarting application...</p>
        <p>
          <small>This may take a few moments</small>
        </p>
      </div>
    )
  }

  if (updateReady) {
    return (
      <div className="update-notification ready">
        <h3>🎉 Update Ready!</h3>
        <p>Version {updateInfo?.version} has been downloaded and is ready to install.</p>
        <div className="update-buttons">
          <button onClick={handleInstallUpdate}>Install Now & Restart</button>
          <button onClick={() => setUpdateReady(false)}>Install Later</button>
        </div>
      </div>
    )
  }

  if (downloading && downloadProgress) {
    return (
      <div className="update-notification downloading">
        <h3>⬇️ Downloading Update...</h3>
        <div className="spinner"></div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${downloadProgress.percent}%` }}></div>
        </div>
        <p>
          {Math.round(downloadProgress.percent)}% -{' '}
          {(downloadProgress.bytesPerSecond / 1024 / 1024).toFixed(2)} MB/s
        </p>
      </div>
    )
  }

  if (downloading && !downloadProgress) {
    return (
      <div className="update-notification downloading">
        <h3>⬇️ Preparing Download...</h3>
        <div className="spinner"></div>
        <p>Initializing update download...</p>
      </div>
    )
  }

  if (updateAvailable) {
    return (
      <div className="update-notification available">
        <h3>🚀 Update Available!</h3>
        <p>Version {updateInfo?.version} is now available.</p>
        {updateInfo?.releaseNotes && (
          <details>
            <summary>Release Notes</summary>
            <p>{updateInfo.releaseNotes}</p>
          </details>
        )}
        <div className="update-buttons">
          <button onClick={handleDownloadUpdate}>Download Update</button>
          <button onClick={() => setUpdateAvailable(false)}>Later</button>
        </div>
      </div>
    )
  }

  return (
    <div className="update-notification hidden">
      <button onClick={handleCheckForUpdates} className="check-updates-btn">
        Check for Updates
      </button>
    </div>
  )
}

export default UpdateNotification
