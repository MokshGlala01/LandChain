import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const cacheDir = path.join(process.cwd(), "cache");
const smsFilePath = path.join(cacheDir, "sms.json");

// Helper to read SMS messages
function readSmsMessages() {
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    if (!fs.existsSync(smsFilePath)) {
      fs.writeFileSync(smsFilePath, JSON.stringify([]));
    }
    const content = fs.readFileSync(smsFilePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading SMS file:", error);
    return [];
  }
}

// Helper to write SMS messages
function writeSmsMessages(messages: any[]) {
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(smsFilePath, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error("Error writing SMS file:", error);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    const messages = readSmsMessages();

    if (phone) {
      const cleanPhone = phone.replace(/[^\d]/g, "");
      const filtered = messages.filter((m: any) => {
        const cleanTo = m.to.replace(/[^\d]/g, "");
        return cleanTo.endsWith(cleanPhone) || cleanPhone.endsWith(cleanTo);
      });
      return NextResponse.json(filtered);
    }

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, from, body: messageBody } = body;

    if (!to || !from || !messageBody) {
      return NextResponse.json({ error: "Missing required fields: to, from, body" }, { status: 400 });
    }

    const messages = readSmsMessages();
    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      to,
      from,
      body: messageBody,
      timestamp: Date.now()
    };

    messages.push(newMessage);
    // Keep only the last 100 messages to prevent infinite file growth
    if (messages.length > 100) {
      messages.shift();
    }
    
    writeSmsMessages(messages);
    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
