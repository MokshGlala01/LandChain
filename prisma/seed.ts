import { PrismaClient, Role, PropertyStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding LandChain database...");

  // 1. Clean existing records
  await prisma.auditLog.deleteMany({});
  await prisma.transfer.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const citizen = await prisma.user.create({
    data: {
      aadhaarHash: "e5ac3a76384ad1eb83c318287f3b8f10738a9d9b4b008d1e345f778a48721fa6", // mock SHA-256 for "1234 5678 9012"
      name: "Rohan Sharma",
      phone: "+91 98765 43210",
      email: "rohan.sharma@example.com",
      role: Role.CITIZEN,
      walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat Account #0
    },
  });

  const registrar = await prisma.user.create({
    data: {
      aadhaarHash: "fe823b72382ad1eb83c318287f3b8f10738a9d9b4b008d1e345f778a48721fb5", // mock SHA-256 for "8888 8888 8888"
      name: "Officer Amit Kumar",
      phone: "+91 99999 88888",
      email: "amit.kumar@gov.in",
      role: Role.REGISTRAR,
      walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat Account #1
    },
  });

  const bank = await prisma.user.create({
    data: {
      aadhaarHash: "ba723b72382ad1eb83c318287f3b8f10738a9d9b4b008d1e345f778a48721fc6", // mock SHA-256 for "7777 7777 7777"
      name: "SBI Verifier Officer",
      phone: "+91 88888 77777",
      email: "verifier.sbi@sbi.co.in",
      role: Role.BANK,
      walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat Account #2
    },
  });

  console.log(`Users seeded:
    - Citizen: ${citizen.name} (${citizen.id})
    - Registrar: ${registrar.name} (${registrar.id})
    - Bank Officer: ${bank.name} (${bank.id})`);

  // 3. Create a Property
  const property = await prisma.property.create({
    data: {
      parcelId: "PARCEL-4902-881",
      surveyNumber: "SURVEY-402/12",
      area: 2400.0,
      location: "Sector 62, Noida, Uttar Pradesh",
      latitude: 28.6273,
      longitude: 77.3725,
      ipfsHash: "QmYwAPJzv5CZ1sA5tJcrSjF75b63x5f24F4f8aH1A2S3D4",
      blockchainTxHash: "0x9efb925b42d76eeebc8f1057e937d2f9dfa5367812f45da85642e7c4f4a4d23d",
      ownerId: citizen.id,
      status: PropertyStatus.ACTIVE,
    },
  });

  console.log(`Property seeded: ${property.parcelId} owned by ${citizen.name}`);

  // 4. Create an Audit Log
  await prisma.auditLog.create({
    data: {
      action: "PROPERTY_REGISTERED",
      entityId: property.id,
      entityType: "Property",
      actorId: citizen.id,
      metadata: {
        parcelId: property.parcelId,
        surveyNumber: property.surveyNumber,
        txHash: property.blockchainTxHash,
      },
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
