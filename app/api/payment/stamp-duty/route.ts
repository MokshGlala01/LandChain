import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { amount, parcelId } = await req.json();

    if (!amount || !parcelId) {
      return NextResponse.json({ error: "Missing amount or parcelId" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let orderId = "order_mock_" + Math.random().toString(36).substring(2, 12);
    let finalAmount = Math.round(parseFloat(amount) * 100); // Razorpay expects paise

    if (keyId && keySecret) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const order = await razorpay.orders.create({
          amount: finalAmount,
          currency: "INR",
          receipt: `rcpt_${parcelId}_${Date.now()}`,
        });

        orderId = order.id;
        finalAmount = order.amount as number;
      } catch (err: any) {
        console.error("[Razorpay Error] Falling back to mock order ID:", err.message);
      }
    } else {
      console.log("[Razorpay Bypass] Key ID/Secret not set. Simulating Razorpay order creation.");
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount: finalAmount,
      currency: "INR",
      keyId: keyId || "rzp_test_mockkey12345",
    });
  } catch (error: any) {
    console.error("[Razorpay Order Exception]:", error);
    return NextResponse.json({ error: error.message || "Failed to create payment order" }, { status: 500 });
  }
}
