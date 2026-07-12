# 🚚 TransitOps — Smart Transport Operations Platform

A centralized platform that allows organizations to manage the complete lifecycle of their transport operations — from vehicle registration and driver management to dispatching, maintenance, fuel logging, and analytics.

---

## 📋 Business Context

Many logistics companies still rely on spreadsheets and manual logbooks to manage their transport operations. This leads to:

- 🔴 Scheduling conflicts & underutilized vehicles
- 🔴 Missed maintenance & expired driver licenses
- 🔴 Inaccurate expense tracking
- 🔴 Poor operational visibility

**TransitOps** solves this by providing a real-time, role-based operations dashboard for the entire transport lifecycle.

---

## 👥 Target Users & Roles

| Role | Access & Responsibilities |
|---|---|
| **Fleet Manager** | Full access — vehicles, drivers, trips, maintenance, finance, analytics |
| **Driver** | Dashboard & trips only — creates and monitors active deliveries |
| **Safety Officer** | Dashboard, fleet, drivers, maintenance — tracks license validity & safety scores |
| **Financial Analyst** | Dashboard, finance, analytics — reviews costs, fuel, and profitability |

---

## ✅ Business Rules Enforced

- Vehicle registration numbers are **unique**
- `Retired` or `In Shop` vehicles **cannot be dispatched**
- Drivers with **expired licenses** or **Suspended** status are blocked from trips
- A driver or vehicle already **On Trip** cannot be double-assigned
- Cargo weight **must not exceed** vehicle's max load capacity
- Dispatching a trip → vehicle & driver status set to **On Trip**
- Completing a trip → vehicle & driver restored to **Available**
- Cancelling a trip → vehicle & driver restored to **Available**
- Creating a maintenance record → vehicle status set to **In Shop**
- Closing maintenance → vehicle restored to **Available** *(unless Retired)*

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Fleet Manager | `manager@transitops.com` | `password123` |
| Driver | `driver@transitops.com` | `password123` |
| Safety Officer | `safety@transitops.com` | `password123` |
| Financial Analyst | `analyst@transitops.com` | `password123` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | TailwindCSS v4 |
| AI Integration | Google Gemini API (`@google/genai`) |
| Charts | Recharts |
| Icons | Lucide React |
| Animations | Motion (Framer Motion) |
| Storage | localStorage (simulation mode) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env.local` file in the project root:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
APP_URL="http://localhost:3000"
```
> Get your free API key at [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 3. Run the App
```bash
npm run dev
```

App runs at **http://localhost:3000** 🎉

---

## 📁 Project Structure

```
├── src/
│   ├── App.tsx                 # Root app, state management, RBAC routing
│   ├── types.ts                # TypeScript interfaces (Vehicle, Driver, Trip, etc.)
│   ├── data.ts                 # Default seed data + localStorage persistence
│   ├── index.css               # Global styles & design tokens
│   └── components/
│       ├── DashboardView.tsx   # Role-specific dashboard KPIs
│       ├── FleetView.tsx       # Vehicle management & maintenance orders
│       ├── DriversView.tsx     # Driver profiles & compliance tracking
│       ├── TripsView.tsx       # Trip dispatch center with validation
│       ├── MaintenanceView.tsx # Work orders ledger
│       ├── FinanceView.tsx     # Fuel logs & expense tracking
│       ├── AnalyticsView.tsx   # Charts & operational insights
│       ├── SettingsView.tsx    # System settings & configuration
│       ├── LoginView.tsx       # Authentication
│       └── LandingView.tsx     # Public landing page
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript type check |

---

## 📄 License

MIT License © TransitOps
