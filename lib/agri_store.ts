import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "prisma", "agri_store.json");

export interface ConversionRequest {
  id: string;
  parcelId: string;
  surveyNumber: string;
  ownerName: string;
  area: number;
  currentType: string;
  proposedType: string;
  status: "PENDING_TEHSILDAR" | "PENDING_COLLECTOR" | "PENDING_REVENUE" | "APPROVED" | "REJECTED";
  fee: number;
  paymentStatus: "UNPAID" | "PAID";
  submittedAt: string;
}

export interface PoolParcel {
  parcelId: string;
  area: number;
  ownerName: string;
  consented: boolean;
  compensation: number;
}

export interface PoolingProject {
  id: string;
  name: string;
  purpose: string;
  parcels: PoolParcel[];
  status: "PLANNING" | "CONSENT_STAGE" | "APPROVED" | "COMPLETED";
  createdAt: string;
}

interface AgriStore {
  conversions: ConversionRequest[];
  pools: PoolingProject[];
}

const initialData: AgriStore = {
  conversions: [
    {
      id: "conv-1",
      parcelId: "PARCEL-4902-881",
      surveyNumber: "SURVEY-402/12",
      ownerName: "Rohan Sharma",
      area: 2.4,
      currentType: "Agricultural",
      proposedType: "Residential",
      status: "PENDING_TEHSILDAR",
      fee: 24000,
      paymentStatus: "PAID",
      submittedAt: "2026-06-02T10:00:00.000Z",
    },
    {
      id: "conv-2",
      parcelId: "PARCEL-1002-880",
      surveyNumber: "SURVEY-102/4",
      ownerName: "Devi Lal",
      area: 5.8,
      currentType: "Agricultural",
      proposedType: "Commercial",
      status: "PENDING_COLLECTOR",
      fee: 87000,
      paymentStatus: "PAID",
      submittedAt: "2026-05-28T14:30:00.000Z",
    },
    {
      id: "conv-3",
      parcelId: "PARCEL-2209-411",
      surveyNumber: "SURVEY-209/1A",
      ownerName: "Rajesh Singh",
      area: 1.5,
      currentType: "Agricultural",
      proposedType: "Industrial",
      status: "PENDING_REVENUE",
      fee: 45000,
      paymentStatus: "UNPAID",
      submittedAt: "2026-06-08T09:15:00.000Z",
    },
  ],
  pools: [
    {
      id: "pool-1",
      name: "Greater Noida Smart City Expressway Extension",
      purpose: "Acquisition of adjacent agricultural belts to construct service lanes and green spaces.",
      status: "CONSENT_STAGE",
      createdAt: "2026-05-10T12:00:00.000Z",
      parcels: [
        {
          parcelId: "PARCEL-4902-881",
          area: 2.4,
          ownerName: "Rohan Sharma",
          consented: true,
          compensation: 4800000,
        },
        {
          parcelId: "PARCEL-1002-880",
          area: 5.8,
          ownerName: "Devi Lal",
          consented: false,
          compensation: 11600000,
        },
        {
          parcelId: "PARCEL-2209-411",
          area: 1.5,
          ownerName: "Rajesh Singh",
          consented: true,
          compensation: 3000000,
        },
      ],
    },
  ],
};

function readStore(): AgriStore {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading agri_store.json", err);
    return initialData;
  }
}

function writeStore(data: AgriStore) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing agri_store.json", err);
  }
}

export const agriStore = {
  getConversions: () => readStore().conversions,
  getConversion: (id: string) => readStore().conversions.find((c) => c.id === id),
  addConversion: (conv: Omit<ConversionRequest, "id" | "submittedAt" | "status" | "paymentStatus">) => {
    const store = readStore();
    const newConv: ConversionRequest = {
      ...conv,
      id: "conv-" + (store.conversions.length + 1),
      status: "PENDING_TEHSILDAR",
      paymentStatus: "UNPAID",
      submittedAt: new Date().toISOString(),
    };
    store.conversions.push(newConv);
    writeStore(store);
    return newConv;
  },
  updateConversionStatus: (id: string, status: ConversionRequest["status"]) => {
    const store = readStore();
    const conv = store.conversions.find((c) => c.id === id);
    if (conv) {
      conv.status = status;
      writeStore(store);
    }
    return conv;
  },
  updateConversionPayment: (id: string, paymentStatus: ConversionRequest["paymentStatus"]) => {
    const store = readStore();
    const conv = store.conversions.find((c) => c.id === id);
    if (conv) {
      conv.paymentStatus = paymentStatus;
      writeStore(store);
    }
    return conv;
  },
  getPools: () => readStore().pools,
  getPool: (id: string) => readStore().pools.find((p) => p.id === id),
  addPool: (name: string, purpose: string, parcels: PoolParcel[]) => {
    const store = readStore();
    const newPool: PoolingProject = {
      id: "pool-" + (store.pools.length + 1),
      name,
      purpose,
      parcels,
      status: "PLANNING",
      createdAt: new Date().toISOString(),
    };
    store.pools.push(newPool);
    writeStore(store);
    return newPool;
  },
  toggleParcelConsent: (poolId: string, parcelId: string) => {
    const store = readStore();
    const pool = store.pools.find((p) => p.id === poolId);
    if (pool) {
      const parcel = pool.parcels.find((p) => p.parcelId === parcelId);
      if (parcel) {
        parcel.consented = !parcel.consented;
        writeStore(store);
      }
    }
    return pool;
  },
  updatePoolStatus: (id: string, status: PoolingProject["status"]) => {
    const store = readStore();
    const pool = store.pools.find((p) => p.id === id);
    if (pool) {
      pool.status = status;
      writeStore(store);
    }
    return pool;
  },
};
