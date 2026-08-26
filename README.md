# 🍽️ DineFlow — Real-Time Restaurant POS, Table Management & Dine-In Scheduling SaaS

> **A high-concurrency, full-stack MERN & Socket.io platform engineered for modern gourmet dining, interactive dish customization, kitchen dispatching, staff vetting, and executive revenue analytics.**

---

## 🌟 Key Highlights & System Architecture

DineFlow mirrors an LMS modular pipeline translated to high-volume hospitality management:
- **Menu Categories** (Curriculum) ➔ Starters, Mains, Desserts, Beverages
- **Dishes with Chef Video Teasers** (Interactive Lessons) ➔ High-res imagery, video playback, spice level selectors, and toppings
- **Dish Customizations** (Quizzes/Assessments) ➔ Dynamic price add-ons, allergy flags, and custom chef instructions
- **4-Stage Serving Pipeline** (Progress Engine) ➔ `Placed` ➔ `Prepping` ➔ `Ready to Serve` ➔ `Served`
- **Staff Vetting Queue** (Instructor Verification) ➔ Manager approvals for newly signed-up waiters
- **Manager Analytics** (Revenue & Performance Dashboard) ➔ Razorpay transaction volume, peak turnover hours, top-selling items

---

## 🚀 1-Click Zero-Friction Demo Mode (Recruiter / Interview Ready)

DineFlow includes an instant 1-Click Demo Launcher right on the navigation bar:

| Role | Pre-configured Demo Profile | Credentials | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer** | `Demo Customer (Table 4)` | `customer@dineflow.com` / `password123` | Digital QR Menu, Dish Video Player, Spice & Addon Customizer, Razorpay Test Checkout, Live 4-Stage Tracker |
| **Kitchen / Waiter** | `Alex Waiter (Kitchen Staff)` | `waiter@dineflow.com` / `password123` | Real-time Kanban Dispatch Board, Priority Alerts (Urgent/Scheduled), 1-Click Milestone Advancement |
| **Manager / Admin** | `Elena Vance (General Manager)` | `admin@dineflow.com` / `password123` | Staff Vetting Queue, Menu Studio (Media Uploads), Floor Plan & Table QR Manager, Sales & Revenue Analytics |

---

## ⚡ Multi-Tab Real-Time Sync Showcase

For interviewer live evaluation:
1. Open **Tab 1** (`http://localhost:5173`) and switch to **Demo Customer (Table 4)**.
2. Open **Tab 2** (`http://localhost:5173/kitchen`) in an adjacent window and switch to **Demo Waiter (Alex)**.
3. In **Tab 1**, customize a dish, add to cart, and click **Pay via Razorpay**.
4. Instantly observe **Tab 2** receive the order in the **New Orders** Kanban column with audio notification and badge updates via **Socket.io** without page refresh!
5. In **Tab 2**, click **Accept & Prep** ➔ **Mark Ready**; watch **Tab 1**'s live 4-stage serving progress bar update dynamically in real time.

---

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom Dark Gastronomy & Obsidian Glassmorphism theme
- **State Management**: Zustand & React Context
- **Icons**: Lucide React
- **Real-Time Client**: Socket.io-client
- **HTTP Client**: Axios with JWT request/response interceptors
- **Payments**: Razorpay Checkout SDK + Smart Test Mode Simulator fallback

### Backend (`/server`)
- **Runtime**: Node.js & Express.js
- **Real-Time Gateway**: Socket.io (with room channels: `room_kitchen`, `room_manager`, `table_<id>`)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with RBAC (`customer`, `waiter`, `manager`) and staff verification guards
- **Payments**: Official Razorpay Node SDK with SHA256 HMAC signature verification
- **Media Storage**: Multer with Cloudinary integration & memory buffer streaming

---

## 📁 Repository Directory Structure

```
DineFlow/
├── client/
│   ├── src/
│   │   ├── api/             # Axios client and REST API endpoints
│   │   ├── components/
│   │   │   ├── common/      # Navbar, 1-Click DemoLoginBar, Modals, Badges
│   │   │   ├── customer/    # MenuCard, DishModal, CartDrawer, LiveTracker, TableSelect
│   │   │   ├── waiter/      # KanbanBoard, OrderCard, TableGrid
│   │   │   └── manager/     # AnalyticsDashboard, StaffVettingQueue, MenuStudio, TableManager
│   │   ├── context/         # AuthContext and SocketContext
│   │   ├── pages/           # LandingPage, CustomerMenu, KitchenKanban, ManagerPortal, LoginPage
│   │   ├── store/           # Zustand cart & live active order stores
│   │   └── index.css        # Tailwind & custom glow/animations
│   └── vite.config.js
│
├── server/
│   ├── config/              # MongoDB and Cloudinary connections
│   ├── controllers/         # Auth, Users, Menu, Tables, Orders, Payments, Analytics
│   ├── middleware/          # JWT auth, role validation, file upload, error handling
│   ├── models/              # User, Table, Category, MenuItem, Order schemas
│   ├── routes/              # Express API routers
│   ├── seed/                # Full database seeder (16+ dishes, 8 tables, orders, users)
│   ├── sockets/             # Socket.io room events and dispatch broadcasting
│   └── server.js            # Express application bootstrapper
│
└── package.json             # Root monorepo orchestrator
```

---

## ⚙️ Quick Start & Local Installation

### Prerequisites
- Node.js >= 18.x
- MongoDB (Local instance or MongoDB Atlas URI)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/krishnablji/DineFlow-.git
cd DineFlow-

# Install root, backend, and frontend packages
npm run install-all
```

### 2. Configure Environment Variables
Copy `.env.example` in `/server`:
```bash
cd server
cp .env.example .env
```
Populate `.env` with your credentials:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/dineflow
JWT_SECRET=your_super_secret_jwt_key_dineflow_2026
RAZORPAY_KEY_ID=rzp_test_yourKeyId
RAZORPAY_KEY_SECRET=yourRazorpaySecret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Seed Gourmet Database
```bash
npm run seed
```
This populates:
- 3 pre-registered demo accounts (`customer@dineflow.com`, `waiter@dineflow.com`, `admin@dineflow.com`)
- 8 restaurant dining tables
- 16+ gourmet dishes across Starters, Mains, Desserts, and Beverages with chef teaser videos & customizations
- 25+ realistic historical orders to populate manager analytics charts

### 4. Launch Application
```bash
# From the root directory:
npm run dev
```
- Client runs on `http://localhost:5173`
- Backend API & Socket.io server runs on `http://localhost:5000`

---

## 🧪 Database Models Overview

- **User**: Name, Email, Password, Role (`customer`, `waiter`, `manager`), `isVerified` (waiter verification queue flag), Avatar.
- **Table**: `tableNumber`, `capacity`, `status` (`available`, `occupied`, `reserved`), `qrCodeUrl`.
- **Category**: Name, Slug, Description, DisplayOrder.
- **MenuItem**: Title, Category, Price, Description, `imageUrl`, `videoUrl`, `dietaryTags` (`veg`, `vegan`, `gluten-free`, `non-veg`, `chef-special`), `customizations` (spice levels, priced extras, notes), `isAvailable`, `prepTimeMinutes`.
- **Order**: `orderNumber`, `tableNumber`, `items` (with chosen spice & extras), `totalAmount`, `paymentStatus` (`pending`, `paid`, `cash_on_delivery`), `razorpayOrderId`, `servingStatus` (`placed`, `prepping`, `ready`, `served`), `priority` (`normal`, `urgent`, `scheduled`), `scheduledTime`, `timeline`.

---

## 📄 License
This project is licensed under the MIT License.
