## 1. Project Overview

- This is a **cross-platform Electron application**.
- Targets:
  - **Windows**
  - **macOS**
  - **Linux** (including **Raspberry Pi** / ARM boards)
- The project uses **electron-vite** as the build tooling for:
  - Electron **main** process
  - Electron **preload** scripts
  - Renderer (web UI)
- The renderer is a SPA using:
  - **shadcn/ui** components
  - **Tailwind CSS** for styling

When making suggestions, favor solutions that:
- Work on **all three platforms** (Windows, macOS, Linux).
- Do **not rely on OS-specific features** unless clearly guarded and justified.
- Do **not require native Node addons** unless absolutely necessary.

---

## 2. Tech Stack & Defaults

Copilot, assume the following by default:

- **Language**
  - Prefer **TypeScript** for all new files.
- **Framework / Libraries**
  - Electron (main & preload)
  - React for the renderer
  - shadcn/ui + Tailwind CSS
- **Tooling**
  - Bundled with **electron-vite**
  - Node.js APIs exposed through the preload bridge only

---

## 3. High-Level Architecture

### Main Process
- Creates/manages windows.
- Handles app lifecycle.
- Registers IPC handlers.
- Performs OS-level operations.

### Preload Scripts
- Provide secure, typed APIs to the renderer.
- Use `contextBridge` and `ipcRenderer`.
- Avoid exposing full Node APIs.

### Renderer UI
- React SPA
- UI logic only—no Node/Electron usage directly.
- Uses Tailwind + shadcn/ui.

---

## 4. File & Folder Conventions

Recommended structure:

- `electron/`
  - `main/`
  - `preload/`
- `src/`
  - `components/`
  - `pages/`
  - `hooks/`
  - `lib/` or `utils/`
  - `styles/`

Naming:
- Components: `PascalCase`
- Hooks: `useSomething.ts`
- Utilities: `camelCase`

---

## 5. Electron-Specific Guidelines

### IPC
- Use clear channel names.
- Centralize register handlers.
- Type request/response Payloads.

### Security
- Use `contextIsolation: true`.
- Use preload APIs, not `nodeIntegration`.
- No direct Node usage in React.

### Cross-Platform Behavior
- Never assume OS-specific paths.
- Rely on `path`, `os`, built-ins.
- Guard platform-specific logic with `process.platform`.

### Raspberry Pi / ARM
- Prefer pure JS/TS packages.
- Avoid CPU-heavy tasks or native modules.

---

## 6. UI Guidelines (shadcn/ui + Tailwind)

When generating UI code:

- Use shadcn/ui for components (buttons, dialogs, menus, forms).
- **IMPORTANT**: When adding shadcn/ui components, always use the shadcn CLI tool:
  - Run `npx shadcn@latest add <component-name>` to install components
  - Do NOT manually create shadcn/ui component files
  - Examples: `npx shadcn@latest add button`, `npx shadcn@latest add card`
- Use Tailwind for layout, spacing, and design.
- Keep classnames clean and readable.
- Reuse layout components.
- Prefer controlled inputs and predictable state management.

---

## 7. TypeScript & Code Style

Copilot should:

- Use TypeScript everywhere.
- Use ES modules (`import`, `export`).
- Match existing formatting styles.
- Prefer explicit types where appropriate.
- Keep code simple, readable, maintainable.

---

## 8. What Copilot Should Avoid

Copilot should **not**:

- Introduce new frameworks/build tools without context.
- Suggest deprecated Electron patterns (e.g., `remote`).
- Expose unsafe APIs to the renderer.
- Make OS-specific assumptions.
- Add heavy dependencies that break ARM/Raspberry Pi support.

---

## 9. Example Behaviors for Copilot

### Creating a new UI component
- Place under `src/components/`
- Use React + shadcn/ui + Tailwind
- Provide strong types
- Keep layout consistent

### Adding a new Electron feature
- Add IPC in the main process
- Expose it via preload
- Call it from the renderer using the exposed API

### Handling OS/File logic
- Implement in main or preload
- Keep renderer clean and sandboxed

---

Copilot, always try to:
1. Follow this architecture.
2. Keep everything cross-platform.
3. Use shadcn/ui and Tailwind consistently.
4. Prefer TypeScript and type safety.