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
      // For hardwired GM60, prioritize known UART paths
      const possiblePaths = [
        '/dev/serial0', // Primary UART symlink (recommended for hardwired)
        '/dev/ttyAMA0', // Primary UART on Pi 4/5
        '/dev/ttyS0', // Mini UART (Pi 3/Zero)
        '/dev/serial1' // Secondary UART symlink
      ]

      let portPath: string | null = null

      // Try to find available port - but don't rely solely on SerialPort.list()
      try {
        const { SerialPort } = await import('serialport')
        const ports = await SerialPort.list()

        for (const path of possiblePaths) {
          const exists = ports.some((port) => port.path === path)
          if (exists) {
            portPath = path
            break
          }
        }
      } catch (listError) {
        console.warn('Could not list serial ports:', listError)
      }

      if (!portPath) {
        // For hardwired connections, try the most likely path
        portPath = possiblePaths[0]
        console.log(`Using default UART path for hardwired GM60: ${portPath}`)
      }

      console.log(`Attempting to connect to GM60 scanner on ${portPath}`)

      await this.connectToPort(portPath)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to initialize GM60 scanner:', errorMessage)
      // Don't throw here - allow the app to continue and show disconnected state
    }
  }

  private async connectToPort(portPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.port = new SerialPort({
        path: portPath,
        baudRate: 9600, // Standard GM60 baud rate
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        // Add flow control settings for hardware UART
        rtscts: false,
        xon: false,
        xoff: false
      })

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

      this.port.on('open', () => {
        console.log('GM60 Scanner connected successfully')
        resolve()
      })

      this.port.on('error', (err) => {
        console.error('Serial port error:', err.message)

        if (err.message.includes('No such file or directory')) {
          console.warn('UART device not found. For hardwired GM60:')
          console.warn('1. Enable UART: sudo raspi-config -> Interface Options -> Serial')
          console.warn('2. Disable console: Login shell over serial = NO')
          console.warn('3. Enable hardware: Serial port hardware = YES')
          console.warn('4. Add to /boot/config.txt: enable_uart=1')
          console.warn('5. Reboot the system')
        } else if (err.message.includes('Permission denied')) {
          console.warn('Permission denied. Add user to dialout group:')
          console.warn('sudo usermod -a -G dialout $USER')
          console.warn('Then logout and login again')
        }

        // Don't reject immediately - the port might still work for scanning
      })

      this.parser.on('data', (data) => {
        const scannedData = data.toString().trim()
        if (scannedData && this.onDataCallback) {
          console.log('QR Code scanned:', scannedData)
          this.onDataCallback(scannedData)
        }
      })

      // Set a timeout for connection
      setTimeout(() => {
        if (!this.port?.isOpen) {
          reject(new Error(`Failed to connect to ${portPath} within timeout`))
        }
      }, 2000)
    })
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

  // Retry connection to scanner
  public async reconnect(): Promise<boolean> {
    try {
      if (this.port && this.port.isOpen) {
        await this.disconnect()
      }

      await this.initializeScanner()

      // Wait a bit and check if connection succeeded
      await new Promise((resolve) => setTimeout(resolve, 500))
      return this.isConnected()
    } catch (error) {
      console.error('Failed to reconnect to GM60 scanner:', error)
      return false
    }
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
