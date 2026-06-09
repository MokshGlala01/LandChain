import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { parcelId, eventType, message } = await req.json();

    if (!parcelId || !eventType || !message) {
      return NextResponse.json({ error: "Missing parcelId, eventType, or message" }, { status: 400 });
    }

    // Find all watchlists containing this parcel
    const watchlists = await prisma.watchlistAlert.findMany({
      where: {
        parcelId,
        active: true,
      },
    });

    let count = 0;
    for (const item of watchlists) {
      // Check if user subscribed to this event type
      const types = item.alertTypes.split(",").map(t => t.trim());
      if (types.includes(eventType) || types.includes("all")) {
        // Find user details
        const user = await prisma.user.findUnique({
          where: { id: item.userId },
        });

        if (user) {
          // Resolve device token if any
          const device = await prisma.userDevice.findFirst({
            where: { userId: user.id },
          });

          // Dispatch notification
          await sendNotification(
            user.id,
            { sms: true, email: true, whatsapp: true, push: !!device },
            `LandChain Watchlist Alert: ${eventType.toUpperCase()}`,
            message,
            {
              phone: user.phone || undefined,
              emailAddress: user.email || undefined,
              expoPushToken: device?.expoPushToken || undefined,
            }
          );
          count++;
        }
      }
    }

    return NextResponse.json({ success: true, alertsSent: count });
  } catch (error: any) {
    console.error("[Trigger Alerts Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to trigger alerts" }, { status: 500 });
  }
}
