# LandChain — Decentralized Land Registry & Property Management Platform

LandChain is a secure, transparent, and instant real estate mutation and registry platform. It uses **Next.js 14 (App Router)**, **Solidity Smart Contracts (Hardhat)**, **Prisma (PostgreSQL)**, and **ethers.js** to secure land deeds, mutations, and encumbrance checking.

---

## 🚀 Key Features

1. **Aadhaar OTP KYC Gateway (Mock)**:
   Matches unique resident identity databases to secure citizen and officer credentials.
2. **Citizen Registration Wizard**:
   A 4-step workflow: KYC verification -> Property specs -> Dropzone computing client-side SHA-256 deed hashes and IPFS CIDs -> Map boundary drawer.
3. **Govt Registrar approvals Queue**:
   An queue panel where registrars review deeds, authorize title mutations on-chain via MetaMask signers, check Twilio SMS alerts, and inspect overlaps.
4. **Banker Valuations Portal**:
   A verification portal where bankers search land parcels, inspect lien structures, and register financial mortgages (freezing asset transactions).
5. **Dynamic QR Verification**:
   Cryptographic certificate generator showing ledger block timestamps and deed hashes.

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
- **Authentication**: Log in as a resident (`Citizen` / `Registrar` / `Banker`) using Aadhaar OTP simulation (Code: `123456`).
- **Register Property**: Go to the Citizen dashboard, open the registration form, fill details, drop a deed PDF, and click to draw boundary points on the map. Authorize with MetaMask.
- **Transfer Title**: Click "Initiate Transfer" from the Citizen dashboard, input a buyer's Aadhaar and the stamp duty amount.
- **Registrar Approval**: Log in as the Registrar to authorize the pending mutation deed on-chain.
- **Lien Check**: Log in as the Banker, search the parcel ID, and click "Register Lien" to freeze the property from mutations.
