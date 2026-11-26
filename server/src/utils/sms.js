import axios from "axios";
import prisma from "../../prisma/client.js";

const AT_URL = "https://api.africastalking.com/version1/messaging";

export const sendSMS = async (phone, message, template = "general") => {
  const normalized = normalizePhone(phone);
  if (!normalized) return { ok: false, error: "Invalid phone" };

  const username = process.env.SMS_USERNAME ?? "sandbox";
  const apiKey = process.env.SMS_API_KEY;
  const sender = process.env.SMS_SENDER_ID ?? "SchoolHub";

  let status = "SENT";
  let errorMsg = null;

  if (!apiKey) {
    console.log(`[SMS:dev] To ${normalized}: ${message}`);
    status = "DEV_LOG";
  } else {
    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("to", normalized);
      params.append("message", message);
      if (sender) params.append("from", sender);

      await axios.post(AT_URL, params, {
        headers: {
          apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      });
    } catch (err) {
      status = "FAILED";
      errorMsg = err.response?.data?.SMSMessageData?.Message ?? err.message;
    }
  }

  await prisma.notificationLog.create({
    data: {
      channel: "SMS",
      recipient: normalized,
      template,
      status,
      payload: { message, error: errorMsg },
    },
  });

  return { ok: status === "SENT" || status === "DEV_LOG", status, error: errorMsg };
};

export const normalizePhone = (phone) => {
  if (!phone) return null;
  let p = String(phone).replace(/\s/g, "");
  if (p.startsWith("0")) p = "254" + p.slice(1);
  if (p.startsWith("+")) p = p.slice(1);
  if (!p.startsWith("254")) p = "254" + p;
  return p.length >= 12 ? p : null;
};

export const getSmsSettings = async () => {
  const s = await prisma.schoolSettings.findFirst();
  return {
    enabled: s?.smsEnabled ?? false,
    absenceAlerts: s?.smsAbsenceAlerts ?? true,
    feeReminders: s?.smsFeeReminders ?? true,
    reportCardAlerts: s?.smsReportCardAlerts ?? false,
  };
};
