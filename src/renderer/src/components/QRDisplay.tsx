import { useEffect, useState } from 'react'

interface QRScanData {
  data: string
  timestamp: Date
}

interface QRDisplayProps {
  activeTab: 'scan' | 'history'
}

const QRDisplay = ({ activeTab }: QRDisplayProps) => {
  const [scanHistory, setScanHistory] = useState<QRScanData[]>([])
  const [scannerStatus, setScannerStatus] = useState<boolean>(false)
  const [isListening, setIsListening] = useState<boolean>(false)

  useEffect(() => {
    // Check scanner status on mount
    checkScannerStatus()

    // Set up QR scan listener
    if (window.api?.scanner) {
      window.api.scanner.onQRScanned((data: string) => {
        console.log('QR Code received:', data)
        const newScan: QRScanData = {
          data: data,
          timestamp: new Date()
        }
        setScanHistory((prev) => [newScan, ...prev.slice(0, 19)]) // Keep last 20 scans
      })
      setIsListening(true)
    }

    // Cleanup listener on unmount
    return () => {
      if (window.api?.scanner) {
        window.api.scanner.removeQRListener()
        setIsListening(false)
      }
    }
  }, [])

  const checkScannerStatus = async () => {
    if (window.api?.scanner) {
      try {
        const status = await window.api.scanner.getStatus()
        setScannerStatus(status)
      } catch (error) {
        console.error('Failed to check scanner status:', error)
        setScannerStatus(false)
      }
    }
  }

  const openLink = (url: string) => {
    // Check if it's a valid URL
    try {
      const parsedUrl = new URL(url)
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        // Use window.open as fallback for external links
        window.open(url, '_blank')
      }
    } catch (error) {
      console.log('Not a valid URL:', url)
    }
  }

  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch (_) {
      return false
    }
  }

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const clearHistory = () => {
    setScanHistory([])
  }

  const renderScanTab = () => (
    <div className="scan-tab">
      <div className="scanner-status">
        <h2>📱 GM60 QR Scanner</h2>
        <div className={`status-indicator ${scannerStatus ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {scannerStatus ? 'Connected' : 'Disconnected'}
        </div>
        <div className={`listener-status ${isListening ? 'listening' : 'not-listening'}`}>
          {isListening ? '🎧 Listening for scans...' : '❌ Not listening'}
        </div>
        <button onClick={checkScannerStatus} className="refresh-btn">
          🔄 Refresh Status
        </button>
      </div>

      {scanHistory.length > 0 && (
        <div className="latest-scan">
          <h3>🔍 Latest Scan</h3>
          <div className="scan-item latest">
            <div className="scan-content">
              <div className="scan-data">
                {isValidUrl(scanHistory[0].data) ? (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      openLink(scanHistory[0].data)
                    }}
                    className="scan-link"
                    title="Click to open in browser"
                  >
                    🔗 {scanHistory[0].data}
                  </a>
                ) : (
                  <span className="scan-text">📝 {scanHistory[0].data}</span>
                )}
              </div>
              <div className="scan-timestamp">⏰ {formatTimestamp(scanHistory[0].timestamp)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="scan-instructions">
        <h3>📋 Instructions</h3>
        <ul>
          <li>🔌 Check scanner connection</li>
          <li>📷 Point at QR code</li>
          <li>✨ Data appears automatically</li>
        </ul>
      </div>
    </div>
  )

  const renderHistoryTab = () => (
    <div className="history-tab">
      <div className="history-header">
        <h3>📋 Scan History</h3>
        {scanHistory.length > 0 && (
          <button onClick={clearHistory} className="clear-btn">
            🗑️ Clear All
          </button>
        )}
      </div>

      {scanHistory.length === 0 ? (
        <div className="no-scans">
          <p>🔍 No QR codes scanned yet</p>
          <p>Switch to the "Scan QR Code" tab and scan something!</p>
        </div>
      ) : (
        <div className="scan-list">
          {scanHistory.map((scan, index) => (
            <div key={index} className="scan-item">
              <div className="scan-content">
                <div className="scan-data">
                  {isValidUrl(scan.data) ? (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        openLink(scan.data)
                      }}
                      className="scan-link"
                      title="Click to open in browser"
                    >
                      🔗 {scan.data}
                    </a>
                  ) : (
                    <span className="scan-text">📝 {scan.data}</span>
                  )}
                </div>
                <div className="scan-timestamp">⏰ {formatTimestamp(scan.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="qr-display">{activeTab === 'scan' ? renderScanTab() : renderHistoryTab()}</div>
  )
}

export default QRDisplay
