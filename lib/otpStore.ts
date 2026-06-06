type OtpRecord = {
  otp: string;
  expiresAt: number;
};

const globalForOtp = global as unknown as {
  otpCache: Map<string, OtpRecord>;
};

if (!globalForOtp.otpCache) {
  globalForOtp.otpCache = new Map<string, OtpRecord>();
}

export const otpCache = globalForOtp.otpCache;

export function generateOtp(): string {
  // Generate a random 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function saveOtp(aadhaar: string, otp: string) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
  const cleanAadhaar = aadhaar.replace(/\s/g, "");
  otpCache.set(cleanAadhaar, { otp, expiresAt });
  console.log(`[OTP Store] Saved OTP ${otp} for Aadhaar ${cleanAadhaar}. Expires in 5m.`);
}

export function verifyOtp(aadhaar: string, enteredOtp: string): boolean {
  const cleanAadhaar = aadhaar.replace(/\s/g, "");
  const record = otpCache.get(cleanAadhaar);
  if (!record) {
    console.log(`[OTP Store] No record found for Aadhaar ${cleanAadhaar}`);
    return false;
  }
  
  if (Date.now() > record.expiresAt) {
    console.log(`[OTP Store] OTP for Aadhaar ${cleanAadhaar} has expired`);
    otpCache.delete(cleanAadhaar);
    return false;
  }
  
  const isValid = record.otp === enteredOtp;
  if (isValid) {
    console.log(`[OTP Store] OTP verification successful for Aadhaar ${cleanAadhaar}`);
    otpCache.delete(cleanAadhaar); // Single-use OTP
  } else {
    console.log(`[OTP Store] OTP mismatch for Aadhaar ${cleanAadhaar}. Entered: ${enteredOtp}, Expected: ${record.otp}`);
  }
  return isValid;
}
