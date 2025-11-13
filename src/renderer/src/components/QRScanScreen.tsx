import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { VersionDisplay } from './VersionDisplay'

interface ApiKey {
  id: number
  name: string
  value: string
  created_at: string
}

interface QRScanScreenProps {
  apiKey: ApiKey
  onRegistrationStarted: () => void
  onRegistrationSuccess: (firstName: string, lastName: string) => void
  onRegistrationError: (error: string) => void
}

export function QRScanScreen({
  apiKey,
  onRegistrationStarted,
  onRegistrationSuccess,
  onRegistrationError
}: QRScanScreenProps): React.JSX.Element {

  const handleQRScanned = async (qrData: string) => {
    console.log('QR Code scanned:', qrData)
    
    // Validate that the QR data is an HTTPS URL
    try {
      const url = new URL(qrData.trim())
      if (!url.protocol.startsWith('https:')) {
        onRegistrationError('Only HTTPS URLs are allowed')
        return
      }
    } catch {
      onRegistrationError('Invalid QR code URL format')
      return
    }

    onRegistrationStarted()

    try {
      const response = await fetch(qrData.trim(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.value}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Extract firstName and lastName from the participant object
      if (!data.participant || !data.participant.firstName || !data.participant.lastName) {
        throw new Error('Response missing required fields: participant.firstName and participant.lastName')
      }

      onRegistrationSuccess(data.participant.firstName, data.participant.lastName)
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      onRegistrationError(errorMessage)
    }
  }

  useEffect(() => {
    // Set up QR scanner listener
    if (window.api?.scanner) {
      window.api.scanner.onQRScanned(handleQRScanned)
    }

    // Cleanup function to remove listener when component unmounts
    return () => {
      if (window.api?.scanner) {
        window.api.scanner.removeQRListener()
      }
    }
  }, [apiKey])

  return (
    <>
      <div className="w-full max-w-sm space-y-3">
        {/* QR Scanner Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-base">QR Scanner</CardTitle>
            <CardDescription className="text-xs">
              Ready to scan. Position QR code in front of scanner.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-4 px-4">
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div className="text-muted-foreground">
                <p className="text-sm font-medium">Waiting for QR code...</p>
                <p className="text-xs">Scanner will process automatically</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Test Buttons */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="border-0 shadow-sm bg-yellow-50">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-base text-yellow-800">Development Tools</CardTitle>
              <CardDescription className="text-xs text-yellow-600">
                Test buttons for development only
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 px-4 pb-4">
              <Button 
                onClick={() => onRegistrationSuccess('John', 'Doe')}
                className="w-full h-8 text-sm bg-green-600 hover:bg-green-700"
              >
                Test Success Scan
              </Button>
              <Button 
                onClick={() => onRegistrationError('Test error: Network connection failed')}
                variant="destructive"
                className="w-full h-8 text-sm"
              >
                Test Fail Scan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <VersionDisplay />
    </>
  )
}