# 🎨 2D Canvas Editor

A lightweight, web-based 2D vector canvas editor where anyone can create, edit, customize shapes/text/drawings, and persist canvases in real-time to **Firebase Firestore** with shareable URL sessions.

Built with **React**, **Fabric.js**, and **Google Cloud Firestore**.

---

## 🚀 Live Demo & Repository
- **Live Demo**: [https://canvas-editor-rudra.vercel.app](https://canvas-editor-rudra.vercel.app) *(or your deployed Vercel URL)*
- **GitHub Repository**: [https://github.com/Rudra2637/Canvas-Editor](https://github.com/Rudra2637/Canvas-Editor)

---

## ✨ Features & Brief Checklist

### 1. 🏠 Workspace Launcher (Home Page)
- **Minimal Utility Interface**: Clean launcher showing existing canvases and a clear call to action.
- **"New Canvas" Creation**: Instantly provisions a new Firestore document, retrieves the Document ID, and navigates to `/canvas/:canvasId`.
- **Recent Canvases Gallery**: Displays saved canvases with live preview thumbnails, last edited timestamps, and quick deletion.

### 2. 🖌️ 2D Canvas Editor (Fabric.js)
- **Canvas as the Hero**: Dominated by a neutral canvas surface with an ultra-thin 44px top navbar.
- **Tactile Floating Tool Dock**:
  - 🖱️ **Select / Pointer Tool (`V`)**: Move, rotate, scale, and transform shapes with 8-point bounding handles.
  - ⬛ **Rectangle Tool (`R`)**: Vector rectangle shape.
  - ⚪ **Circle Tool (`C`)**: Vector circle shape.
  - 🔤 **Text Tool (`T`)**: Double-clickable editable text (`IText`).
  - ✏️ **Freehand Pen Tool (`P`)**: Vector drawing brush with collapsible stroke thickness (1–24px) and color palette.
- **Object Manipulation**:
  - Move, resize, scale, and rotate objects with real-time coordinate updates.
  - Delete with `Delete` / `Backspace` key or Toolbar button.
  - Full in-memory **Undo (`Ctrl+Z`)** and **Redo (`Ctrl+Y`)** history stack.

### 3. 🎛️ Contextual Properties Inspector
- **Zero-Clutter UI**: The properties panel is completely hidden when nothing is selected.
- **Contextual Popover**: Automatically appears when an object is clicked to customize:
  - **Fill Color & Border Color** (preset swatches + native color picker)
  - **Border Thickness** (continuous 0–16px slider)
  - **Opacity** (continuous 10%–100% slider)
  - **Typography** (font size, bold, italic, text alignment: left/center/right)

### 4. ☁️ Firebase Firestore Persistence & Real-Time Auto-Save
- **Shareable URL Sessions**: Opening `/canvas/:canvasId` fetches and reconstructs the scene from Firestore using the URL parameter.
- **Auto-Save & Manual Save**:
  - Intelligent auto-save engine debounces changes (~1.2s) in the background.
  - Dedicated **Auto-Save ON / OFF toggle switch** in the navbar.
  - **Manual Save button** for immediate on-demand saves.
- **Live Sync Badge**: Real-time cloud status indicator (`Saved`, `Saving...`, `Unsaved`).
- **Instant Title Save**: Renaming the canvas title saves immediately to Firestore.
- **1-Click Share**: Copies the shareable canvas URL to the clipboard.

---

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/) (v19) + [Vite](https://vite.dev/)
- **Canvas Engine**: [Fabric.js](http://fabricjs.com/) (v7)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (Web SDK v12, No Auth Required)
- **Routing**: [React Router](https://reactrouter.com/) (v7)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Inter Typeface
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/) (with `vercel.json` SPA rewrites)

---

## 🌟 Special Mentions & Engineering Highlights

1. **Storage Adapter Pattern**:
   - `canvasService` decouples Firestore from the UI using a unified storage adapter interface (`FirestoreAdapter` & `LocalStorageAdapter`).
   - Includes automatic timeout protection and fallback if offline.

2. **Creation Idempotency**:
   - Canvas creation is guarded with idempotency tokens to prevent duplicate document generation in Firestore from rapid double-clicks.

3. **Unmount Save Flush**:
   - Automatically flushes any pending debounced state to Firestore when navigating back to the Home page, guaranteeing zero data loss.

4. **Canvas-as-the-Hero Design**:
   - Clean, distraction-free neutral workspace that lets user creations take center stage.
   - Replaced heavy sidebars with an ultra-thin 44px top bar and contextual floating cards.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `V` | Select / Pointer Tool |
| `R` | Add Rectangle |
| `C` | Add Circle |
| `T` | Add Text Box |
| `P` | Toggle Pen Tool |
| `Del` / `Backspace` | Delete Selected Object |
| `Ctrl + Z` / `Cmd + Z` | Undo |
| `Ctrl + Y` / `Cmd + Shift + Z` | Redo |

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/Rudra2637/Canvas-Editor.git
cd Canvas-Editor
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Build for Production
```bash
npm run build
```
