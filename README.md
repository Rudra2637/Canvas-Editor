# 🎨 2D Canvas Editor

A lightweight, web-based 2D vector canvas editor where anyone can create, edit, customize shapes/text/drawings, and persist canvases in real-time to **Firebase Firestore** with shareable URL sessions.

Built with **React**, **Fabric.js**, and **Google Cloud Firestore**.

---

## ✨ Features

### 1. 🖌️ Interactive 2D Canvas
- **Tactile Tool Dock**: Floating bottom-center toolbar with unambiguous active states.
- **Vector Shapes**: Add and customize **Rectangles** and **Circles**.
- **Editable Text**: Add text (`IText`) with inline double-click editing.
- **Freehand Pen Tool**: Smooth vector brush with adjustable stroke width (1–24px) and color swatches.
- **Object Manipulation**: Move, scale/resize, rotate, and delete objects using interactive bounding box handles.
- **Undo / Redo History**: Full in-memory history stack (`Ctrl+Z`, `Ctrl+Y`).

### 2. 🎛️ Contextual Properties Inspector
- **Zero-Clutter UI**: The properties panel is completely hidden when nothing is selected.
- **Contextual Popover**: When an object is clicked, an inspector appears to customize:
  - **Fill Color & Border Color** (presets + native custom color picker)
  - **Border Thickness** (slider)
  - **Opacity** (10%–100%)
  - **Typography** (font size, bold, italic, text alignment for text objects)

### 3. ☁️ Firebase Firestore Persistence & Real-Time Auto-Save
- **Shareable URL Sessions**: Every canvas has a unique URL `/canvas/:canvasId` that fetches and reconstructs the scene from Firestore.
- **Intelligent Auto-Save**: Debounces and saves changes ~1.5s after editing stops without interrupting the drawing flow.
- **Live Sync Badge**: Real-time status indicator (`Saved`, `Saving...`, `Unsaved`).
- **1-Click Share**: Copy the canvas link directly to your clipboard.

### 4. 🚀 Workspace Launcher (Home Page)
- Clean, distraction-free utility launcher.
- **"New Canvas" Action**: Instantly provisions a new canvas document.
- **Recent Canvases Grid**: Displays saved canvases with preview thumbnails, last updated timestamps, and quick deletion.

---

## 🛠️ Tech Stack

- **Frontend**: [React](https://react.dev/) + [Vite](https://vite.dev/)
- **Canvas Engine**: [Fabric.js](http://fabricjs.com/) (v7)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (Web SDK v12)
- **Routing**: [React Router](https://reactrouter.com/) (v7)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Design System
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🌟 Special Mentions & Engineering Highlights

1. **Storage Adapter Pattern**:
   - `canvasService` decouples Firestore from the UI using a unified storage adapter interface (`FirestoreAdapter` & `LocalStorageAdapter`).
   - Includes automatic timeout protection and fallback if offline.

2. **Creation Idempotency**:
   - Canvas creation is guarded with idempotency tokens to prevent duplicate document generation in Firestore from rapid double-clicks.

3. **Canvas-as-the-Hero Design**:
   - Clean, neutral workspace (`#ffffff` canvas on `#f3f4f6`) that lets user creations take center stage.
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
git clone <your-repo-url>
cd canvas
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

---

## 📦 Deployment

This app can be deployed with zero-configuration to:
- **Vercel**: Import repository -> set environment variables -> deploy.
- **Firebase Hosting**: Run `firebase init hosting` and `firebase deploy`.
- **Netlify**: Connect repository and set build command to `npm run build` with publish directory `dist`.
