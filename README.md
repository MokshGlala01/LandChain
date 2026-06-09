# LandChain — Decentralized Land Registry & Property Management Platform

LandChain is a secure, transparent, and instant real estate mutation and registry platform. It uses **Next.js 14 (App Router)**, **Solidity Smart Contracts (Hardhat)**, **Prisma (PostgreSQL)**, and **ethers.js** to secure land deeds, mutations, and encumbrance checking.

---

## 🚀 Key Features

LandChain includes 6 fully functional role-based dashboards protected by role-based routing:

1. **Citizen Dashboard (`/citizen`)**:
   - **Overview & Mutations**: Track owned properties and mutation histories.
   - **Deed & Document Center**: Digital locker integration, IPFS hash indexing, and QR-coded document generator (Khata/EC).
   - **Title Transfers**: Stepper workflow to pay stamp duty via simulated payment gateways and request transfers.
   - **Encrypted Wills**: Nominee nominee split registry with OTP authentication.
   - **Alerts Watchlist**: Real-time parcel activity notifications (SMS/Email/WhatsApp).
   - **Carbon Credits Portal**: Sell green credits verified via satellite green-cover index values.

2. **Government Registrar Dashboard (`/registrar`)**:
   - **Approvals Pipeline**: Review pending mutations, inspect overlap bounds, and execute smart contract ledger writes.
   - **Arbitration Center**: Resolve disputed deeds and freeze/unfreeze asset accounts on-chain.
   - **Fraud Alert Console**: Inspect transaction velocity spikes and valuation leaps flagged by the AI engine.
   - **Inheritance Executors**: Disburse nominee claims matching encrypted wills.

3. **Banker Mortgage Portal (`/bank`)**:
   - **Lien Audit**: Perform instant single or batch CSV property queries using PapaParse.
   - **LTV Eligibility Calculator**: Set collateral terms, calculate stamp duties, and register on-chain mortgages.
   - **Webhook Integrations**: Subscribe external core banking channels to mutation webhooks.

4. **Admin Analytics Center (`/admin`)**:
   - **Analytics Suite**: Aggregate mutation durations, revenue collections, and transaction volumes using Recharts.
   - **GIS Heatmap**: Mapbox GL canvas visualization showing transaction volumes, encumbrances, and idle lands.
   - **Developer Access**: Generate rate-limited Swagger/OpenAPI credentials.
   - **System Configs**: Adjust district-level circle rates and system cron schedules.

5. **Builder Development Portal (`/builder`)**:
   - **RERA Compliance**: Register developments, auto-generate unit indices, and monitor construction milestone timelines.
   - **Title Escrows**: Upload architectural NOC proofs to release escrow funds and mint ERC-721 Property NFT proofs.

6. **Agricultural Officer Dashboard (`/agri`)**:
   - **Agri Registry**: Track soil type, irrigation logs, PM-Kisan welfare, and yield histories.
   - **Zoning Conversion (Section 143)**: Progress agricultural lands through Tehsildar -> Collector -> Revenue board pipelines.
   - **Land Pooling Belts**: Click-select adjacent parcel layouts on interactive SVG maps to coordinate infrastructure projects.
   - **Canopy Carbon Credits**: Audit spectral NDVI indices to issue or revoke on-chain carbon offset credits.

---

## 🔐 Aadhaar & DigiLocker Authentication System

LandChain features a complete user registration and login system utilizing real Aadhaar OTP (UIDAI) and DigiLocker OAuth:

- **Privacy & Compliance**:
  - Raw Aadhaar numbers are never stored in databases, logs, sessions, or memory.
  - User identities are indexed via a secure `SHA-256(aadhaar + PEPPER)` hash.
  - Compliant with the Aadhaar Act, 2016 (Section 8) and DPDP Act, 2023.
- **Authentication Methods**:
  - **Aadhaar OTP Flow**: Employs signed XML payloads for OTP dispatch, verification, and eKYC demographics retrieval.
  - **DigiLocker OAuth Flow**: Integrates PKCE S256 OAuth authentication, token exchanges, and eAadhaar XML retrieval and parsing.
- **Local Simulation Fallback**:
  - If AUA certificates or DigiLocker client secrets are unconfigured, the system automatically falls back to secure simulation mode.
  - Simulated OTP codes are output in the terminal and rendered on-screen via Sonner toast overlays, facilitating smooth offline development.
