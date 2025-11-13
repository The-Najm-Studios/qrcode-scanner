import { useEffect, useState } from 'react'

export function VersionDisplay(): React.JSX.Element {
  const [version, setVersion] = useState<string>('')

  useEffect(() => {
    async function fetchVersion() {
      try {
        const appVersion = await window.api.app.getVersion()
        setVersion(`v${appVersion}`)
      } catch (error) {
        console.error('Failed to fetch app version:', error)
        setVersion('v1.0.0') // Fallback version
      }
    }

    fetchVersion()
  }, [])

  return (
    <div className="fixed bottom-2 right-2 text-xs text-muted-foreground z-50 pointer-events-none select-none">
      {version}
    </div>
  )
}
