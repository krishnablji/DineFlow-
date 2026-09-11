# 🍽️ DineFlow — High-Speed Local Wi-Fi Restaurant POS & Kitchen Display System

> **A streamlined, high-speed MERN & Socket.io tablet POS and kitchen dispatch system engineered specifically for 10–15 table restaurants operating over local Wi-Fi.**

---

## 🌟 The 3 Operational Roles

DineFlow eliminates customer self-ordering and payment gateway complexity. Dedicated staff tablets operate across three distinct operational roles:

| Role | Route | Primary Device | Key Responsibilities & Capabilities |
| :--- | :--- | :--- | :--- |
| **Waiter** | `/waiter` | 10" Floor Tablet | • Table selector (Tables 1–15)<br>• High-touch `+` / `-` quantity adjusters for rapid entry<br>• Plain-text unformatted kitchen notes per item (e.g. "extra spicy, no cilantro")<br>• Table-wise sequential order IDs (`T04-#01`)<br>• Top notification banner for instant "Ready for Delivery" dish alerts |
| **Kitchen** | `/kitchen` | Kitchen Wall Display (KDS) | • High-contrast dark tickets formatted with sequential IDs<br>• High-visibility bold chef notes<br>• Single-action transition: **"Start Delivery / Mark Ready"** (triggers waiter notification)<br>• **Item 86 (Out of Stock)** quick-toggle drawer syncing in real time |
| **Manager** | `/manager` | Counter POS / Office Tablet | • **Panel 1: Inventory Restock Control** — 1-click 86/available toggle across all menu items<br>• **Panel 2: Daily Sales & Shift Summary Log** — Sequential order history, manual cash tally settlement, revenue totals |

---

## ⚡ Multi-Tab Real-Time Sync Showcase

Experience the entire dine-in operational loop locally across 3 browser tabs:

```
+-------------------+       Socket.io Broadcast       +--------------------+
|   Waiter Tablet   | ==============================> |   Kitchen Display  |
|  (/waiter)        |      new_order: T04-#01         |     (/kitchen)     |
+-------------------+                                 +--------------------+
         ^                                                       |
         |               order_ready: T04-#01                    |
         +=======================================================+
                                 |
                                 v
                     +-----------------------+
                     |    Manager Portal     |
                     |  (/manager) Settle    |
                     +-----------------------+
```

