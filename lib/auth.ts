import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Aadhaar OTP",
      credentials: {
        aadhaar: { label: "Aadhaar Number", type: "text" },
        otp: { label: "OTP", type: "text" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.aadhaar || !credentials?.otp) return null;
        
        // Mock verification: standard mock OTP is "123456"
        if (credentials.otp !== "123456" && credentials.otp !== "1234") {
          return null;
        }

        const role = credentials.role || "CITIZEN";
        const aadhaar = credentials.aadhaar.toString().replace(/\s/g, "");
        const mockHash = "aadhaar_" + aadhaar;

        return {
          id: "usr_" + Math.random().toString(36).substring(2, 9),
          name: role === "REGISTRAR" ? "Officer Amit Kumar" : role === "BANK" ? "SBI Verifier Officer" : "Rohan Sharma",
          email: role === "REGISTRAR" ? "amit.kumar@gov.in" : role === "BANK" ? "verifier.sbi@sbi.co.in" : "rohan.sharma@example.com",
          role: role,
          aadhaarHash: mockHash,
        } as any;
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.aadhaarHash = (user as any).aadhaarHash;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).aadhaarHash = token.aadhaarHash;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
});

/**
 * Resilient helper to retrieve server session in API routes.
 * Checks NextAuth session first, then falls back to a cookie session for absolute compatibility during testing.
 */
export async function getSessionUser(req?: Request) {
  try {
    const session = await auth();
    if (session?.user) {
      return session.user;
    }
  } catch (err) {
    console.warn("NextAuth session check failed, falling back to header/cookie session.");
  }

  // Fallback: check cookie for mock testing
  if (req) {
    try {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/landchain_user=([^;]+)/);
      if (match) {
        return JSON.parse(decodeURIComponent(match[1]));
      }
    } catch (_) {}
  }
  
  return null;
}
