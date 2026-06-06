import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST: register new user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { aadhaar, name, phone, email, role, walletAddress } = body;

    if (!aadhaar || !name || !phone || !role) {
      return NextResponse.json(
        { error: "Missing required fields: aadhaar, name, phone, and role are required." },
        { status: 400 }
      );
    }

    // Format Aadhaar to mock hash
    const formattedAadhaar = aadhaar.replace(/\s/g, "");
    const aadhaarHash = "aadhaar_" + formattedAadhaar;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { aadhaarHash },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A resident with this Aadhaar Number is already registered in the system." },
        { status: 409 }
      );
    }

    // Create user record in PostgreSQL
    const user = await prisma.user.create({
      data: {
        aadhaarHash,
        name,
        phone,
        email: email || null,
        role,
        walletAddress: walletAddress || null,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/user/register:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while registering user." },
      { status: 500 }
    );
  }
}
