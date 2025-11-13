import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

export class GM60Scanner {
  private port: SerialPort | null = null
  private parser: ReadlineParser | null = null
  private onDataCallback: ((data: string) => void) | null = null

  constructor() {
    console.log('[GM60Scanner] Constructor called - initializing scanner...')
    this.initializeScanner()
  }

  private async initializeScanner() {
    console.log('[GM60Scanner] Starting initialization process...')
    try {
      // For hardwired GM60, prioritize known UART paths
      const possiblePaths = [
        '/dev/serial0', // Primary UART symlink (recommended for hardwired)
        '/dev/ttyAMA0', // Primary UART on Pi 4/5
        '/dev/ttyS0', // Mini UART (Pi 3/Zero)
        '/dev/serial1' // Secondary UART symlink
      ]
      console.log('[GM60Scanner] Possible UART paths:', possiblePaths)

      let portPath: string | null = null

      // Try to find available port - but don't rely solely on SerialPort.list()
      try {
        console.log('[GM60Scanner] Attempting to list available serial ports...')
        const { SerialPort } = await import('serialport')
        const ports = await SerialPort.list()
        console.log('[GM60Scanner] Available serial ports:')
        ports.forEach((p, index) => {
          console.log(`  [${index}] Path: ${p.path}`)
          console.log(`      Manufacturer: ${p.manufacturer || 'undefined'}`)
          console.log(`      Product ID: ${p.productId || 'undefined'}`)
          console.log(`      Vendor ID: ${p.vendorId || 'undefined'}`)
        })

        for (const path of possiblePaths) {
          const exists = ports.some((port) => port.path === path)
          console.log(`[GM60Scanner] Checking path ${path}: ${exists ? 'found' : 'not found'}`)
          if (exists) {
            portPath = path
            console.log(`[GM60Scanner] Selected port path: ${portPath}`)
            break
          }
        }
      } catch (listError) {
        console.warn('[GM60Scanner] Could not list serial ports:', listError)
      }

      if (!portPath) {
        // Force primary UART for hardwired GM60 connections
        const primaryPaths = ['/dev/serial0', '/dev/ttyAMA0']
        console.log(
          '[GM60Scanner] No ports found in SerialPort.list(), checking filesystem directly...'
        )

        for (const path of primaryPaths) {
          try {
            const fs = await import('fs')
            if (fs.existsSync(path)) {
              console.log(`[GM60Scanner] ✅ Found ${path} in filesystem`)
              portPath = path
              break
            } else {
              console.log(`[GM60Scanner] ❌ ${path} not found in filesystem`)
            }
          } catch (error) {
            console.log(`[GM60Scanner] Error checking ${path}:`, error)
          }
        }

        if (!portPath) {
          // Fallback to mini UART (but warn about potential issues)
          portPath = '/dev/ttyS0'
          console.warn(
            '[GM60Scanner] ⚠️ Using mini UART /dev/ttyS0 - this may not work reliably with GM60'
          )
          console.warn(
            '[GM60Scanner] ⚠️ Consider switching to primary UART with: sudo raspi-config'
          )
        }
      }

      console.log(`[GM60Scanner] Attempting to connect to GM60 scanner on ${portPath}`)

      await this.connectToPort(portPath)
      console.log('[GM60Scanner] Initialization completed successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[GM60Scanner] Failed to initialize GM60 scanner:', errorMessage)
      // Don't throw here - allow the app to continue and show disconnected state
    }
  }

