# GM60 QR Scanner Setup Guide

This guide explains how to set up and use the GM60 QR code scanner with your Raspberry Pi QR Code Scanner application.

## 🔌 Hardware Connection

### GM60 Scanner Wiring

Connect your GM60 scanner to the Raspberry Pi UART pins:

| GM60 Pin | Raspberry Pi Pin      | Description       |
| -------- | --------------------- | ----------------- |
| VCC      | Pin 2 (5V)            | Power supply      |
| GND      | Pin 6 (Ground)        | Ground connection |
| TX       | Pin 10 (GPIO 15, RXD) | Data transmission |
| RX       | Pin 8 (GPIO 14, TXD)  | Data reception    |

### Wiring Diagram

```
GM60 Scanner     Raspberry Pi
┌─────────┐     ┌─────────────┐
│   VCC   │────▶│ Pin 2 (5V)  │
│   GND   │────▶│ Pin 6 (GND) │
│   TX    │────▶│ Pin 10 (RX) │
│   RX    │────▶│ Pin 8 (TX)  │
└─────────┘     └─────────────┘
```

## ⚙️ Raspberry Pi Configuration

### 1. Enable UART

Edit the Raspberry Pi configuration:

```bash
sudo nano /boot/config.txt
```

Add or uncomment these lines:

```
enable_uart=1
dtparam=uart0=on
```

### 2. Disable Console on UART

Edit the command line configuration:

```bash
sudo nano /boot/cmdline.txt
```

Remove `console=serial0,115200` if present.

### 3. Disable Bluetooth (Optional)

To free up the primary UART for your scanner:

```bash
sudo nano /boot/config.txt
```

Add:

```
dtoverlay=disable-bt
```

### 4. Reboot

```bash
sudo reboot
```

### 5. Verify UART Devices

Check available serial devices:

```bash
ls -la /dev/tty*
ls -la /dev/serial*
```

You should see:

- `/dev/ttyAMA0` or `/dev/serial0` (Primary UART)
- `/dev/ttyS0` or `/dev/serial1` (Secondary UART)

## 🔧 GM60 Scanner Configuration

### Default Settings

The GM60 scanner typically comes with these default settings:

- **Baud Rate**: 9600
- **Data Bits**: 8
- **Stop Bits**: 1
- **Parity**: None
- **Flow Control**: None

### Testing the Connection

You can test the scanner connection using screen:

```bash
sudo apt-get install screen
screen /dev/ttyAMA0 9600
```

Scan a QR code - you should see the data appear in the terminal.
Exit screen with `Ctrl+A` then `\` then `y`.

## 📱 Application Usage

### Starting the App

1. **Launch** the QR Code Scanner application
2. **Check Status**: The app will show scanner connection status
3. **Ready to Scan**: When connected, the app will listen for QR codes

### Scanning QR Codes

1. **Point Scanner**: Aim the GM60 at a QR code
2. **Automatic Detection**: The scanner will beep and send data
3. **Display**: Scanned data appears immediately in the app
4. **Links**: URLs are clickable and open in browser
5. **History**: Last 20 scans are saved in the history list

### Features

- **Real-time Display**: Instant QR code data display
- **URL Detection**: Automatic link recognition and opening
- **Scan History**: View recent scans with timestamps
- **Connection Status**: Monitor scanner connectivity
- **Auto-reconnect**: Attempts to reconnect if connection lost

## 🛠️ Troubleshooting

### Scanner Not Detected

1. **Check Wiring**: Verify all connections are secure
2. **Check Permissions**:
   ```bash
   sudo usermod -a -G dialout $USER
   # Logout and login again
   ```
3. **Check UART**: Verify UART is enabled in `/boot/config.txt`
4. **Check Devices**: Ensure `/dev/ttyAMA0` exists and is accessible

### Scanner Connected but No Data

1. **Test with Screen**: Use screen to verify data transmission
2. **Check Baud Rate**: Ensure it matches (default 9600)
3. **Check Scanner Settings**: Some GM60 scanners need configuration
4. **Restart App**: Close and reopen the application

### Permission Errors

```bash
# Add user to dialout group
sudo usermod -a -G dialout $USER

# Or run with sudo (not recommended for regular use)
sudo your-app-command
```

### Common Issues

**Issue**: `Error: Cannot find module 'serialport'`
**Solution**:

```bash
cd /path/to/app
npm install serialport @serialport/parser-readline
```

**Issue**: `EACCES: permission denied, open '/dev/ttyAMA0'`
**Solution**:

```bash
sudo chmod 666 /dev/ttyAMA0
# Or add user to dialout group (permanent)
sudo usermod -a -G dialout $USER
```

**Issue**: Scanner beeps but no data in app
**Solution**:

- Check if another process is using the serial port
- Restart the application
- Verify wiring connections

## 🔍 Advanced Configuration

### Changing Scanner Settings

Some GM60 scanners support configuration commands. You can send commands through the app's console or modify the scanner service.

Common commands (if supported):

- Reset to defaults
- Change baud rate
- Enable/disable beeper
- Set scan mode

### Multiple Scanners

To use multiple GM60 scanners:

1. Connect to different UART ports
2. Modify the scanner service to handle multiple ports
3. Update the application to distinguish between scanners

### Custom Serial Settings

If your GM60 has different settings, modify `src/main/gm60-scanner.ts`:

```typescript
this.port = new SerialPort({
  path: portPath,
  baudRate: 9600, // Change if needed
  dataBits: 8, // Change if needed
  stopBits: 1, // Change if needed
  parity: 'none' // Change if needed
})
```

## 🎯 Performance Tips

1. **Clean Codes**: Ensure QR codes are clean and well-lit
2. **Distance**: Keep scanner 2-10cm from QR codes
3. **Angle**: Hold scanner perpendicular to the code
4. **Lighting**: Ensure adequate lighting for scanning
5. **Regular Restart**: Restart the app if you notice slowdowns

Your GM60 QR scanner is now ready to use with the Raspberry Pi application! 🎉
