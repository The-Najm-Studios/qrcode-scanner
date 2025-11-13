import { useEffect, useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'

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
    console.log('[QRDisplay] useEffect triggered - setting up scanner')
    console.log('[QRDisplay] window.api exists:', !!window.api)
    console.log('[QRDisplay] window.api.scanner exists:', !!window.api?.scanner)

    checkScannerStatus()

    if (window.api?.scanner) {
      console.log('[QRDisplay] Setting up onQRScanned listener...')
      window.api.scanner.onQRScanned((data: string) => {
        console.log('[QRDisplay] 🎉 QR Code received from IPC:', data)
        console.log('[QRDisplay] 🎉 Data type:', typeof data, 'Length:', data.length)
        console.log('[QRDisplay] 🎉 Current scan history length:', scanHistory.length)

        const newScan: QRScanData = {
          data: data,
          timestamp: new Date()
        }
        console.log('[QRDisplay] 📝 Created new scan object:', newScan)

        setScanHistory((prev) => {
          console.log('[QRDisplay] 📝 Updating scan history, previous length:', prev.length)
          const newHistory = [newScan, ...prev.slice(0, 19)]
          console.log('[QRDisplay] 📝 New scan history length:', newHistory.length)
          return newHistory
        })
        console.log('[QRDisplay] ✅ Scan history update completed')
      })
      setIsListening(true)
      console.log('[QRDisplay] ✅ QR scan listener registered successfully')
    } else {
      console.error('[QRDisplay] ❌ window.api.scanner not available!')
    }

    return () => {
      console.log('[QRDisplay] 🧹 Cleanup - removing QR listeners')
      if (window.api?.scanner) {
        window.api.scanner.removeQRListener()
        setIsListening(false)
        console.log('[QRDisplay] ✅ QR listeners removed successfully')
      }
    }
  }, [])

  const checkScannerStatus = async () => {
    console.log('[QRDisplay] Checking scanner status...')
    if (window.api?.scanner) {
      try {
        console.log('[QRDisplay] Calling window.api.scanner.getStatus()')
        const status = await window.api.scanner.getStatus()
        console.log('[QRDisplay] Scanner status received:', status)
        setScannerStatus(status)
        console.log('[QRDisplay] Scanner status state updated to:', status)
      } catch (error) {
        console.error('[QRDisplay] Failed to check scanner status:', error)
        setScannerStatus(false)
      }
    } else {
      console.error('[QRDisplay] window.api.scanner not available for status check!')
      setScannerStatus(false)
    }
  }

  const reconnectScanner = async () => {
    console.log('[QRDisplay] Reconnect button clicked')
    if (window.api?.scanner) {
      try {
        console.log('[QRDisplay] Attempting to reconnect to GM60 scanner...')
        const result = await window.api.scanner.reconnect()
        console.log('[QRDisplay] Reconnect result:', result)
        setScannerStatus(result.connected)
        console.log('[QRDisplay] Scanner status updated to:', result.connected)

        if (result.success) {
          console.log('[QRDisplay] ✅ Scanner reconnection successful')
        } else {
          console.warn('[QRDisplay] ❌ Scanner reconnection failed:', result.error)
        }
      } catch (error) {
        console.error('[QRDisplay] Failed to reconnect scanner:', error)
        setScannerStatus(false)
      }
    } else {
      console.error('[QRDisplay] window.api.scanner not available for reconnect!')
    }
  }

  const openLink = (url: string) => {
    try {
      const parsedUrl = new URL(url)
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
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
    <div className="flex flex-col gap-2 p-2 h-full">
      <Card className="p-2 border-l-4 border-l-primary">
        <div className="space-y-1">
          <h2 className="text-[11px] font-semibold text-foreground">📱 GM60 Scanner</h2>
          <div className="flex items-center gap-1">
            <div
              className={`w-1.5 h-1.5 rounded-full ${scannerStatus ? 'bg-green-500' : 'bg-red-500'}`}
            ></div>
            <span className={`text-[9px] ${scannerStatus ? 'text-green-600' : 'text-red-600'}`}>
              {scannerStatus ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="text-[9px] text-muted-foreground">
            {isListening ? '🎧 Listening...' : '❌ Not listening'}
          </div>
          <Button onClick={reconnectScanner} size="sm" className="h-5 px-2 text-[8px] mt-1">
            🔄 {scannerStatus ? 'Refresh' : 'Reconnect'}
          </Button>
        </div>
      </Card>

      {scanHistory.length > 0 && (
        <Card className="p-2 bg-green-50 border-green-200">
          <h3 className="text-[10px] font-semibold text-green-700 mb-1">🔍 Latest Scan</h3>
          <div className="space-y-0.5">
            <div className="text-[9px] overflow-hidden text-ellipsis whitespace-nowrap">
              {isValidUrl(scanHistory[0].data) ? (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    openLink(scanHistory[0].data)
                  }}
                  className="text-blue-600 hover:underline"
                >
                  🔗 {scanHistory[0].data}
                </a>
              ) : (
                <span className="text-gray-800">📝 {scanHistory[0].data}</span>
              )}
            </div>
            <div className="text-[7px] text-muted-foreground">
              ⏰ {formatTimestamp(scanHistory[0].timestamp)}
            </div>
          </div>
        </Card>
      )}

      <Card className="flex-1 p-2 border-l-4 border-l-blue-500 overflow-hidden">
        <h3 className="text-[10px] font-semibold text-blue-600 mb-1">📋 Instructions</h3>
        <ul className="text-[8px] space-y-0.5 text-foreground">
          <li>• 🔌 GM60 hardwired to UART</li>
          <li>• 📷 Point at QR code to scan</li>
          <li>• ✨ Data appears automatically</li>
          {!scannerStatus && <li>• ⚠️ Try "Reconnect" if disconnected</li>}
        </ul>
      </Card>
    </div>
  )

  const renderHistoryTab = () => (
    <div className="flex flex-col h-full p-2">
      <div className="flex justify-between items-center pb-1 border-b border-border mb-2">
        <h3 className="text-[11px] font-semibold text-foreground">📋 Scan History</h3>
        {scanHistory.length > 0 && (
          <Button
            onClick={clearHistory}
            variant="destructive"
            size="sm"
            className="h-5 px-2 text-[7px]"
          >
            🗑️ Clear
          </Button>
        )}
      </div>

      {scanHistory.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
          <div className="space-y-1">
            <p className="text-[10px]">🔍 No QR codes scanned yet</p>
            <p className="text-[8px]">Switch to "Scan" tab to start!</p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {scanHistory.map((scan, index) => (
              <Card key={index} className="p-2 hover:bg-muted/50 transition-colors">
                <div className="space-y-0.5">
                  <div className="text-[9px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {isValidUrl(scan.data) ? (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          openLink(scan.data)
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        🔗 {scan.data}
                      </a>
                    ) : (
                      <span className="text-foreground">📝 {scan.data}</span>
                    )}
                  </div>
                  <div className="text-[7px] text-muted-foreground">
                    ⏰ {formatTimestamp(scan.timestamp)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )

  return (
    <div className="h-full w-full">
      {activeTab === 'scan' ? renderScanTab() : renderHistoryTab()}
    </div>
  )
}

export default QRDisplay
