async function sendTwilioSms(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.log(`[Twilio SMS Bypass] Mock SMS to ${to}: ${body}`);
    return false;
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams({
          To: to,
          From: from,
          Body: body,
        }).toString(),
      }
    );
    return response.ok;
  } catch (error) {
    console.error("[Twilio SMS Dispatch Exception]:", error);
    return false;
  }
}

export async function sendNotification(
  userId: string,
  channels: { sms?: boolean; email?: boolean; whatsapp?: boolean; push?: boolean },
  title: string,
  message: string,
  meta?: { phone?: string; emailAddress?: string; expoPushToken?: string }
) {
  console.log(`[Notification Engine] Triggered for user ${userId}: "${title}" - "${message}"`);

  // 1. SMS
  if (channels.sms && meta?.phone) {
    console.log(`[Notification Engine] Sending SMS to ${meta.phone}`);
    await sendTwilioSms(meta.phone, `${title}: ${message}`);
  }

  // 2. Email
  if (channels.email && meta?.emailAddress) {
    console.log(`[Notification Engine] Sending Email to ${meta.emailAddress}`);
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "LandChain <noreply@landchain.gov.in>",
            to: meta.emailAddress,
            subject: title,
            html: `<p>${message}</p>`,
          }),
        });
      } catch (err) {
        console.error("[Notification Engine] Resend dispatch error:", err);
      }
    } else {
      console.log(`[Email Bypass] Email mock sent: ${title}`);
    }
  }

  // 3. WhatsApp
  if (channels.whatsapp && meta?.phone) {
    console.log(`[Notification Engine] Sending WhatsApp to ${meta.phone}`);
    const waToken = process.env.WHATSAPP_TOKEN;
    const waPhoneId = process.env.WHATSAPP_PHONE_ID;
    if (waToken && waPhoneId) {
      try {
        await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${waToken}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: meta.phone,
            type: "text",
            text: { body: `${title}\n\n${message}` },
          }),
        });
      } catch (err) {
        console.error("[Notification Engine] WhatsApp dispatch error:", err);
      }
    } else {
      console.log(`[WhatsApp Bypass] WhatsApp mock sent: ${title}`);
    }
  }

  // 4. Expo Push
  if (channels.push && meta?.expoPushToken) {
    console.log(`[Notification Engine] Sending Push to token ${meta.expoPushToken}`);
    try {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: meta.expoPushToken,
          sound: "default",
          title: title,
          body: message,
        }),
      });
    } catch (err) {
      console.error("[Notification Engine] Expo Push error:", err);
    }
  }
}
