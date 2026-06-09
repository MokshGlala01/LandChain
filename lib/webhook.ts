import { prisma } from "./db";
import CryptoJS from "crypto-js";

export async function triggerBankWebhooks(event: string, payload: any) {
  try {
    // Fetch active webhooks
    const webhooks = await prisma.bankWebhook.findMany({
      where: { active: true },
    });

    for (const webhook of webhooks) {
      // Check subscription
      const events = webhook.subscribedEvents.split(",").map(e => e.trim());
      if (events.includes(event) || events.includes("*")) {
        // Compute SHA-256 HMAC signature using secret
        const signature = CryptoJS.HmacSHA256(JSON.stringify(payload), webhook.secret).toString();

        console.log(`[Webhook] Dispatching event '${event}' to ${webhook.url}`);
        
        // Fire request asynchronously
        fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-LandChain-Signature": signature,
            "X-LandChain-Event": event,
          },
          body: JSON.stringify(payload),
        }).catch(err => {
          console.error(`[Webhook Error] Failed to deliver webhook to ${webhook.url}:`, err);
        });
      }
    }
  } catch (error) {
    console.error("[Webhook Error] Error during webhook dispatching:", error);
  }
}
