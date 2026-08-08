# 🗄️ Employee Document Vault

> A secure, role-based employee document management system built with React + Vite. Designed to simulate an enterprise-grade HR document repository with AWS S3-style upload architecture, version control, and multi-role access control.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Demo Accounts](#demo-accounts)
- [Role-Based Access Control](#role-based-access-control)
- [Pages & Components](#pages--components)
- [Services & API Layer](#services--api-layer)
- [Document Categories](#document-categories)
- [Architecture Notes](#architecture-notes)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Overview

The **Employee Document Vault** is a frontend-only React application that simulates a real-world HR document management system. It demonstrates:

- **Role-based access control (RBAC)** with HR Admin and Employee roles
- **Document versioning** — re-uploading a file with the same name creates a new version
- **Simulated AWS S3 presigned URL upload flow** — a realistic production-style upload pipeline
- **Persistent local storage** as a mock database (no backend required)
- **Responsive enterprise UI** built on Bootstrap 5 with custom theming

---

## Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Mock login system with JWT-style token stored in `localStorage` |
| 👥 **Role-Based Access** | HR Admin (full access) vs. Employee (read-only) |
| 📂 **Document Vault** | Browse, search, filter, sort, download, and delete documents |
| 📤 **File Upload** | Drag-and-drop or file picker with animated upload progress |
| 🕓 **Version History** | Track all versions of a document with uploader and timestamp |
| 🔍 **Search & Filter** | Filter by name, type, tags, and sort by date or category |
| 📊 **Dashboard** | Live stats for total documents, categories, and recent uploads |
| 📱 **Responsive Layout** | Collapsible sidebar + top navbar, works on mobile and desktop |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **HTTP Client** | [Axios](https://axios-http.com/) (pre-configured with auth interceptors) |
| **UI / Styling** | [Bootstrap 5.3](https://getbootstrap.com/) + [Bootstrap Icons](https://icons.getbootstrap.com/) |
| **Storage (Mock DB)** | Browser `localStorage` |
| **Linter** | [OxLint](https://oxc.rs/docs/guide/usage/linter.html) |

---

## Project Structure

```
Employee_Document_Vault_with_Role_based_Access/
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Images, icons
│   ├── components/             # Reusable UI components
│   │   ├── DocumentCard.jsx    # Stat metric card for the Dashboard
│   │   ├── FileTable.jsx       # Documents list table with actions
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   ├── SearchBar.jsx       # Search + filter control bar
│   │   ├── Sidebar.jsx         # Collapsible left navigation drawer
│   │   └── UploadModal.jsx     # Upload form with drag-and-drop & progress
│   ├── pages/                  # Route-level page components
│   │   ├── Dashboard.jsx       # Home dashboard with metrics & recent activity
│   │   ├── Documents.jsx       # Full document repository listing
│   │   ├── Login.jsx           # Authentication login screen
│   │   ├── Upload.jsx          # File upload page with policy guidelines
│   │   └── VersionHistory.jsx  # Per-document version timeline
│   ├── services/
│   │   ├── api.js              # Mock API layer (get, upload, delete, download)
│   │   └── auth.js             # Auth helpers (login, logout, token, getCurrentUser)
│   ├── App.jsx                 # Root app + routing + protected layout
│   ├── App.css                 # App-level styles
│   ├── index.css               # Global CSS design system (tokens, utilities)
│   └── main.jsx                # React entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or newer
- npm (included with Node.js)

### Installation & Run

```bash
# 1. Clone the repository
git clone <repo-url>
cd Employee_Document_Vault_with_Role_based_Access

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173** (or the next available port).

### Build for Production

```bash
npm run build
npm run preview
```

---

## Demo Accounts

The app ships with three pre-configured mock users. **Any password with 6+ characters will work.**

| Role | Username | Password | Access Level |
|---|---|---|---|
| **HR Admin** | `admin` | any 6+ characters | Full: upload, delete, view all docs |
| **Manager** | `manager` | any 6+ characters | Upload, download, view — no delete |
| **Employee** | `employee` | any 6+ characters | Upload, download, view — no delete |

> **Note:** No real backend is required. Authentication state is persisted to `localStorage` via a mock JWT token.

---

## Role-Based Access Control

| Action | HR Admin | Manager | Employee |
|---|---|---|---|
| View documents | ✅ | ✅ | ✅ |
| Download documents | ✅ | ✅ | ✅ |
| Upload documents | ✅ | ✅ | ✅ |
| Delete documents | ✅ | ❌ | ❌ |
| View version history | ✅ | ✅ | ✅ |
| See admin indicators | ✅ | ❌ | ❌ |

Role is determined at login and stored in the user session. The UI automatically adjusts buttons, badges, and controls based on the current user's role. Delete is **hidden** (not just disabled) for Manager and Employee.

---

## Pages & Components

### Pages

| Page | Route | Description |
|---|---|---|
| **Login** | `/` | Authentication screen with mock credentials |
| **Dashboard** | `/dashboard` | Metrics overview, category folders, recent activity feed |
| **Documents** | `/documents` | Full vault with search, filter, sort, download, delete |
| **Upload** | `/upload` | Upload form with drag-and-drop support and upload policy |
| **Version History** | `/version-history` | Timeline of all file versions per document |

### Key Components

| Component | Description |
|---|---|
| `Navbar` | Top bar with user info, role badge, and sidebar toggle |
| `Sidebar` | Collapsible left drawer with navigation links |
| `FileTable` | Sortable document table with per-row action buttons |
| `SearchBar` | Search input + type filter + sort dropdown |
| `UploadModal` | Full upload form with drag-and-drop, progress bar, and tag input |
| `DocumentCard` | Metric card used in the dashboard stats grid |

---

## Services & API Layer

### `src/services/auth.js`

Handles all authentication logic:

- `login(username, password)` — validates credentials and stores a mock JWT + user profile in `localStorage`
- `logout()` — clears the session
- `isAuthenticated()` — checks if a token exists
- `getCurrentUser()` — retrieves the current user object
- `getToken()` — retrieves the raw token string

### `src/services/api.js`

A simulated REST API layer using Axios with an auth interceptor:

- `getFiles(filters)` — fetches documents from `localStorage` with search, type filter, and sort support
- `uploadDocument(file, type, tags, progressCallback)` — simulates a presigned S3 upload with progress events
- `downloadDocument(fileId)` — creates and triggers a browser download
- `deleteDocument(fileId)` — removes the document from the local store

> The Axios client is pre-configured to attach `Authorization: Bearer <token>` headers on every request, ready to be pointed at a real backend API.

---

## Document Categories

The vault organizes documents into **4 categories**:

| Category | Icon | Description |
|---|---|---|
| **Offer Letters** | 📄 | Employment offers issued to candidates |
| **Payslips** | 💰 | Monthly salary statements |
| **Contracts** | 📋 | NDAs, employment agreements |
| **Appraisals** | 🏆 | Annual performance evaluation reports |

---

## Architecture Notes

### Simulated S3 Upload Flow

The upload process mirrors a real AWS S3 presigned URL architecture:

1. **Request presigned URL** — The client calls the backend API to get a temporary upload URL
2. **Direct S3 upload** — The file is PUT directly from the browser to S3 (bypassing the server)
3. **Register in DB** — The backend is notified of the successful upload and registers the S3 reference

In this demo, steps 1 and 2 are simulated with a progress animation, and step 3 writes to `localStorage`.

### Version Control

When a file with the **same name and category** is uploaded again, the system automatically:
- Increments the version number (`v1.0` → `v2.0`)
- Marks the previous version as `isLatest: false`
- Merges tags from both versions
- Updates the document's metadata to reflect the latest upload

### Multi-Tab Support

The app listens to the browser's `storage` event to keep user session state synchronized across multiple open browser tabs.

---

## Environment Variables

Create a `.env` file in the project root to configure the API endpoint:

```env
# Backend API base URL (optional - app works without a backend in mock mode)
VITE_API_BASE_URL=https://your-api-endpoint.com/v1
```

If `VITE_API_BASE_URL` is not set, the Axios client defaults to a placeholder URL. The app gracefully falls back to the local mock layer if the backend is unreachable.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run OxLint static analysis |

---

*Built as a frontend demonstration of a production-ready HR Document Management System architecture.*

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
