import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

export class GM60Scanner {
  private port: SerialPort | null = null
  private parser: ReadlineParser | null = null
  private onDataCallback: ((data: string) => void) | null = null

  constructor() {
    this.initializeScanner()
  }

  private async initializeScanner() {
    try {
      // Common UART paths on Raspberry Pi
      const possiblePaths = [
        '/dev/ttyAMA0',  // Primary UART on Pi
        '/dev/ttyS0',    // Secondary UART
        '/dev/serial0',  // Symlink to primary UART
        '/dev/serial1'   // Symlink to secondary UART
      ]

      let portPath = null
      
      // Try to find available port
      const { SerialPort } = await import('serialport')
      const ports = await SerialPort.list()
      
      for (const path of possiblePaths) {
        const exists = ports.some(port => port.path === path)
        if (exists) {
          portPath = path
          break
        }
      }

      if (!portPath) {
        // Fallback to first available port or default
        portPath = possiblePaths[0]
        console.warn(`No standard UART found, using default: ${portPath}`)
      }

      console.log(`Attempting to connect to GM60 scanner on ${portPath}`)

      this.port = new SerialPort({
        path: portPath,
        baudRate: 9600,  // Default baud rate for GM60
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      })

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

      this.port.on('open', () => {
        console.log('GM60 Scanner connected successfully')
      })

      this.port.on('error', (err) => {
        console.error('Serial port error:', err.message)
      })

      this.parser.on('data', (data) => {
        const scannedData = data.toString().trim()
        if (scannedData && this.onDataCallback) {
          console.log('QR Code scanned:', scannedData)
          this.onDataCallback(scannedData)
        }
      })

    } catch (error) {
      console.error('Failed to initialize GM60 scanner:', error)
    }
  }

  public onScan(callback: (data: string) => void) {
    this.onDataCallback = callback
  }

  public async disconnect() {
    if (this.port && this.port.isOpen) {
      return new Promise<void>((resolve) => {
        this.port!.close((err) => {
          if (err) {
            console.error('Error closing serial port:', err)
          } else {
            console.log('GM60 scanner disconnected')
          }
          resolve()
        })
      })
    }
  }

  public isConnected(): boolean {
    return this.port ? this.port.isOpen : false
  }

  // Send configuration commands to GM60 if needed
  public async sendCommand(command: string): Promise<void> {
    if (this.port && this.port.isOpen) {
      return new Promise((resolve, reject) => {
        this.port!.write(command + '\r\n', (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    } else {
      throw new Error('Scanner not connected')
    }
  }
}