1. **Tab 1 — Waiter Tablet (`http://localhost:5173/waiter`):**
   - Click **Demo Login: Waiter Tablet** (`waiter@dineflow.com`).
   - Select **Table 04**, tap `+` on *Truffle Wild Mushroom Arancini* and *Wagyu Ribeye Steak*.
   - In the plain-text note box, type: `Medium rare, sauce on the side`.
   - Tap **Submit Order to Kitchen (T04-#01)**. The cart clears instantly for the next table.
2. **Tab 2 — Kitchen KDS (`http://localhost:5173/kitchen`):**
   - Click **Demo Login: Kitchen KDS** (`kitchen@dineflow.com`).
   - The ticket for `T04-#01` appears immediately with the unformatted chef note highlighted in bold amber.
   - Click **Item 86 (Out of Stock)** drawer to toggle any dish off — notice it reflects on Waiter tablets instantly.
   - Click **"Ready for Delivery"** on the ticket.
3. **Back to Tab 1 (Waiter Tablet):**
   - A bright green alert banner instantly appears at the top:
     **"Table T04: Order T04-#01 is Ready for Delivery!"** with a 1-tap dismiss button.
4. **Tab 3 — Manager Portal (`http://localhost:5173/manager`):**
   - Click **Demo Login: Manager Portal** (`manager@dineflow.com`).
   - Check **Daily Sales & Summary Log** to see active and settled tickets.
   - Tap **"Mark Settled (Cash Received)"** once the waiter tallies and collects the bill.

---

## 🏷️ Table-Wise Sequential Order Numbering

Unlike opaque global IDs (e.g. `DF-9821`), DineFlow uses atomic per-table sequential numbering reset daily:
- **Format:** `T<TableNumber>-#<OrderNumber>`
- **Example:** Table 4 placing its first round gets `T04-#01`. A second round of drinks/desserts gets `T04-#02`.
- **Implementation:** Backed by MongoDB's atomic `$inc` operation via `TableOrderCounter` schema, eliminating race conditions even when multiple staff members submit orders simultaneously over the local network.

---

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Framework**: React 18 with Vite (Ultra-fast HMR and lightweight bundle)
- **Styling**: Tailwind CSS with Obsidian & Dark Slate high-contrast themes for bright kitchen environments
- **State & Real-Time**: Socket.io-client with dedicated rooms (`room_waiters`, `room_kitchen`, `room_manager`)
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT authorization headers

### Backend (`/server`)
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time Engine**: Socket.io in-memory rooms
- **Authentication**: JWT with Role-Based Access Control (`waiter`, `kitchen`, `manager`)
- **Data Counter**: Atomic per-table daily session counter (`TableOrderCounter`)

---

## 📁 Repository Directory Structure

```
DineFlow-/
├── client/
│   ├── src/
│   │   ├── api/apiServices.js         # API endpoints for orders, menu, stock, and analytics
│   │   ├── components/
│   │   │   ├── common/                # Navbar, DemoLoginBar, ProtectedRoute
│   │   │   ├── waiter/                # Waiter tablet components
│   │   │   ├── kitchen/               # KDS tickets & Item 86 drawer
│   │   │   └── manager/               # Inventory restock & Sales summary panels
│   │   ├── context/
│   │   │   ├── AuthContext.jsx        # RBAC auth state (waiter, kitchen, manager)
│   │   │   └── SocketContext.jsx      # Socket.io connection & room subscriptions
│   │   ├── pages/
│   │   │   ├── WaiterTablet.jsx       # 1-15 Table grid, + / - counters, raw notes, banner
│   │   │   ├── KitchenKanban.jsx      # KDS order tickets & 1-tap 86 drawer
│   │   │   ├── ManagerPortal.jsx      # Panel 1: Inventory 86 | Panel 2: Sales Log
│   │   │   ├── LoginPage.jsx          # Role-based login and staff registration
│   │   │   └── LandingPage.jsx        # Staff overview and system navigation
│   │   ├── App.jsx                    # Route switch & role guards
│   │   └── index.css                  # High-contrast touch styles
│   └── vite.config.js
│
├── server/
│   ├── config/db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js          # Staff auth & registration
│   │   ├── orderController.js         # Atomic sequential order creation & lifecycle
│   │   ├── menuController.js          # Menu fetching & 1-click stock 86 toggle
│   │   └── analyticsController.js     # Manager 2-panel sales & stock reporting
│   ├── models/
│   │   ├── User.js                    # Staff schema (role: waiter | kitchen | manager)
│   │   ├── TableOrderCounter.js       # Atomic daily sequential counter per table
│   │   ├── Order.js                   # Sequential IDs (T04-#01), items, raw notes
│   │   └── MenuItem.js                # Dishes, prices, categories, stock availability
│   ├── routes/                        # Express API route declarations
│   ├── seed/seeder.js                 # Complete restaurant seeder (dishes, staff, orders)
│   ├── sockets/socketHandler.js       # room_waiters, room_kitchen, room_manager events
│   └── server.js                      # Express & Socket.io server bootstrap
│
└── package.json                       # Monorepo root orchestrator
```

---

## ⚙️ Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/krishnablji/DineFlow-.git
cd DineFlow-

# Install root, backend, and frontend dependencies
npm run install-all
```

### 2. Configure Environment Variables
Create `.env` in `/server`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/dineflow
JWT_SECRET=dineflow_retail_pos_secret_2026
```

### 3. Seed Restaurant Database
Populates initial staff accounts, 16 dishes across 4 categories, and realistic sequential orders:
```bash
npm run seed
```

#### Pre-configured Staff Credentials:
- **Waiter Tablet**: `waiter@dineflow.com` / `password123`
- **Kitchen KDS**: `kitchen@dineflow.com` / `password123`
- **Manager Portal**: `manager@dineflow.com` / `password123`

*(Tip: You can also click any of the 3 quick login buttons in the top Demo Bar in the browser).*

### 4. Run Development Servers
```bash
# Starts both Express backend (port 5000) and Vite frontend (port 5173)
npm run dev
```

Open your browser to:
- `http://localhost:5173` (redirects directly to `/waiter` tablet mode)
- `http://localhost:5173/kitchen` (Kitchen Display System)
- `http://localhost:5173/manager` (Manager Portal)

---

## 📄 License
MIT License. Built for seamless tablet-first restaurant operations.
