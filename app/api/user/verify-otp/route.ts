import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otpStore";

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
    const isValid = verifyOtp(cleanAadhaar, otp);

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
