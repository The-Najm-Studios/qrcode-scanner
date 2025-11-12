import { useEffect, useState } from 'react'
import { Button } from './ui/button'

const FullscreenToggle = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const checkFullscreenState = async () => {
      if (window.api?.window) {
        const fullscreen = await window.api.window.isFullscreen()
        setIsFullscreen(fullscreen)
      }
    }
    checkFullscreenState()
  }, [])

  const enterFullscreen = async () => {
    if (window.api?.window) {
      try {
        await window.api.window.setFullscreen(true)
        setIsFullscreen(true)
      } catch (error) {
        console.error('Failed to enter fullscreen:', error)
      }
    }
  }

  const exitFullscreen = async () => {
    if (window.api?.window) {
      try {
        await window.api.window.setFullscreen(false)
        setIsFullscreen(false)
      } catch (error) {
        console.error('Failed to exit fullscreen:', error)
      }
    }
  }

  return (
    <div className="flex gap-0.5 px-1">
      <Button
        onClick={isFullscreen ? exitFullscreen : enterFullscreen}
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-[8px]"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? '🔲' : '⛶'}
      </Button>
    </div>
  )
}

export default FullscreenToggle
