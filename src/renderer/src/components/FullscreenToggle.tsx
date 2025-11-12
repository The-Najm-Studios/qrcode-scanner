import { useEffect, useState } from 'react'

const FullscreenToggle = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    // Check initial fullscreen state
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
    <div className="fullscreen-toggle">
      {isFullscreen ? (
        <button onClick={exitFullscreen} className="fullscreen-btn exit" title="Exit Fullscreen">
          🔲
        </button>
      ) : (
        <button onClick={enterFullscreen} className="fullscreen-btn enter" title="Enter Fullscreen">
          ⛶
        </button>
      )}
    </div>
  )
}

export default FullscreenToggle