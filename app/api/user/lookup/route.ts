import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOtp, saveOtp } from "@/lib/otpStore";
import { sendTwilioSms } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const aadhaar = searchParams.get("aadhaar");

    if (!aadhaar) {
      return NextResponse.json(
        { error: "Missing required query parameter: aadhaar." },
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

    // Mask phone number: e.g. +91 98765 43210 -> +91 ******3210
    const rawPhone = user.phone;
    let maskedPhone = rawPhone;
    if (rawPhone && rawPhone.length > 4) {
      const cleanPhone = rawPhone.replace(/\s/g, "");
      const lastFour = cleanPhone.substring(cleanPhone.length - 4);
      const prefix = rawPhone.startsWith("+") ? rawPhone.substring(0, 3) + " " : "";
      maskedPhone = `${prefix}******${lastFour}`;
    }

    // 1. Generate new dynamic OTP
    const otp = generateOtp();

    // 2. Save OTP to global cache
    saveOtp(cleanAadhaar, otp);

    // 3. Dispatch SMS via Twilio
    const messageBody = `LandChain Verification: Your Aadhaar Secure OTP is ${otp}. Valid for 5 minutes. Do not share this code.`;
    const sentRealSms = await sendTwilioSms(rawPhone, messageBody);

    // 4. If SMS could not be sent (Twilio not configured), return the simulated OTP for offline display
    const simulatedOtp = sentRealSms ? null : otp;

    return NextResponse.json({
      name: user.name,
      role: user.role,
      phone: maskedPhone,
      simulatedOtp,
    });
  } catch (error: any) {
    console.error("Error in GET /api/user/lookup:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during user lookup." },
      { status: 500 }
    );
  }
}
