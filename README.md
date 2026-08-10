# 🗄️ Employee Document Vault

> A secure, role-based employee document management system built with **React 19 + Vite 8**, integrated directly with **Amazon Cognito** for role-based authentication and **AWS API Gateway / Lambda / S3** for secure document storage and presigned URL file transfers.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture & Data Flow](#architecture--data-flow)
- [AWS & Cognito Integration](#aws--cognito-integration)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Scripts](#scripts)

---

## Overview

The **Employee Document Vault** is an enterprise-grade web application designed for HR document management. It features:

- **Real Amazon Cognito Authentication** using SRP (Secure Remote Password) flows and JWT tokens.
- **Group-to-Role Mapping** (`HR_Admin` → HR Admin, `Manager` → Manager, `Employee` → Employee) derived directly from Cognito ID token claims.
- **Presigned S3 Upload Pipeline** — files are uploaded directly from the browser to AWS S3 using temporary presigned PUT URLs provided by the API Gateway backend.
- **Secure File Downloads** — temporary presigned S3 GET URLs ensure raw S3 bucket objects remain private.
- **Responsive Enterprise UI** built with Bootstrap 5.3 and custom CSS styling.

---

## Features

| Feature | Description |
|---|---|
| 🔐 **Cognito Authentication** | Real Amazon Cognito User Pool login with SRP, session management, and `NEW_PASSWORD_REQUIRED` first-login challenge handling. |
| 👥 **Role-Based Access** | HR Admin (full control: view, upload, delete), Manager & Employee (view, download, upload). |
| 📂 **Document Repository** | Search by filename/tags, filter by department category, and sort by date or name. |
| 📤 **Presigned S3 Uploads** | Drag-and-drop file upload with animated progress tracking via presigned S3 PUT URLs. |
| 📥 **Presigned S3 Downloads** | Secure, temporary presigned GET URLs for browser downloads. |
| 🕓 **Version History** | Document revision tracking with uploader audit logs. |
| 📊 **Analytics Dashboard** | Overview metrics for total documents, category breakdown, and recent upload activity. |
| 📱 **Responsive Design** | Modern sidebar navigation drawer, clean top navbar, and mobile-friendly layouts. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **Authentication SDK** | [Amazon Cognito Identity JS](https://www.npmjs.com/package/amazon-cognito-identity-js) |
| **HTTP Client** | [Axios](https://axios-http.com/) (configured with async Cognito token interceptors) |
| **UI / Styling** | [Bootstrap 5.3](https://getbootstrap.com/) + [Bootstrap Icons](https://icons.getbootstrap.com/) |
| **Build Tool** | [Vite](https://vite.dev/) |

---

## Architecture & Data Flow

```
┌─────────────────┐       1. SRP Authentication       ┌───────────────────────┐
│                 ├──────────────────────────────────►│  Amazon Cognito       │
│                 │◄──────────────────────────────────┤  User Pool            │
│                 │       2. JWT Tokens (ID & Access) └───────────────────────┘
│  React 19 +     │
│  Vite Frontend  │       3. API Requests (Bearer Token) ┌─────────────────────┐
│  (SPA)          ├─────────────────────────────────────►│  AWS API Gateway    │
│                 │◄─────────────────────────────────────┤  & Lambda Backend   │
│                 │       4. Presigned S3 Upload/Download│                     │
│                 │          URLs                        └──────────┬──────────┘
│                 │                                                 │
│                 │       5. Direct Binary Upload / Download         │
│                 ├─────────────────────────────────────────────────┼──────────┐
│                 │◄────────────────────────────────────────────────┘          │
└────────┬────────┘                                                            │
         │                                                                     ▼
         │                                                         ┌───────────────────┐
         └────────────────────────────────────────────────────────►│  Amazon S3 Bucket │
                                                                   │  Document Vault   │
                                                                   └───────────────────┘
```

---

## AWS & Cognito Integration

### Authentication (`src/services/auth.js`)
- Authenticates against Amazon Cognito User Pool (configured via environment variables).
- Automatically handles `NEW_PASSWORD_REQUIRED` challenge if a user must set a new password on first login.
- Extracts `cognito:groups` from the decoded ID token payload to determine application roles.
- `getToken()` automatically refreshes tokens near expiry via the Cognito SDK.

### API Layer (`src/services/api.js`)
- Axios request interceptor attaches `Authorization: Bearer <Cognito_Access_Token>` to all outgoing backend calls.
- `getFiles(filters)` — Fetches document metadata from `GET /files`.
- `uploadDocument(file, category, tags)` — Requests presigned PUT URL from `POST /upload`, then streams binary directly to S3 via `axios.put(presignedUrl, file)`.
- `downloadDocument(fileId)` — Retrieves presigned GET URL from `GET /download/{fileId}` and triggers browser download.
- `deleteDocument(fileId)` — Triggers soft/hard deletion via `DELETE /files/{fileId}`.
- Auto-handles `401 Unauthorized` responses by clearing local session and redirecting to the login screen.

---

## Role-Based Access Control (RBAC)

Cognito User Pool groups map directly to frontend permissions:

| Cognito Group | Application Role | View | Download | Upload | Delete |
|---|---|:---:|:---:|:---:|:---:|
| `HR_Admin` | **HR Admin** | ✅ | ✅ | ✅ | ✅ |
| `Manager` | **Manager** | ✅ | ✅ | ✅ | ❌ |
| `Employee` | **Employee** | ✅ | ✅ | ✅ | ❌ |

> **Note:** UI controls (such as delete buttons) are hidden for unauthorized roles. Backend API Gateway & Lambda functions enforce server-side security authorization.

---

## Project Structure

```
Employee_Document_Vault_with_Role_based_Access/
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Brand assets & custom CSS
│   ├── components/             # Reusable UI components
│   │   ├── AccessDenied.jsx    # 403 Forbidden page view
│   │   ├── DeleteConfirmModal.jsx # Deletion confirmation dialog
│   │   ├── DocumentCard.jsx    # Metric card widget
│   │   ├── FileTable.jsx       # Document repository table with role checks
│   │   ├── Navbar.jsx          # Header navbar with user profile & role badge
│   │   ├── SearchBar.jsx       # Filter, search, and sort control bar
│   │   ├── Sidebar.jsx         # Navigation drawer
│   │   └── UploadModal.jsx     # Upload form with drag-and-drop & progress bar
│   ├── pages/                  # Top-level view routes
│   │   ├── Dashboard.jsx       # Main dashboard with statistics & activity
│   │   ├── Documents.jsx       # Document vault listing page
│   │   ├── Login.jsx           # Cognito authentication & password-reset form
│   │   ├── Upload.jsx          # File upload page with vault policy guide
│   │   └── VersionHistory.jsx  # Document revision audit log
│   ├── services/
│   │   ├── api.js              # Axios API service (Cognito interceptor + S3 presigned flow)
│   │   └── auth.js             # Amazon Cognito authentication SDK integration
│   ├── App.jsx                 # Main layout, router, and protected routes
│   ├── App.css                 # Application-specific styles
│   ├── index.css               # Global theme design system
│   └── main.jsx                # Application entry point
├── .env                        # Production AWS environment variables
├── index.html
├── package.json
└── vite.config.js              # Vite configuration (with globalThis polyfill)
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/nishnarudkar/Employee-Document-Vault-with-Role-Based-Access.git
cd Employee-Document-Vault-with-Role-Based-Access

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Ensure .env is present in the root directory (see section below)

# 4. Start local development server
npm run dev
```

The application will be accessible at **http://localhost:5173**.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-cognito-client-id
VITE_API_BASE_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod
```

> **Security Note:** Never commit `.env` or sensitive credentials to your public repository. All S3 file transfers use temporary presigned URLs issued server-side.

---

## Deployment

### Production Build

```bash
npm run build
```

This compiles the static assets into the `dist/` directory.

### Deploying to Amazon S3 & CloudFront

Upload the contents of `dist/` to your target frontend S3 bucket:

```bash
aws s3 sync dist/ s3://your-frontend-s3-bucket --region us-east-1
```

**Single-Page Application (SPA) Routing Note:**
Because this app uses client-side routing (`react-router-dom`), ensure **Static Website Hosting** on S3 has both Index Document and Error Document set to `index.html` (or configure CloudFront custom error responses mapping `404` → `/index.html` with HTTP 200).

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite local development server |
| `npm run build` | Compiles optimized production bundle in `dist/` |
| `npm run preview` | Previews production build locally |
| `npm run lint` | Runs code linter |

---

*Enterprise HR Document Management System — React + Amazon Cognito + AWS API Gateway + S3*
