import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const user = await getSessionUser(req);
    const userId = user?.id || null;

    let responseText = "";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
        const anthropic = new Anthropic({ apiKey });
        const response = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1024,
          system: `You are the LandChain AI Legal Assistant, a premier legal expert on Indian land laws, including the Registration Act 1908, the Transfer of Property Act 1882, and the Real Estate (Regulation and Development) Act (RERA) 2016. Provide clear, professional, and accurate guidance on land registration, title verification, stamp duties, deeds, and land mutations. Keep your responses structured and easy to read.`,
          messages: messages.map((m: any) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })),
        });

        const block = response.content[0];
        if (block && "text" in block) {
          responseText = block.text;
        }
      } catch (err: any) {
        console.error("[Claude API Error] Failing back to simulated assistant:", err.message);
      }
    }

    // Fallback simulated legal responses if API key is not present or failed
    if (!responseText) {
      const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
      if (lastUserMsg.includes("rera")) {
        responseText = "Under the Real Estate (Regulation and Development) Act (RERA) 2016, all commercial and residential projects with land area exceeding 500 sq meters or containing more than 8 apartments must be registered with the respective State RERA authority before marketing or selling. Section 13 strictly prohibits promoters from accepting more than 10% of the apartment cost as application fee without signing a formal agreement for sale.";
      } else if (lastUserMsg.includes("registration") || lastUserMsg.includes("deed") || lastUserMsg.includes("1908")) {
        responseText = "According to Section 17 of the Registration Act 1908, all documents creating, declaring, assigning, limiting, or extinguishing rights over immovable property of value above Rs 100 must be registered. Failure to register renders the document inadmissible as evidence under Section 49.";
      } else if (lastUserMsg.includes("transfer") || lastUserMsg.includes("1882") || lastUserMsg.includes("sale")) {
        responseText = "Under Section 54 of the Transfer of Property Act 1882, the transfer of ownership of tangible immovable property of value Rs 100 and upwards can only be made by a registered instrument. Oral agreements or unregistered agreements do not constitute ownership transfers.";
      } else {
        responseText = "Greetings from the LandChain Legal Portal. How can I assist you today? I can help with queries regarding the Registration Act 1908 (Section 17/49), Transfer of Property Act 1882, or RERA 2016 compliance guidelines.";
      }
    }

    // Save to AIConversation table
    const conversation = await prisma.aIConversation.create({
      data: {
        userId,
        messages: JSON.stringify([...messages, { role: "assistant", content: responseText }]),
      },
    });

    return NextResponse.json({
      id: conversation.id,
      reply: responseText,
    });
  } catch (error: any) {
    console.error("[AI Chat Exception]:", error);
    return NextResponse.json({ error: error.message || "Failed to process chat" }, { status: 500 });
  }
}
