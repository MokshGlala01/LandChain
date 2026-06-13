import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding LandChain database...");

  // 1. Clean existing records
  await prisma.auditLog.deleteMany({});
  await prisma.transfer.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.aIConversation.deleteMany({});
  await prisma.circleRate.deleteMany({});
  await prisma.stampDutyRate.deleteMany({});
  await prisma.watchlistAlert.deleteMany({});
  await prisma.bankWebhook.deleteMany({});
  await prisma.nominee.deleteMany({});
  await prisma.will.deleteMany({});
  await prisma.apiKey.deleteMany({});
  await prisma.flat.deleteMany({});
  await prisma.society.deleteMany({});
  await prisma.carbonParcel.deleteMany({});
  await prisma.userDevice.deleteMany({});
  await prisma.publicNotice.deleteMany({});
  await prisma.agriculturalDetails.deleteMany({});

  // 2. Create Users
  const citizen = await prisma.user.create({
    data: {
      aadhaarHash: "aadhaar_123456789012", // mock Aadhaar prefix for "1234 5678 9012"
      name: "Rohan Sharma",
      phone: "+91 98765 43210",
      email: "rohan.sharma@example.com",
      role: "CITIZEN",
      walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat Account #0
      dob: new Date("1990-01-01"),
      gender: "Male",
      address: "Sector 62, Noida, Uttar Pradesh, 201301",
      careOf: "C/O Sharma",
      kycVerifiedAt: new Date(),
    },
  });

  const registrar = await prisma.user.create({
    data: {
      aadhaarHash: "aadhaar_888888888888", // mock Aadhaar prefix for "8888 8888 8888"
      name: "Officer Amit Kumar",
      phone: "+91 99999 88888",
      email: "amit.kumar@gov.in",
      role: "REGISTRAR",
      walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat Account #1
      dob: new Date("1980-04-12"),
      gender: "Male",
      address: "Government Quarters, Sector 2, Noida, Uttar Pradesh, 201301",
      careOf: "C/O India",
      kycVerifiedAt: new Date(),
    },
  });

  const bank = await prisma.user.create({
    data: {
      aadhaarHash: "aadhaar_777777777777", // mock Aadhaar prefix for "7777 7777 7777"
      name: "SBI Verifier Officer",
      phone: "+91 88888 77777",
      email: "verifier.sbi@sbi.co.in",
      role: "BANK",
      walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat Account #2
      dob: new Date("1985-09-25"),
      gender: "Male",
      address: "SBI Building, Shivaji Nagar, Pune, Maharashtra, 411005",
      careOf: "C/O State Bank of India",
      kycVerifiedAt: new Date(),
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
      status: "ACTIVE",
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
      metadata: JSON.stringify({
        parcelId: property.parcelId,
        surveyNumber: property.surveyNumber,
        txHash: property.blockchainTxHash,
      }),
    },
  });

  // 5. Seed Circle Rates
  await prisma.circleRate.createMany({
    data: [
      { state: "Uttar Pradesh", district: "Gautam Buddha Nagar (Noida)", propertyType: "Residential", ratePerSqft: 5000, year: 2026 },
      { state: "Uttar Pradesh", district: "Gautam Buddha Nagar (Noida)", propertyType: "Commercial", ratePerSqft: 12000, year: 2026 },
      { state: "Delhi", district: "South Delhi", propertyType: "Residential", ratePerSqft: 15000, year: 2026 },
      { state: "Delhi", district: "South Delhi", propertyType: "Commercial", ratePerSqft: 35000, year: 2026 },
      { state: "Haryana", district: "Gurugram", propertyType: "Residential", ratePerSqft: 8000, year: 2026 },
      { state: "Haryana", district: "Gurugram", propertyType: "Commercial", ratePerSqft: 18000, year: 2026 },
      { state: "Maharashtra", district: "Mumbai Suburban", propertyType: "Residential", ratePerSqft: 18000, year: 2026 },
      { state: "Maharashtra", district: "Mumbai Suburban", propertyType: "Commercial", ratePerSqft: 40000, year: 2026 },
    ]
  });

  // 6. Seed Stamp Duty Rates
  await prisma.stampDutyRate.createMany({
    data: [
      { state: "Uttar Pradesh", propertyType: "Residential", relationship: "unrelated", dutyPercent: 7.0, regFeePercent: 1.0 },
      { state: "Uttar Pradesh", propertyType: "Residential", relationship: "family", dutyPercent: 2.0, regFeePercent: 1.0 },
      { state: "Delhi", propertyType: "Residential", relationship: "unrelated", dutyPercent: 6.0, regFeePercent: 1.0 },
      { state: "Delhi", propertyType: "Residential", relationship: "family", dutyPercent: 3.0, regFeePercent: 1.0 },
      { state: "Haryana", propertyType: "Residential", relationship: "unrelated", dutyPercent: 5.0, regFeePercent: 1.0 },
      { state: "Haryana", propertyType: "Residential", relationship: "family", dutyPercent: 2.0, regFeePercent: 1.0 },
      { state: "Maharashtra", propertyType: "Residential", relationship: "unrelated", dutyPercent: 6.0, regFeePercent: 1.0 },
      { state: "Maharashtra", propertyType: "Residential", relationship: "family", dutyPercent: 3.0, regFeePercent: 1.0 },
    ]
  });

  // 7. Seed API Keys
  await prisma.apiKey.create({
    data: {
      keyHash: "key_mock_sbi_12345",
      institutionName: "State Bank of India",
      role: "BANK",
      dailyLimit: 2000,
      active: true,
    }
  });

  // 8. Seed Agricultural Details
  await prisma.agriculturalDetails.create({
    data: {
      parcelId: "PARCEL-4902-881",
      cropHistory: JSON.stringify([
        { season: "Kharif 2024", crop: "Paddy", yieldTons: 4.5 },
        { season: "Rabi 2024", crop: "Wheat", yieldTons: 3.8 },
      ]),
      soilType: "Alluvial Clay",
      irrigationSource: "Tubewell & Canal",
      productivityScore: 8.5,
      currentCrop: "Paddy",
      pmKisanBeneficiary: true,
    }
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
