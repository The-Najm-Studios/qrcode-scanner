import { useState, useEffect } from 'react'
import { ApiKeySelection } from './components/ApiKeySelection'
import { QRScanScreen } from './components/QRScanScreen'
import { SuccessScreen, ErrorScreen } from './components/ResultScreens'
import { LoadingScreen } from './components/LoadingScreen'
import UpdateNotification from './components/UpdateNotification'

type AppState = 'api-selection' | 'qr-scan' | 'loading' | 'success' | 'error'

interface ApiKey {
  id: number
  name: string
  value: string
  created_at: string
}

function App(): React.JSX.Element {
  const [currentState, setCurrentState] = useState<AppState>('api-selection')
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null)
  const [registrationResult, setRegistrationResult] = useState<{
    firstName?: string
    lastName?: string
    error?: string
  }>({})

  const handleApiKeySelected = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey)
    setCurrentState('qr-scan')
  }

  const handleRegistrationStarted = () => {
    setCurrentState('loading')
  }

  const handleRegistrationSuccess = (firstName: string, lastName: string) => {
    setRegistrationResult({ firstName, lastName })
    setCurrentState('success')
  }

  const handleRegistrationError = (error: string) => {
    setRegistrationResult({ error })
    console.log(error)
    setCurrentState('error')
  }

  // Auto-redirect from success/error page to scan page after 2 seconds
  useEffect(() => {
    if (currentState === 'success' || currentState === 'error') {
      const timer = setTimeout(() => {
        setRegistrationResult({})
        setCurrentState('qr-scan')
      }, 2000) // 2 seconds

      return () => clearTimeout(timer)
    }

    return () => {} // Return empty cleanup function for other states
  }, [currentState])

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background p-2 overflow-hidden">
      <UpdateNotification />

      {currentState === 'api-selection' && (
        <ApiKeySelection onApiKeySelected={handleApiKeySelected} />
      )}

      {currentState === 'qr-scan' && selectedApiKey && (
        <QRScanScreen
          apiKey={selectedApiKey}
          onRegistrationStarted={handleRegistrationStarted}
          onRegistrationSuccess={handleRegistrationSuccess}
          onRegistrationError={handleRegistrationError}
        />
      )}

      {currentState === 'loading' && <LoadingScreen />}

      {currentState === 'success' &&
        registrationResult.firstName &&
        registrationResult.lastName && (
          <SuccessScreen
            firstName={registrationResult.firstName}
            lastName={registrationResult.lastName}
          />
        )}

      {currentState === 'error' && <ErrorScreen />}
    </div>
  )
}

export default App
