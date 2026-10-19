# 📦 JE — Order Tracking (Frontend)

<p align="center">
  <img src="public/logo.svg" alt="JE Logo" width="280"/>
</p>

The official web frontend for the **JE** real-time order tracking and logistics platform. Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## 🌟 Portals & Features

- 👤 **Customer Tracking Portal (`/track/:trackingNumber`)**:
  - Direct shareable link for end customers (no login required).
  - Live timeline updates with visual status stages (Order Received, In Transit, Out for Delivery, Delivered, Cancelled).
- 🏢 **Organization Dashboard (`/org`)**:
  - Secure authentication.
  - Create shipments and generate unique random tracking codes (e.g. `TRK-A1B2C3`).
  - One-click copy tracking code and direct customer tracking links.
  - Post timeline updates with location milestones and update package statuses.
- 🔑 **Super Admin Portal (`/admin`)**:
  - Manage logistics organizations and partners.
  - Overview of all shipments across all organizations with real-time search.
- 🎨 **Branding**:
  - Custom vector JE monogram and typography logo.
  - Responsive, modern Tailwind UI.

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT interceptors
- **Routing**: React Router v7

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- Running instance of [je-tracking-backend](https://github.com/jackoupelayyan/je-tracking-backend) (defaults to `http://localhost:8080`)

### 2. Installation
```bash
git clone https://github.com/jackoupelayyan/je-tracking-frontend.git
cd je-tracking-frontend
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

> Requests to `/api/*` are automatically proxied to `http://localhost:8080` in local development (configured in `vite.config.ts`).

### 4. Production Build
```bash
npm run build
npm run preview
```

---

## 🔗 Route Map

| Path | Purpose |
|------|---------|
| `/track` | Public tracking lookup form |
| `/track/:trackingNumber` | Public order timeline & live details |
| `/login` | Unified staff login (redirects by role) |
| `/org` | Organization shipment management |
| `/admin` | Super Admin platform control panel |

---

## 📡 Backend Repository

The Kotlin + Spring Boot API for this frontend is located at:
👉 **[je-tracking-backend](https://github.com/jackoupelayyan/je-tracking-backend)**
