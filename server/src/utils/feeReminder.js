import cron from "node-cron";
import prisma from "../../prisma/client.js";
import { sendSMS, getSmsSettings } from "./sms.js";

// Runs every Monday at 7:00 AM (server local time)
// Sends an inbox message to parents of students with outstanding fee balances

export const startFeeReminderJob = () => {
  cron.schedule("0 7 * * 1", async () => {
    console.log("[Fee Reminder] Running Monday 7am arrears check...");

    try {
      const now = new Date();
      const term = getCurrentTerm();
      const year = now.getFullYear();

      // Get all students with a parent linked
      const students = await prisma.student.findMany({
        where: { parentId: { not: null } },
        include: {
          class: true,
          parent: { include: { user: true } },
        },
      });

      const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      if (!adminUser) return;

      const smsSettings = await getSmsSettings();
      let sent = 0;

      for (const student of students) {
        if (!student.class?.grade || !student.parent?.userId) continue;

        // Get fee structure for this grade/term/year
        const structure = await prisma.feeStructure.findUnique({
          where: { grade_term_year: { grade: student.class.grade, term, year } },
        });
        if (!structure) continue;

        // Sum completed payments
        const payments = await prisma.feePayment.findMany({
          where: { studentId: student.id, term, year, status: "COMPLETED" },
        });
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const balance   = structure.amount - totalPaid;

        if (balance <= 0) continue; // fully paid — skip

        // Send message to parent's inbox
        await prisma.message.create({
          data: {
            subject: `Fee Arrears Reminder — ${student.fullName}`,
            content: `Dear ${student.parent.fullName},\n\nThis is a reminder that ${student.fullName} (${student.admissionNo}) has an outstanding fee balance of KES ${balance.toLocaleString()} for Term ${term} ${year}.\n\nTotal fees: KES ${structure.amount.toLocaleString()}\nAmount paid: KES ${totalPaid.toLocaleString()}\nBalance due: KES ${balance.toLocaleString()}\n\nPlease make payment at your earliest convenience. You can pay via M-Pesa through the Parent Portal.\n\nThank you.`,
            senderId: adminUser.id,
            recipientId: student.parent.userId,
            messageType: "ANNOUNCEMENT",
          },
        });

        if (smsSettings.enabled && smsSettings.feeReminders && student.parent.phone) {
          await sendSMS(
            student.parent.phone,
            `SchoolHub: ${student.fullName} has KES ${balance.toLocaleString()} fees balance for Term ${term}. Pay via Parent Portal.`,
            "fee_reminder"
          );
        }

        sent++;
      }

      console.log(`[Fee Reminder] Sent ${sent} arrears reminder(s).`);
    } catch (err) {
      console.error("[Fee Reminder] Error:", err.message);
    }
  });

  console.log("[Fee Reminder] Monday 7am cron job scheduled.");
};

// Determine current term based on month (Kenya CBC calendar)
function getCurrentTerm() {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 1 && month <= 4)  return "1"; // Jan–Apr
  if (month >= 5 && month <= 8)  return "2"; // May–Aug
  return "3";                                 // Sep–Dec
}
