export function normalizePhoneNumber(phone: string): string {
  const clean = phone.replace(/[^\d+]/g, ""); // Keep only digits and plus sign
  if (clean.startsWith("+")) {
    return clean;
  }
  // Default to +91 (India) if it's a standard 10-digit number
  if (clean.length === 10) {
    return `+91${clean}`;
  }
  // Otherwise, prepend plus assuming the country code is already part of the input
  return `+${clean}`;
}

export async function sendTwilioSms(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.log("[SMS Bypass] Twilio env variables are not fully configured. Falling back to simulation mode.");
    return false;
  }

  const normalizedTo = normalizePhoneNumber(to);
  const normalizedFrom = normalizePhoneNumber(from);

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
          To: normalizedTo,
          From: normalizedFrom,
          Body: body,
        }).toString(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Twilio SMS Dispatch Failed]:", errorText);
      return false;
    }

    console.log(`[Twilio SMS Dispatch Success]: OTP sent to ${normalizedTo}`);
    return true;
  } catch (error) {
    console.error("[Twilio SMS Dispatch Exception]:", error);
    return false;
  }
}
