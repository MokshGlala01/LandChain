import { cacheSet, cacheGet } from "@/lib/auth-cache";

const cleanEnvVar = (val: string | undefined) => {
  if (!val) return null;
  const cleaned = val.replace(/['"]/g, "").trim();
  return cleaned === "" ? null : cleaned;
};

export function normalizePhoneNumber(phone: string): string {
  const clean = phone.replace(/[^\d+]/g, ""); // Keep only digits and plus sign
  if (clean.startsWith("+")) {
    return clean;
  }
  // Default to +91 (India) if it's a standard 10-digit number
  if (clean.length === 10) {
    return `+91${clean}`;
  }
  return `+${clean}`;
}

export async function sendTwilioSms(to: string, body: string): Promise<boolean> {
  const accountSid = cleanEnvVar(process.env.TWILIO_ACCOUNT_SID);
  const authToken = cleanEnvVar(process.env.TWILIO_AUTH_TOKEN);
  const from = cleanEnvVar(process.env.TWILIO_PHONE_NUMBER);

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

export async function sendOtp(mobile: string): Promise<{ success: boolean; isMock?: boolean; otp?: string }> {
  // 1. Try Twilio Verify API
  const verifyServiceSid = cleanEnvVar(process.env.TWILIO_VERIFY_SERVICE_SID);
  const accountSid = cleanEnvVar(process.env.TWILIO_ACCOUNT_SID);
  const authToken = cleanEnvVar(process.env.TWILIO_AUTH_TOKEN);
  const twilioFrom = cleanEnvVar(process.env.TWILIO_PHONE_NUMBER);

  if (verifyServiceSid && accountSid && authToken) {
    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const res = await fetch(`https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams({
          To: `+91${mobile}`,
          Channel: "sms",
        }).toString(),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: data.status === "pending" };
      } else {
        const err = await res.text();
        console.error("[Twilio Verify Send Failed]:", err);
      }
    } catch (e) {
      console.error("[Twilio Verify Exception]:", e);
    }
  } else if (accountSid && authToken && twilioFrom) {
    // 2. Fallback to standard Twilio SMS (non-Verify service)
    try {
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const body = `LandChain Verification: Your secure OTP code is ${mockOtp}. Valid for 10 minutes.`;
      const sent = await sendTwilioSms(mobile, body);
      if (sent) {
        await cacheSet(`sms_otp:${mobile}`, mockOtp, 600); // 10 mins expiry
        console.log(`[Twilio Standard SMS] OTP code ${mockOtp} sent to mobile number +91${mobile}`);
        return { success: true, isMock: false, otp: mockOtp };
      } else {
        console.error("[Twilio Standard SMS Send Failed]: sendTwilioSms returned false");
      }
    } catch (e) {
      console.error("[Twilio Standard SMS Exception]:", e);
    }
  }

  // 3. Try MSG91 OTP API
  const msg91AuthKey = cleanEnvVar(process.env.MSG91_AUTH_KEY);
  const msg91TemplateId = cleanEnvVar(process.env.MSG91_TEMPLATE_ID);

  if (msg91AuthKey && msg91TemplateId) {
    try {
      const res = await fetch(`https://control.msg91.com/api/v5/otp?template_id=${msg91TemplateId}&mobile=91${mobile}`, {
        method: "POST",
        headers: { authkey: msg91AuthKey },
      });

      if (res.ok) {
        const data = await res.json();
        return { success: data.type === "success" };
      } else {
        const err = await res.text();
        console.error("[MSG91 Send Failed]:", err);
      }
    } catch (e) {
      console.error("[MSG91 Exception]:", e);
    }
  }

  // 4. Fallback to SMS Simulator mode (log to terminal and cache)
  const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
  await cacheSet(`sms_otp:${mobile}`, mockOtp, 600); // 10 minutes expiry
  console.log(`[SMS SIMULATOR] Dispatched OTP code ${mockOtp} to mobile number +91${mobile}`);
  return { success: true, isMock: true, otp: mockOtp };
}

export async function checkOtp(mobile: string, otp: string): Promise<{ success: boolean }> {
  // 1. Try Twilio Verify API
  const verifyServiceSid = cleanEnvVar(process.env.TWILIO_VERIFY_SERVICE_SID);
  const accountSid = cleanEnvVar(process.env.TWILIO_ACCOUNT_SID);
  const authToken = cleanEnvVar(process.env.TWILIO_AUTH_TOKEN);

  if (verifyServiceSid && accountSid && authToken) {
    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const res = await fetch(`https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: new URLSearchParams({
          To: `+91${mobile}`,
          Code: otp,
        }).toString(),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: data.status === "approved" };
      } else {
        const err = await res.text();
        console.error("[Twilio Verify Check Failed]:", err);
      }
    } catch (e) {
      console.error("[Twilio Verify Exception]:", e);
    }
  }

  // 2. Try MSG91 OTP API
  const msg91AuthKey = cleanEnvVar(process.env.MSG91_AUTH_KEY);

  if (msg91AuthKey) {
    try {
      const res = await fetch(`https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${mobile}`, {
        method: "GET",
        headers: { authkey: msg91AuthKey },
      });

      if (res.ok) {
        const data = await res.json();
        return { success: data.type === "success" };
      } else {
        const err = await res.text();
        console.error("[MSG91 Check Failed]:", err);
      }
    } catch (e) {
      console.error("[MSG91 Exception]:", e);
    }
  }

  // 3. Fallback to SMS Simulator cache check (which standard Twilio SMS fallback also uses)
  const expected = await cacheGet(`sms_otp:${mobile}`);
  if (expected && expected === otp) {
    return { success: true };
  }

  return { success: false };
}
