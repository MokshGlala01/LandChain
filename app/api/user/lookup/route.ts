import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cacheSet } from "@/lib/auth-cache";

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

    const user = await prisma.user.findUnique({
      where: { aadhaarHash },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Aadhaar Number is not registered in the system. Please register first." },
        { status: 404 }
      );
    }

    // Mask phone number
    const rawPhone = user.phone;
    let maskedPhone = rawPhone;
    if (rawPhone && rawPhone.length > 4) {
      const cleanPhone = rawPhone.replace(/\s/g, "");
      const lastFour = cleanPhone.substring(cleanPhone.length - 4);
      const prefix = rawPhone.startsWith("+") ? rawPhone.substring(0, 3) + " " : "";
      maskedPhone = `${prefix}******${lastFour}`;
    }

    // Generate simulated/mock OTP
    const otp = "123456";
    await cacheSet(`aadhaar_otp:${cleanAadhaar}`, otp, 300); // 5 mins expiry

    return NextResponse.json({
      id: user.id,
      name: user.name,
      role: user.role,
      phone: maskedPhone,
      simulatedOtp: otp,
    });
  } catch (error: any) {
    console.error("Error in GET /api/user/lookup:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during user lookup." },
      { status: 500 }
    );
  }
}
