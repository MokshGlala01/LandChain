import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cacheSet } from "@/lib/auth-cache";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const aadhaarHashParam = searchParams.get("aadhaarHash");
    const aadhaar = searchParams.get("aadhaar");

    // If looking up by pre-computed hash, return user details immediately (used by AuthProvider sync)
    if (aadhaarHashParam) {
      const user = await prisma.user.findUnique({
        where: { aadhaarHash: aadhaarHashParam },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
        kycStatus: user.kycStatus,
        aadhaarHash: user.aadhaarHash
      });
    }

    if (!aadhaar) {
      return NextResponse.json(
        { error: "Missing required query parameter: aadhaar or aadhaarHash." },
        { status: 400 }
      );
    }

    const cleanAadhaar = aadhaar.replace(/\s/g, "");
    const aadhaarHash = "aadhaar_" + cleanAadhaar;

    // Cloned Aadhaar database register (maps Aadhaar UIDs to their registered phone numbers)
    const aadhaarPhoneDb: Record<string, string> = {
      "123456789012": "+91 98765 43210",
      "461652059015": "+91 99672 38191",
      "888888888888": "+91 99999 88888",
      "777777777777": "+91 88888 77777"
    };

    const user = await prisma.user.findUnique({
      where: { aadhaarHash },
    });

    const rawPhone = user?.phone || 
                     aadhaarPhoneDb[cleanAadhaar] || 
                     `+91 99999 ${cleanAadhaar.slice(-5)}`;

    // Mask phone number
    let maskedPhone = "+91 ******8888";
    if (rawPhone && rawPhone.length > 4) {
      const cleanPhone = rawPhone.replace(/\s/g, "");
      const lastFour = cleanPhone.substring(cleanPhone.length - 4);
      const prefix = rawPhone.startsWith("+") ? rawPhone.substring(0, 3) + " " : "";
      maskedPhone = `${prefix}******${lastFour}`;
    }

    // Generate simulated/mock OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await cacheSet(`aadhaar_otp:${cleanAadhaar}`, otp, 300); // 5 mins expiry

    // Write simulated SMS notification to cache/sms.json
    try {
      const cacheDir = path.join(process.cwd(), "cache");
      const smsFilePath = path.join(cacheDir, "sms.json");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      let smsLogs = [];
      if (fs.existsSync(smsFilePath)) {
        try {
          smsLogs = JSON.parse(fs.readFileSync(smsFilePath, "utf8"));
        } catch (_) {}
      }
      const targetPhone = rawPhone.replace(/[^\d+]/g, "");
      smsLogs.push({
        id: Math.random().toString(36).substr(2, 9),
        to: targetPhone,
        from: "UIDAI",
        body: `Your secure Aadhaar verification OTP is ${otp}. Valid for 5 minutes. (LandChain Portal)`,
        timestamp: Date.now()
      });
      if (smsLogs.length > 100) smsLogs.shift();
      fs.writeFileSync(smsFilePath, JSON.stringify(smsLogs, null, 2));
      console.log(`[SMS Emulator] Logged OTP ${otp} to phone number ${targetPhone}`);
    } catch (e) {
      console.error("Failed to write SMS log:", e);
    }

    return NextResponse.json({
      id: user?.id ?? "temp-aadhaar-id",
      name: user?.name ?? "Google User",
      role: user?.role ?? "CITIZEN",
      phone: maskedPhone,
      simulatedOtp: otp, // visible on the current using device
    });
  } catch (error: any) {
    console.error("Error in GET /api/user/lookup:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during user lookup." },
      { status: 500 }
    );
  }
}
