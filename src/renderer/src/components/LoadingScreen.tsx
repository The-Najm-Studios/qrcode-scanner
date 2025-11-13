import { Loader2 } from 'lucide-react'
import { VersionDisplay } from './VersionDisplay'

export function LoadingScreen(): React.JSX.Element {
  return (
    <div className="fixed inset-0 bg-black z-40 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-white" />
      <VersionDisplay />
    </div>
  )
}