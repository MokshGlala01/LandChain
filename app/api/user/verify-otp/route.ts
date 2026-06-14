import { NextResponse } from "next/server";
import { cacheGet } from "@/lib/auth-cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { aadhaar, otp } = body;

    if (!aadhaar || !otp) {
      return NextResponse.json(
        { error: "Missing required fields: aadhaar and otp are required." },
        { status: 400 }
      );
    }

    const cleanAadhaar = aadhaar.replace(/\s/g, "");
    
    // Verify OTP using the cache store
    const expectedOtp = await cacheGet(`aadhaar_otp:${cleanAadhaar}`);
    const isValid = expectedOtp && expectedOtp === otp;

    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect or expired OTP. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in POST /api/user/verify-otp:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during OTP verification." },
      { status: 500 }
    );
  }
}
