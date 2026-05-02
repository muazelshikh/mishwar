import { logger } from "./logger";

export type SmsResult = { sent: boolean; provider: string; messageId?: string };

const PROVIDER = process.env.SMS_PROVIDER ?? "console";

export async function sendSms(phone: string, message: string): Promise<SmsResult> {
  if (PROVIDER === "twilio") {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;
    if (!sid || !token || !from) {
      logger.error({ phone }, "SMS_PROVIDER=twilio but credentials missing");
      throw new Error("Twilio credentials not configured");
    }
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const body = new URLSearchParams({ To: phone, From: from, Body: message }).toString();
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${auth}` },
      body,
    });
    if (!r.ok) {
      const text = await r.text();
      logger.error({ phone, status: r.status, text }, "Twilio SMS failed");
      throw new Error(`Twilio failed: ${r.status}`);
    }
    const data: any = await r.json();
    return { sent: true, provider: "twilio", messageId: data.sid };
  }

  if (PROVIDER === "unifonic") {
    const appsid = process.env.UNIFONIC_APP_SID;
    const senderId = process.env.UNIFONIC_SENDER_ID ?? "Mishwar";
    if (!appsid) {
      logger.error({ phone }, "SMS_PROVIDER=unifonic but UNIFONIC_APP_SID missing");
      throw new Error("Unifonic credentials not configured");
    }
    const body = new URLSearchParams({
      AppSid: appsid,
      Recipient: phone,
      Body: message,
      SenderID: senderId,
    }).toString();
    const r = await fetch("https://el.cloud.unifonic.com/rest/SMS/messages", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data: any = await r.json();
    if (data?.success !== "true" && data?.success !== true) {
      logger.error({ phone, data }, "Unifonic SMS failed");
      throw new Error("Unifonic SMS send failed");
    }
    return { sent: true, provider: "unifonic", messageId: data?.data?.MessageID };
  }

  logger.info({ phone, message }, "SMS (console mock — set SMS_PROVIDER to send real messages)");
  return { sent: true, provider: "console" };
}
