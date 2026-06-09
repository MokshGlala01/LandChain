import { prisma } from "./db";

export async function validateApiKey(req: Request): Promise<{ isValid: boolean; institutionName?: string; error?: string }> {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return { isValid: false, error: "Missing x-api-key header" };
    }

    const keyRecord = await prisma.apiKey.findFirst({
      where: {
        keyHash: apiKey,
        active: true,
      },
    });

    if (!keyRecord) {
      return { isValid: false, error: "Invalid API key" };
    }

    // Check rate limits
    if (keyRecord.usageCount >= keyRecord.dailyLimit) {
      return { isValid: false, error: "API key daily rate limit exceeded" };
    }

    // Increment usage count
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });

    return {
      isValid: true,
      institutionName: keyRecord.institutionName,
    };
  } catch (err: any) {
    return { isValid: false, error: err.message };
  }
}
