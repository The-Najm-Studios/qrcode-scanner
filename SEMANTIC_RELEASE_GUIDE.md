# Semantic Release Guide

This project uses **semantic-release** to automatically create version tags and releases based on commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## 🔄 How It Works

### Automatic Release Process

1. **Push to main/master** → Triggers semantic-release workflow
2. **Analyzes commit messages** → Determines version bump type
3. **Creates git tag** → Based on semantic versioning
4. **Generates changelog** → From commit messages
5. **Builds and publishes** → Raspberry Pi packages to GitHub Releases

## 📝 Commit Message Format

Use this format for your commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Commit Types

| Type       | Description             | Version Bump              | Example                           |
| ---------- | ----------------------- | ------------------------- | --------------------------------- |
| `feat`     | New feature             | **Minor** (1.0.0 → 1.1.0) | `feat: add QR code scanning`      |
| `fix`      | Bug fix                 | **Patch** (1.0.0 → 1.0.1) | `fix: camera permission issue`    |
| `perf`     | Performance improvement | **Patch**                 | `perf: optimize QR detection`     |
| `refactor` | Code refactoring        | **Patch**                 | `refactor: improve camera module` |
| `revert`   | Revert previous change  | **Patch**                 | `revert: remove broken feature`   |

### Breaking Changes

Add `BREAKING CHANGE:` in footer for **Major** version bump (1.0.0 → 2.0.0):

```
feat: redesign QR scanning interface

BREAKING CHANGE: Camera API changed, requires new permissions
```

### Non-Release Types

These types don't trigger releases:

- `docs`: Documentation changes
- `style`: Code formatting
- `test`: Adding tests
- `chore`: Build process, dependencies
- `ci`: CI/CD changes
- `build`: Build system changes

## 📋 Examples

### ✅ Good Commit Messages

```bash
# Minor release (new feature)
git commit -m "feat: add auto-focus for better QR scanning"

# Patch release (bug fix)
git commit -m "fix: resolve camera initialization error on Pi 4"

# Patch release (performance)
git commit -m "perf: reduce memory usage during QR processing"

# Major release (breaking change)
git commit -m "feat!: redesign camera interface

BREAKING CHANGE: Camera initialization now requires explicit permissions"

# No release
git commit -m "docs: update installation instructions"
git commit -m "chore: update dependencies"
```

### ❌ Bad Commit Messages

```bash
# Too vague
git commit -m "fix stuff"
git commit -m "update"

# Wrong format
git commit -m "Fixed the camera bug"
git commit -m "Adding new feature"
```

## 🚀 Release Process

### Automatic Releases

1. **Make changes** with proper commit messages
2. **Push to main branch**:
   ```bash
   git add .
   git commit -m "feat: add QR code history feature"
   git push origin main
   ```
3. **Semantic-release runs automatically** and:
   - Analyzes commits since last release
   - Determines version bump
   - Creates tag (e.g., `v1.2.0`)
   - Builds ARM64 packages
   - Publishes to GitHub Releases
   - Updates CHANGELOG.md

### Manual Releases

For emergency releases, use the manual workflow:

1. Go to **GitHub Actions** tab
2. Select **"Manual Release for Raspberry Pi"**
3. Click **"Run workflow"**
4. Enter version (e.g., `v1.0.1`)

## 📊 Version Strategy

| Change Type               | Version Impact  | Example       |
| ------------------------- | --------------- | ------------- |
| `feat`                    | Minor increment | 1.0.0 → 1.1.0 |
| `fix`, `perf`, `refactor` | Patch increment | 1.0.0 → 1.0.1 |
| `BREAKING CHANGE`         | Major increment | 1.0.0 → 2.0.0 |

## 🛠️ Configuration Files

### `.releaserc.json`

- Defines release rules
- Configures changelog generation
- Sets up GitHub releases
- Specifies which files to include

### `semantic-release.yml` Workflow

- Runs on push to main/master
- Analyzes commits
- Creates releases automatically
- Builds and uploads Pi packages

## 🎯 Best Practices

### 1. **Write Clear Commit Messages**

```bash
# Good
feat(camera): add auto-focus support for better QR detection

# Better
feat(camera): implement auto-focus for improved QR code scanning

Adds automatic focusing capability to enhance QR code detection
accuracy, especially useful for small or distant codes.

Closes #123
```

### 2. **Group Related Changes**

```bash
# Instead of multiple commits
fix: typo in button text
fix: button color
fix: button alignment

# Make one commit
fix(ui): improve button styling and text
```

### 3. **Use Scopes for Clarity**

```bash
feat(camera): add zoom functionality
fix(ui): resolve layout issues on small screens
perf(scanner): optimize QR detection algorithm
docs(readme): update installation instructions
```

### 4. **Skip CI When Needed**

```bash
# Skip CI for documentation-only changes
git commit -m "docs: fix typo [skip ci]"
```

## 🔍 Monitoring Releases

### Check Release Status

1. **GitHub Actions** tab shows workflow status
2. **Releases** page shows published versions
3. **CHANGELOG.md** contains version history

### Troubleshooting

- **No release created**: Check commit message format
- **Wrong version bump**: Verify commit type (`feat` vs `fix`)
- **Build fails**: Check workflow logs in Actions tab

## 📱 For Raspberry Pi Users

Your Pi app will automatically detect these semantic releases:

- **Check for updates** on startup
- **Download new versions** when available
- **Install updates** with user confirmation

The semantic versioning ensures users get appropriate update notifications:

- **Major updates**: Significant changes, may require user action
- **Minor updates**: New features, safe to install
- **Patch updates**: Bug fixes, recommended to install

## 🎉 Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Make a change** with proper commit:

   ```bash
   git add .
   git commit -m "feat: add new QR scanning mode"
   git push origin main
   ```

3. **Watch the magic happen**:
   - GitHub Actions runs semantic-release
   - Version tag created automatically
   - Pi packages built and published
   - CHANGELOG updated

Your QR Code Scanner now has automated, semantic versioning! 🚀
