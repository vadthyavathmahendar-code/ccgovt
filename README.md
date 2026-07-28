# Civics Connect Enterprise

Civics Connect Enterprise is a modern civic complaint management platform designed for citizens, field officers, department directors, and city commissioners.

## 🚀 Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (or pass them directly in the terminal env parameters):
```env
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

---

## 🗃️ Seeding Test Data

We have built a completely automated one-command seeder utility. 

Running this script registers the full list of 39 accounts inside **Supabase Auth** via the Admin API, inserts their **`public.profiles`**, seeds **50 Hyderabad complaints** with complete timeline updates, verifications, escalations, and notifications, and saves a standalone relational SQL backup at `./seed-data.sql`.

### Run Seeder Command
```bash
SUPABASE_SERVICE_ROLE_KEY=your_key_here npm run seed
```
*Note for Windows PowerShell users:*
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="your_key_here"; npm run seed
```

---

## 🔑 QA Test Credentials

Every generated account uses the common password:
**`123456789`**

### A. Super Admin
* **Email**: `super_admin@ccgovt.test`

### B. Commissioners
* **Roads & Lighting**: `comm_roads_light@ccgovt.test`
* **Water & Sanitation**: `comm_water_sani@ccgovt.test`

### C. Department Directors / Admins
* **Roads**: `admin_roads@ccgovt.test`
* **Sanitation**: `admin_sanitation@ccgovt.test`
* **Water Supply**: `admin_water_supply@ccgovt.test`
* **Street Lighting**: `admin_street_lighting@ccgovt.test`

### D. Employees (12 total, 3 per department)
* Roads: `emp_road_1@ccgovt.test` to `emp_road_3@ccgovt.test`
* Sanitation: `emp_sani_1@ccgovt.test` to `emp_sani_3@ccgovt.test`
* Water: `emp_wate_1@ccgovt.test` to `emp_wate_3@ccgovt.test`
* Street Lighting: `emp_stre_1@ccgovt.test` to `emp_stre_3@ccgovt.test`

### E. Citizens (20 total)
* `citizen_1@ccgovt.test` to `citizen_20@ccgovt.test`

---

## 🛠️ Verification SQL
The seeder automatically exports a standalone SQL seeder at **`./seed-data.sql`**. You can copy-paste this file into the Supabase SQL editor to inspect profile mapping configurations at any time.
