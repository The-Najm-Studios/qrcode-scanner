import { useState } from 'react'
import UpdateNotification from './components/UpdateNotification'
import QRDisplay from './components/QRDisplay'

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan')

  return (
    <>
      <UpdateNotification />
      <div className="app-container">
        <div className="tab-header">
          <button
            className={`tab-button ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            📷 Scan QR Code
          </button>
          <button
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 History
          </button>
        </div>
        <div className="tab-content">
          <QRDisplay activeTab={activeTab} />
        </div>
      </div>
    </>
  )
}

export default App