- **Session Security**:
  - Secure cookie-based JWT sessions (`lc_session` via `jose`) with HTTPOnly, Secure, and SameSite=Strict properties.
  - Next.js Edge-compatible middleware restricts dashboard views (`/citizen`, `/registrar`, `/bank`, etc.) based on authenticated roles.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS & next-themes (Class Strategy Dark Mode)
- **Animation**: Framer Motion (entry viewport staggers)
- **Database**: PostgreSQL (Prisma ORM)
- **Smart Contracts**: Solidity (Hardhat)
- **Web3 Integration**: ethers.js v6
- **Storage**: Pinata IPFS HTTP REST API
- **Maps**: Mapbox GL (with custom SVG canvas drawings fallback)
- **PDF Export**: jsPDF

---

## 📁 Project Structure

```text
landchain/
├── app/                        # Next.js App Router Pages & API
│   ├── (auth)/                 # KYC login & registration
│   ├── (dashboard)/            # Citizen, Banker & Registrar Panels
│   ├── (public)/               # Landing, Search & QR Verification
│   └── api/                    # JSON endpoints for properties, transfers, verify & sync
├── contracts/                  # Solidity smart contracts
│   ├── LandRegistry.sol        # Property ledger contract
│   └── PropertyTransfer.sol    # Escrow & mutation contract
├── prisma/                     # Database schemas & seeds
│   ├── schema.prisma           # Prisma PostgreSQL models
│   └── seed.ts                 # Database seeder
├── lib/                        # Core config files
│   ├── auth.ts                 # NextAuth configs & auth check fallbacks
│   ├── db.ts                   # Prisma client singleton
│   ├── blockchain.ts           # Ethers RPC connectors & ABI wrappers
│   ├── ipfs.ts                 # Pinata IPFS file helpers
│   └── mapbox.ts               # Mapbox GL configurations
├── components/                 # Global UI layouts (Navbar, Footer, Providers)
├── scripts/                    # Hardhat compile & deploy scripts
└── tailwind.config.ts          # Syne & DM Sans customized color palette
```

---

## ⚙️ Installation & Setup

### 1. Clone & Install Dependencies
Ensure you have Node.js (v18 or above) installed:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and configure the database link:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/landchain?schema=public"
NEXTAUTH_SECRET="your-nextauth-secret"

# Pinata IPFS Keys (Leave blank to use simulated IPFS uploads)
PINATA_API_KEY=""
PINATA_SECRET_KEY=""

# Mapbox Token (Leave blank to use interactive SVG fallback mapping)
NEXT_PUBLIC_MAPBOX_TOKEN=""

# Contract addresses (printed on scripts/deploy.ts)
NEXT_PUBLIC_CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
NEXT_PUBLIC_TRANSFER_CONTRACT_ADDRESS="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
NEXT_PUBLIC_POLYGON_RPC="http://127.0.0.1:8545"
```

### 3. Initialize Database
Initialize Prisma client and seed the PostgreSQL database:
```bash
npx prisma generate
npx prisma db seed
```

### 4. Compile & Deploy Smart Contracts
Start the local Hardhat EVM node:
```bash
npx hardhat node
```
In a new terminal tab, deploy the Solidity contracts:
```bash
npx hardhat run scripts/deploy.ts --network localhost
```
Copy the printed contract addresses to your `.env` file (`NEXT_PUBLIC_CONTRACT_ADDRESS` and `NEXT_PUBLIC_TRANSFER_CONTRACT_ADDRESS`).

### 5. Run Next.js Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the User Flow
- **Authentication**: Log in with any role (`Citizen`, `Registrar`, `Bank`, `Admin`, `Builder`, `Agri`) using Aadhaar OTP simulation (Code: `123456` standard).
- **Citizen Mutation**: Go to the Citizen panel, generate dynamic Khata deeds, pay stamp duties, structure nominees, or list carbon credits.
- **Registrar Approval**: Log in as the Registrar to authorize mutated deeds, assign arbitrators to dispute holds, or monitor suspect fraud flags.
- **Bank Mortgages**: Log in as a Banker to verify LTV sliders, upload bulk CSV properties, or subscribe webhooks.
- **Admin GIS Heatmap**: Log in as an Admin to check Recharts metrics, inspect the Mapbox GL Heatmap, or sync blockchain health.
- **Builder Escrows**: Log in as a Builder to verify milestones, request payment releases, or mint flat Property NFTs.
- **Agricultural Audits**: Log in as an Agri Officer to update soil/irrigation metrics, run land pooling SVG layouts, or trigger satellite NDVI scans.
