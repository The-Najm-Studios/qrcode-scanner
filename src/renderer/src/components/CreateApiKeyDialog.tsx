import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

interface CreateApiKeyDialogProps {
  onApiKeyCreated: (apiKey: { id: number; name: string; value: string; created_at: string }) => void
}

export function CreateApiKeyDialog({ onApiKeyCreated }: CreateApiKeyDialogProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !value.trim()) {
      setError('Please fill in both fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const newApiKey = await window.api.apiKeys.create(name.trim(), value.trim())
      onApiKeyCreated(newApiKey)
      setIsOpen(false)
      setName('')
      setValue('')
    } catch (error) {
      console.error('Failed to create API key:', error)
      setError('Failed to create API key. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!isLoading) {
      setIsOpen(open)
      if (!open) {
        setName('')
        setValue('')
        setError('')
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-8 text-sm">
          Create New API Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[320px] w-[90vw]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base">Create New API Key</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new API key to use for QR code registrations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid gap-1">
              <Label htmlFor="name" className="text-xs">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Production Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="h-8 text-sm"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="value" className="text-xs">API Key</Label>
              <Input
                id="value"
                type="text"
                placeholder="Your API key value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={isLoading}
                className="h-8 text-sm"
              />
            </div>
            {error && (
              <div className="text-xs text-destructive">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="h-8 text-sm">
              {isLoading ? 'Creating...' : 'Create API Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}