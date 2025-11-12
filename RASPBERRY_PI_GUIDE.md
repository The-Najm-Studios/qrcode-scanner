# QR Code Scanner - Raspberry Pi Setup & Auto-Updates

This guide covers building, installing, and auto-updating the QR Code Scanner app specifically for Raspberry Pi OS (ARM64).

## 🍓 Raspberry Pi Configuration

### Target Platform

- **OS**: Raspberry Pi OS (64-bit)
- **Architecture**: ARM64 (aarch64)
- **Formats**:
  - `.deb` package (recommended for Pi OS)
  - `.AppImage` (portable)

### Hardware Requirements

- Raspberry Pi 4 or newer
- At least 4GB RAM recommended
- Camera module or USB webcam for QR scanning

## 🏗️ Building for Raspberry Pi

### Local Build Commands

```bash
# Build specifically for Raspberry Pi (ARM64)
npm run build:rpi

# Build and publish to GitHub Releases
npm run build:publish:rpi
```

### Cross-Platform Building

If building from macOS/Windows for Raspberry Pi:

```bash
# Install cross-compilation tools (if needed)
npm install --save-dev electron-builder

# Build ARM64 Linux binaries
npm run build:rpi
```

## 📦 Installation on Raspberry Pi

### Method 1: .deb Package (Recommended)

```bash
# Download from GitHub Releases
wget https://github.com/The-Najm-Studios/qrcode-scanner/releases/latest/download/qrcode-scanner-1.0.0-arm64.deb

# Install
sudo dpkg -i qrcode-scanner-1.0.0-arm64.deb

# Fix dependencies if needed
sudo apt-get install -f
```

### Method 2: AppImage

```bash
# Download AppImage
wget https://github.com/The-Najm-Studios/qrcode-scanner/releases/latest/download/qrcode-scanner-1.0.0-arm64.AppImage

# Make executable
chmod +x qrcode-scanner-1.0.0-arm64.AppImage

# Run
./qrcode-scanner-1.0.0-arm64.AppImage
```

## 🔄 Auto-Updates Setup

### How It Works

The app is configured to automatically check for updates from GitHub Releases:

- **Repository**: `The-Najm-Studios/qrcode-scanner`
- **Update Check**: Automatic on startup (production builds)
- **Manual Check**: "Check for Updates" button in UI
- **Download**: Background download with progress indication
- **Install**: User prompted to restart and install

### Testing Updates

1. **Lower the version** in `package.json`:

   ```json
   {
     "version": "0.9.0"
   }
   ```

2. **Build and install** on Pi:

   ```bash
   npm run build:rpi
   # Transfer and install on Pi
   ```

3. **Release newer version** (1.0.0):

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   # GitHub Actions will build and release
   ```

4. **App should detect update** automatically

## 🚀 Automated Releases with GitHub Actions

### Workflow Configuration

The `.github/workflows/release.yml` handles:

- Automatic builds on version tags
- Cross-compilation for ARM64
- Publishing to GitHub Releases

### Creating a Release

```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Push tag to trigger release
git push origin main
git push origin --tags

# 3. GitHub Actions builds and releases automatically
```

### Manual Release Trigger

You can also trigger releases manually from GitHub Actions tab.

## 🔧 Raspberry Pi Specific Optimizations

### Performance Tips

1. **GPU Memory**: Increase GPU memory split

   ```bash
   sudo raspi-config
   # Advanced Options > Memory Split > 128
   ```

2. **Electron Flags**: Add to launch script
   ```bash
   qrcode-scanner --disable-gpu-sandbox --disable-software-rasterizer
   ```

### Camera Permissions

Ensure camera access:

```bash
# Add user to video group
sudo usermod -a -G video $USER

# Reboot required
sudo reboot
```

### Desktop Integration

The .deb package automatically:

- Creates desktop entry
- Adds to applications menu
- Sets up file associations

## 🛠️ Development on Pi

### Setting up Development Environment

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup project
git clone https://github.com/The-Najm-Studios/qrcode-scanner.git
cd qrcode-scanner
npm install

# Development mode
npm run dev
```

### Building Locally on Pi

```bash
# Install build dependencies
sudo apt-get update
sudo apt-get install -y build-essential libnss3-dev libgtk-3-dev libxss1 libasound2-dev

# Build
npm run build:rpi
```

## 📋 Troubleshooting

### Common Issues

1. **"Permission denied" for camera**

   ```bash
   sudo usermod -a -G video $USER
   # Logout and login again
   ```

2. **App won't start**

   ```bash
   # Check dependencies
   ldd /opt/qrcode-scanner/qrcode-scanner

   # Install missing libraries
   sudo apt-get install libgtk-3-0 libgconf-2-4
   ```

3. **Update check fails**
   - Ensure internet connectivity
   - Check GitHub API rate limits
   - Verify repository access

### Performance Issues

```bash
# Increase swap if needed
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Set CONF_SWAPSIZE=1024
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

## 📊 Update Artifacts

Each release creates:

- `qrcode-scanner-X.X.X-arm64.deb` - Debian package
- `qrcode-scanner-X.X.X-arm64.AppImage` - Portable executable
- `latest-linux-arm64.yml` - Update metadata

The auto-updater uses this metadata to determine available updates and download the appropriate package format.

## 🎯 Next Steps

1. **Test the build process**: `npm run build:rpi`
2. **Create your first release**: Tag and push to trigger GitHub Actions
3. **Install on a Pi**: Test the installation and auto-update flow
4. **Configure camera**: Ensure QR scanning works properly

Your Raspberry Pi QR Code Scanner with auto-updates is ready to deploy! 🚀
