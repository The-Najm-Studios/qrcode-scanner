# Auto-Update Setup Guide

This QR Code Scanner app is now configured for auto-updates using electron-updater. Here's what has been implemented and what you need to do to make it fully functional.

## ✅ What's Already Implemented

### 1. Auto-Update Code

- ✅ `electron-updater` integration in main process
- ✅ IPC communication between main and renderer processes
- ✅ Update notification UI component
- ✅ Progress tracking and error handling
- ✅ Build scripts for publishing updates

### 2. Features Added

- **Automatic Update Checking**: App checks for updates 2 seconds after startup (production only)
- **Manual Update Check**: "Check for Updates" button in the UI
- **Download Progress**: Real-time progress bar during update downloads
- **User Notifications**: Toast notifications for all update states
- **Install Options**: Users can install immediately or later

## 🔧 What You Need to Configure

### 1. Update Server URL

Update the URL in both configuration files to point to your actual update server:

**electron-builder.yml:**

```yaml
publish:
  provider: generic
  url: https://your-domain.com/updates # Change this!
```

**dev-app-update.yml:**

```yaml
provider: generic
url: https://your-domain.com/updates # Change this!
```

### 2. Set Up Update Server

You have several options for hosting updates:

#### Option A: Simple HTTP Server

Host files on any web server with this structure:

```
/updates/
  ├── latest.yml              # Update metadata
  ├── qrcode-scanner-1.0.1.dmg       # Mac installer
  ├── qrcode-scanner-1.0.1-setup.exe # Windows installer
  └── qrcode-scanner-1.0.1.AppImage  # Linux installer
```

#### Option B: GitHub Releases (Recommended)

1. Change provider to `github` in electron-builder.yml:

```yaml
publish:
  provider: github
  owner: your-username
  repo: your-repo-name
```

#### Option C: Cloud Storage (S3, etc.)

```yaml
publish:
  provider: s3
  bucket: your-bucket-name
```

### 3. Publishing Updates

#### Automatic Publishing (Recommended)

```bash
# Build and publish new version
npm run build:publish

# Or platform-specific
npm run build:publish:mac
npm run build:publish:win
npm run build:publish:linux
```

#### Manual Publishing

1. Build without publishing: `npm run build`
2. Upload files manually to your server
3. Update the `latest.yml` file with new version info

### 4. Version Management

When releasing updates:

1. Update version in `package.json`
2. Run `npm run build:publish`
3. The app will automatically detect and offer the update to users

## 🧪 Testing Updates

### Development Testing

1. Set a lower version in `package.json` (e.g., "0.9.0")
2. Build and run the app
3. Set up a test server with version "1.0.0"
4. The app should detect and offer the update

### Using dev-app-update.yml

For testing, you can point to a different URL:

```bash
# Set environment variable
export ELECTRON_IS_DEV=false
npm start
```

## 🔒 Security Considerations

1. **Code Signing**: Always sign your releases for security
2. **HTTPS Only**: Use HTTPS for your update server
3. **Signature Verification**: electron-updater automatically verifies signatures

## 📝 Update Metadata Format

The `latest.yml` file should look like this:

```yaml
version: 1.0.1
files:
  - url: qrcode-scanner-1.0.1.dmg
    sha512: [file-hash]
    size: 95244288
path: qrcode-scanner-1.0.1.dmg
sha512: [file-hash]
releaseDate: '2024-11-12T10:30:00.000Z'
```

## 🚀 CI/CD Integration

For automated releases, you can integrate with GitHub Actions:

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  release:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build:publish
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 🎯 Next Steps

1. **Choose your update hosting method** (GitHub Releases recommended)
2. **Update the URLs** in the config files
3. **Test with a lower version** number
4. **Set up automated publishing** (optional but recommended)
5. **Configure code signing** for production releases

Your app is now ready for seamless auto-updates! 🎉