  private async connectToPort(portPath: string): Promise<void> {
    console.log(`[GM60Scanner] Creating SerialPort connection to ${portPath}...`)
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
      console.log('[GM60Scanner] SerialPort instance created with config:', {
        path: portPath,
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        rtscts: false
      })

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
      console.log('[GM60Scanner] ReadlineParser attached with delimiter: \\r\\n')

      // Buffer to collect chunked data from GM60
      let dataBuffer = ''
      let lastDataTime = 0

      this.port.on('open', () => {
        console.log('[GM60Scanner] ✅ Serial port opened successfully')
        console.log('[GM60Scanner] GM60 Scanner connected successfully')

        // Handle chunked data from GM60
        this.port!.on('data', (rawData) => {
          console.log('[GM60Scanner] 🔍 RAW DATA from GM60:')
          console.log('  📊 Hex:', rawData.toString('hex'))
          console.log('  📝 ASCII:', JSON.stringify(rawData.toString('ascii')))
          console.log('  📏 Length:', rawData.length, 'bytes')
          console.log('  🕐 Timestamp:', new Date().toISOString())

          // Add chunk to buffer
          const chunk = rawData.toString('ascii')
          dataBuffer += chunk
          console.log('  🧩 Buffer now contains:', JSON.stringify(dataBuffer))

          // Set timeout to process complete data when chunks stop arriving
          const now = Date.now()
          lastDataTime = now

          setTimeout(() => {
            // If no new data arrived in 100ms, process the buffered data
            if (lastDataTime === now && dataBuffer.length > 0) {
              console.log(
                '[GM60Scanner] 📝 Processing complete buffered data:',
                JSON.stringify(dataBuffer)
              )
              this.processQRData(dataBuffer.trim())
              dataBuffer = '' // Clear buffer
            }
          }, 100)
        })

        resolve()
      })

      this.port.on('error', (err) => {
        console.error('[GM60Scanner] ❌ Serial port error:', err.message)
        console.error('[GM60Scanner] Full error object:', err)

        if (err.message.includes('No such file or directory')) {
          console.warn('[GM60Scanner] UART device not found. For hardwired GM60:')
          console.warn(
            '[GM60Scanner] 1. Enable UART: sudo raspi-config -> Interface Options -> Serial'
          )
          console.warn('[GM60Scanner] 2. Disable console: Login shell over serial = NO')
          console.warn('[GM60Scanner] 3. Enable hardware: Serial port hardware = YES')
          console.warn('[GM60Scanner] 4. Add to /boot/config.txt: enable_uart=1')
          console.warn('[GM60Scanner] 5. Reboot the system')
        } else if (err.message.includes('Permission denied')) {
          console.warn('[GM60Scanner] Permission denied. Add user to dialout group:')
          console.warn('[GM60Scanner] sudo usermod -a -G dialout $USER')
          console.warn('[GM60Scanner] Then logout and login again')
        }

        // Don't reject immediately - the port might still work for scanning
      })

      this.parser.on('data', (data) => {
        console.log(`[GM60Scanner] 📡 Raw data received from serial port:`, data)
        console.log(`[GM60Scanner] 📡 Data type: ${typeof data}, length: ${data.toString().length}`)
        const scannedData = data.toString().trim()
        console.log(`[GM60Scanner] 📝 Trimmed data: "${scannedData}"`)
        console.log(
          `[GM60Scanner] 🎯 Callback status: ${this.onDataCallback ? 'registered' : 'NOT REGISTERED'}`
        )

        if (scannedData && this.onDataCallback) {
          console.log(
            '[GM60Scanner] � Parser path - Calling onDataCallback with scanned data:',
            scannedData
          )
          console.log(
            '[GM60Scanner] 🔍 Parser callback function:',
            this.onDataCallback.toString().substring(0, 100) + '...'
          )

          try {
            this.onDataCallback(scannedData)
            console.log('[GM60Scanner] ✅ Parser - onDataCallback execution completed')
          } catch (error) {
            console.error('[GM60Scanner] ❌ Parser - Error in onDataCallback:', error)
          }
        } else {
          if (!scannedData) {
            console.warn('[GM60Scanner] ⚠️ No data after trimming - ignoring empty data')
          }
          if (!this.onDataCallback) {
            console.warn('[GM60Scanner] ⚠️ No callback registered - data will be lost!')
          }
        }
      })

      // Set a timeout for connection
      setTimeout(() => {
        if (!this.port?.isOpen) {
          console.error(
            `[GM60Scanner] ⏰ Connection timeout - failed to connect to ${portPath} within 2 seconds`
          )
          reject(new Error(`Failed to connect to ${portPath} within timeout`))
        } else {
          console.log(`[GM60Scanner] ✅ Connection established within timeout window`)
        }
      }, 2000)
    })
  }

  private processQRData(data: string) {
    console.log(`[GM60Scanner] 📡 Processing QR data from buffer:`, JSON.stringify(data))
    console.log(`[GM60Scanner] 📡 Data length:`, data.length)
    console.log(
      `[GM60Scanner] 🎯 Callback status: ${this.onDataCallback ? 'registered' : 'NOT REGISTERED'}`
    )

    if (data && this.onDataCallback) {
      console.log('[GM60Scanner] 🚀 Calling onDataCallback with scanned data:', data)
      console.log(
        '[GM60Scanner] 🔍 Callback function:',
        this.onDataCallback.toString().substring(0, 100) + '...'
      )

      try {
        this.onDataCallback(data)
        console.log('[GM60Scanner] ✅ onDataCallback execution completed')
      } catch (error) {
        console.error('[GM60Scanner] ❌ Error in onDataCallback:', error)
      }
    } else {
      if (!data) {
        console.warn('[GM60Scanner] ⚠️ No data to process - ignoring empty data')
      }
      if (!this.onDataCallback) {
        console.warn('[GM60Scanner] ⚠️ No callback registered - data will be lost!')
      }
    }
  }

  public onScan(callback: (data: string) => void) {
    console.log('[GM60Scanner] 🎯 Registering onScan callback')
    console.log('[GM60Scanner] 🎯 Callback type:', typeof callback)
    console.log('[GM60Scanner] 🎯 Previous callback existed:', !!this.onDataCallback)

    this.onDataCallback = callback

    console.log('[GM60Scanner] ✅ onScan callback registered successfully')
    console.log('[GM60Scanner] 🔍 Callback after assignment:', !!this.onDataCallback)
    console.log('[GM60Scanner] 🔍 Are they the same?', this.onDataCallback === callback)
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
    const connected = this.port ? this.port.isOpen : false
    console.log(`[GM60Scanner] 🔍 Connection status check: ${connected}`)
    return connected
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
