import { useState } from 'react'
import UpdateNotification from './components/UpdateNotification'
import QRDisplay from './components/QRDisplay'
import FullscreenToggle from './components/FullscreenToggle'
import { cn } from './lib/utils'

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan')

  return (
    <div className="flex flex-col w-[320px] h-[240px] bg-background">
      <UpdateNotification />
      <div className="flex flex-col flex-1 bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-between items-center h-8 bg-muted border-b border-border shrink-0">
          <div className="flex flex-1">
            <button
              className={cn(
                'flex-1 px-2 py-1.5 text-[10px] font-medium transition-all border-b-2',
                activeTab === 'scan'
                  ? 'bg-background text-primary border-primary'
                  : 'bg-transparent text-muted-foreground border-transparent hover:bg-muted/50'
              )}
              onClick={() => setActiveTab('scan')}
            >
              📷 Scan
            </button>
            <button
              className={cn(
                'flex-1 px-2 py-1.5 text-[10px] font-medium transition-all border-b-2',
                activeTab === 'history'
                  ? 'bg-background text-primary border-primary'
                  : 'bg-transparent text-muted-foreground border-transparent hover:bg-muted/50'
              )}
              onClick={() => setActiveTab('history')}
            >
              📋 History
            </button>
          </div>
          <FullscreenToggle />
        </div>
        <div className="flex-1 overflow-hidden">
          <QRDisplay activeTab={activeTab} />
        </div>
      </div>
    </div>
  )
}

export default App
