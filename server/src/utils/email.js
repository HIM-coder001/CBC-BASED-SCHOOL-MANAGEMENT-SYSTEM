import nodemailer from "nodemailer";
import prisma from "../../prisma/client.js";

const getTransport = () => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async (to, subject, html, template = "general") => {
  const settings = await prisma.schoolSettings.findFirst();
  if (settings && !settings.emailEnabled) {
    console.log(`[Email:disabled] To ${to}: ${subject}`);
    return { ok: false, status: "DISABLED" };
  }

  const transport = getTransport();
  let status = "SENT";
  let errorMsg = null;

  if (!transport) {
    console.log(`[Email:dev] To ${to}: ${subject}`);
    status = "DEV_LOG";
  } else {
    try {
      await transport.sendMail({
        from: process.env.SMTP_FROM ?? "noreply@schoolhub.ke",
        to,
        subject,
        html,
      });
    } catch (err) {
      status = "FAILED";
      errorMsg = err.message;
    }
  }

  await prisma.notificationLog.create({
    data: {
      channel: "EMAIL",
      recipient: to,
      template,
      status,
      payload: { subject, error: errorMsg },
    },
  });

  return { ok: status === "SENT" || status === "DEV_LOG", status, error: errorMsg };
};
