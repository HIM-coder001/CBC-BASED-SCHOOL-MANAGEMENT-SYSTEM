import { sendSMS, getSmsSettings } from "./sms.js";
import { sendEmail } from "./email.js";
import prisma from "../../prisma/client.js";

export const notifyParent = async ({ studentId, smsBody, emailSubject, emailHtml, template }) => {
  const student = await prisma.student.findUnique({
    where: { id: Number(studentId) },
    include: { parent: true },
  });
  if (!student?.parent) return;

  const smsSettings = await getSmsSettings();
  if (smsSettings.enabled && student.parent.phone && smsBody) {
    await sendSMS(student.parent.phone, smsBody, template);
  }
  if (student.parent.email && emailSubject) {
    await sendEmail(student.parent.email, emailSubject, emailHtml ?? smsBody, template);
  }
};

export const notifyAbsence = async (studentId, date, status) => {
  const smsSettings = await getSmsSettings();
  if (!smsSettings.enabled || !smsSettings.absenceAlerts) return;

  const student = await prisma.student.findUnique({
    where: { id: Number(studentId) },
    include: { parent: true, class: true },
  });
  if (!student?.parent?.phone) return;

  const dateStr = new Date(date).toLocaleDateString("en-KE");
  const msg = `SchoolHub: ${student.fullName} (${student.class?.name ?? "class"}) was marked ${status} on ${dateStr}. Contact the school for details.`;
  await sendSMS(student.parent.phone, msg, "absence_alert");
};

export const notifyPaymentReceived = async (payment) => {
  const student = await prisma.student.findUnique({
    where: { id: payment.studentId },
    include: { parent: true },
  });
  if (!student?.parent?.phone) return;

  const msg = `SchoolHub: Fee payment of KES ${payment.amount} received for ${student.fullName}. Ref: ${payment.mpesaRef ?? payment.id}. Thank you.`;
  await sendSMS(student.parent.phone, msg, "payment_receipt");
};
