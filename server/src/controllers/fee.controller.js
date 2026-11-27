import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";
import { initiateSTKPush } from "../utils/mpesa.js";
import { notifyPaymentReceived } from "../utils/notify.js";
import { generateReceiptPDF } from "../utils/pdf/receipt.pdf.js";

 //fee structure

export const createFeeStructure = async (req, res) => {
  try {
    const { grade, term, year, amount, description } = req.body;
    if (!grade || !term || !year || !amount) {
      return error(res, "grade, term, year, and amount are required", 400);
    }
    const structure = await prisma.feeStructure.upsert({
      where: { grade_term_year: { grade, term, year: Number(year) } },
      update: { amount: Number(amount), description },
      create: { grade, term, year: Number(year), amount: Number(amount), description },
    });
    return success(res, structure, "Fee structure saved");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getFeeStructures = async (req, res) => {
  try {
    const structures = await prisma.feeStructure.findMany({
      orderBy: [{ year: "desc" }, { grade: "asc" }, { term: "asc" }],
    });
    return success(res, structures, "Fee structures fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const deleteFeeStructure = async (req, res) => {
  try {
    await prisma.feeStructure.delete({ where: { id: Number(req.params.id) } });
    return success(res, null, "Fee structure deleted");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Record not found", 404);
    return error(res, err.message);
  }
};

// ── FEE PAYMENTS ──────────────────────────────────────────────────────────

// Admin records a manual payment (cash/bank)
export const recordPayment = async (req, res) => {
  try {
    const { studentId, amount, method, mpesaRef, notes, term, year } = req.body;
    if (!studentId || !amount || !term || !year) {
      return error(res, "studentId, amount, term, and year are required", 400);
    }
    const payment = await prisma.feePayment.create({
      data: {
        studentId: Number(studentId),
        amount: Number(amount),
        method: method ?? "CASH",
        mpesaRef,
        notes,
        term,
        year: Number(year),
        status: "COMPLETED",
        recordedById: req.user.id,
      },
      include: { student: true },
    });
    await syncInvoice(Number(studentId), term, Number(year));
    notifyPaymentReceived(payment).catch(() => {});
    return success(res, payment, "Payment recorded");
  } catch (err) {
    return error(res, err.message);
  }
};

const syncInvoice = async (studentId, term, year) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true },
  });
  if (!student?.class?.grade) return;

  const structure = await prisma.feeStructure.findUnique({
    where: { grade_term_year: { grade: student.class.grade, term, year } },
  });
  if (!structure) return;

  const payments = await prisma.feePayment.findMany({
    where: { studentId, term, year, status: "COMPLETED" },
  });
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
  const amountDue = Number(structure.amount);
  const status = totalPaid >= amountDue ? "PAID" : totalPaid > 0 ? "PARTIAL" : "UNPAID";

  await prisma.feeInvoice.upsert({
    where: { studentId_term_year: { studentId, term, year } },
    update: { amountDue, amountPaid: totalPaid, status, feeStructureId: structure.id },
    create: { studentId, term, year, amountDue, amountPaid: totalPaid, status, feeStructureId: structure.id },
  });
};

export const generateInvoices = async (req, res) => {
  try {
    const { term, year } = req.body;
    if (!term || !year) return error(res, "term and year required", 400);

    // Only process students belonging to this school
    const students = await prisma.student.findMany({
      where: { schoolId: req.user.schoolId },
      include: { class: true },
    });
    let created = 0;
    for (const s of students) {
      if (!s.class?.grade) continue;
      await syncInvoice(s.id, term, Number(year));
      created++;
    }
    return success(res, { created }, "Invoices generated");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getInvoices = async (req, res) => {
  try {
    const { term, year, status } = req.query;
    const schoolId = req.user.schoolId;
    const where = { student: { schoolId } };
    if (term)   where.term   = term;
    if (year)   where.year   = Number(year);
    if (status) where.status = status;

    const invoices = await prisma.feeInvoice.findMany({
      where,
      include: { student: { include: { class: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return success(res, invoices, "Invoices fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getDefaulters = async (req, res) => {
  try {
    const { term, year } = req.query;
    if (!term || !year) return error(res, "term and year required", 400);

    const invoices = await prisma.feeInvoice.findMany({
      where: {
        term,
        year:   Number(year),
        status: { in: ["UNPAID", "PARTIAL"] },
        student: { schoolId: req.user.schoolId },
      },
      include: { student: { include: { class: true, parent: true } } },
      orderBy: { amountDue: "desc" },
    });
    return success(res, invoices, "Defaulters fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const exportReceipt = async (req, res) => {
  try {
    const payment = await prisma.feePayment.findUnique({
      where: { id: Number(req.params.paymentId) },
      include: { student: true },
    });
    if (!payment) return error(res, "Payment not found", 404);

    const school = await prisma.schoolSettings.findFirst();
    const pdf = await generateReceiptPDF(payment, payment.student, school);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt-${payment.id}.pdf`);
    return res.send(pdf);
  } catch (err) {
    return error(res, err.message);
  }
};

export const paybillCallback = async (req, res) => {
  try {
    const body = req.body;
    const transId = body.TransID ?? body.transId;
    const amount = parseFloat(body.TransAmount ?? body.amount ?? 0);
    const phone = body.MSISDN ?? body.phone;
    const billRef = body.BillRefNumber ?? body.billRefNumber;

    await prisma.mpesaTransaction.create({
      data: { transId, amount, phone, billRefNumber: billRef, rawPayload: body },
    });

    if (billRef && amount > 0) {
      const admissionNo = billRef.split("-")[0]?.trim();
      const student = admissionNo
        ? await prisma.student.findUnique({ where: { admissionNo } })
        : null;

      if (student) {
        const now = new Date();
        const term = String(Math.ceil((now.getMonth() + 1) / 4) || 1);
        const payment = await prisma.feePayment.create({
          data: {
            studentId: student.id,
            amount,
            method: "MPESA",
            mpesaRef: transId,
            mpesaPhone: phone,
            term,
            year: now.getFullYear(),
            status: "COMPLETED",
          },
        });
        await syncInvoice(student.id, term, now.getFullYear());
        notifyPaymentReceived(payment).catch(() => {});
      }
    }

    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("Paybill callback:", err.message);
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
};

// Get all payments (admin view)
export const getPayments = async (req, res) => {
  try {
    const { term, year, studentId, grade } = req.query;
    const schoolId = req.user.schoolId;
    const where = { student: { schoolId } };
    if (term)      where.term      = term;
    if (year)      where.year      = Number(year);
    if (studentId) where.studentId = Number(studentId);
    if (grade)     where.student   = { ...where.student, class: { grade } };

    const payments = await prisma.feePayment.findMany({
      where,
      include: {
        student: { include: { class: true } },
        recordedBy: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return success(res, payments, "Payments fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

// Get fee statement for a single student
export const getStudentFeeStatement = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { term, year } = req.query;

    const student = await prisma.student.findUnique({
      where: { id: Number(studentId) },
      include: { class: true },
    });
    if (!student) return error(res, "Student not found", 404);

    const where = { studentId: Number(studentId) };
    if (term) where.term = term;
    if (year) where.year = Number(year);

    const payments = await prisma.feePayment.findMany({
      where,
      orderBy: { paymentDate: "desc" },
    });

    // Get fee structure for this student's grade
    let feeStructure = null;
    if (term && year && student.class?.grade) {
      feeStructure = await prisma.feeStructure.findUnique({
        where: { grade_term_year: { grade: student.class.grade, term, year: Number(year) } },
      });
    }

    const totalFees = Number(feeStructure?.amount ?? 0);
    const totalPaid = payments
      .filter(p => p.status === "COMPLETED")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = totalFees - totalPaid;

    return success(res, {
      student,
      feeStructure,
      payments,
      summary: { totalFees, totalPaid, balance },
    }, "Fee statement fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

// Get all students with balances (admin overview)
export const getFeeOverview = async (req, res) => {
  try {
    const { term, year, grade } = req.query;
    if (!term || !year) return error(res, "term and year are required", 400);

    const studentWhere = { schoolId: req.user.schoolId };
    if (grade) studentWhere.class = { grade };

    const students = await prisma.student.findMany({
      where: studentWhere,
      include: { class: true },
    });

    const results = await Promise.all(students.map(async (s) => {
      const feeStructure = s.class?.grade
        ? await prisma.feeStructure.findUnique({
            where: { grade_term_year: { grade: s.class.grade, term, year: Number(year) } },
          })
        : null;

      const payments = await prisma.feePayment.findMany({
        where: { studentId: s.id, term, year: Number(year), status: "COMPLETED" },
      });

      const totalFees = Number(feeStructure?.amount ?? 0);
      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const balance   = totalFees - totalPaid;

      return {
        student: s,
        totalFees,
        totalPaid,
        balance,
        status: balance <= 0 ? "PAID" : totalPaid > 0 ? "PARTIAL" : "UNPAID",
      };
    }));

    return success(res, results, "Fee overview fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

// ── M-PESA STK PUSH ───────────────────────────────────────────────────────

export const initiateMpesaPayment = async (req, res) => {
  try {
    const { studentId, amount, phone, term, year } = req.body;
    if (!studentId || !amount || !phone || !term || !year) {
      return error(res, "studentId, amount, phone, term, and year are required", 400);
    }

    const student = await prisma.student.findUnique({
      where: { id: Number(studentId) },
      include: { class: true },
    });
    if (!student) return error(res, "Student not found", 404);

    // Create a PENDING payment record first
    const payment = await prisma.feePayment.create({
      data: {
        studentId: Number(studentId),
        amount: Number(amount),
        method: "MPESA",
        mpesaPhone: phone,
        term,
        year: Number(year),
        status: "PENDING",
      },
    });

    // Initiate STK Push
    let stkResponse;
    try {
      stkResponse = await initiateSTKPush({
        phone,
        amount: Number(amount),
        accountRef: `${student.admissionNo}`,
        description: `Fees: ${student.fullName} | ${student.admissionNo} | Term ${term} ${year}`,
      });
    } catch (stkErr) {
      // Mark the pending payment as failed so it doesn't sit as a ghost record
      await prisma.feePayment.update({
        where: { id: payment.id },
        data: { status: "FAILED", notes: "STK Push could not be initiated" },
      });

      // Distinguish between config errors and network/Safaricom errors
      const isNetworkError = stkErr.code === "ENOTFOUND" || stkErr.code === "ECONNREFUSED" || stkErr.code === "ETIMEDOUT";
      const isMissingCreds = !process.env.MPESA_CONSUMER_KEY || process.env.MPESA_CONSUMER_KEY.includes("your_");

      if (isMissingCreds) {
        return error(res, "M-Pesa is not configured. Add your Daraja API credentials to enable mobile payments.", 503);
      }
      if (isNetworkError) {
        return error(res, "M-Pesa service is currently unreachable. Please try again shortly.", 503);
      }

      // Safaricom API error (e.g. wrong credentials, invalid shortcode)
      const safaricomMsg = stkErr.response?.data?.errorMessage ?? stkErr.response?.data?.ResultDesc ?? stkErr.message;
      return error(res, `M-Pesa error: ${safaricomMsg}`, 502);
    }

    // Store the CheckoutRequestID so we can match the callback
    await prisma.feePayment.update({
      where: { id: payment.id },
      data: { mpesaRef: stkResponse.CheckoutRequestID },
    });

    return success(res, {
      paymentId: payment.id,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      message: "Payment prompt sent to phone. Enter your M-Pesa PIN to complete.",
    }, "STK Push initiated");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// Poll payment status by checkoutRequestId
export const getPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    const payment = await prisma.feePayment.findFirst({
      where: { mpesaRef: checkoutRequestId },
    });
    if (!payment) return error(res, "Payment not found", 404);
    return success(res, {
      status: payment.status,
      notes: payment.notes,
      amount: payment.amount,
      mpesaRef: payment.mpesaRef,
    }, "Payment status fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

// ── M-Pesa CALLBACK ───────────────────────────────────────────────────────
// Safaricom calls this URL after the parent completes or cancels payment

export const mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const stk = Body?.stkCallback;

    if (!stk) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

    const checkoutRequestId = stk.CheckoutRequestID;
    const resultCode        = stk.ResultCode;

    // Find the pending payment by CheckoutRequestID
    const payment = await prisma.feePayment.findFirst({
      where: { mpesaRef: checkoutRequestId },
    });

    if (!payment) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

    if (resultCode === 0) {
      // Payment successful — extract M-Pesa receipt number
      const items = stk.CallbackMetadata?.Item ?? [];
      const receipt = items.find(i => i.Name === "MpesaReceiptNumber")?.Value ?? checkoutRequestId;

      const updated = await prisma.feePayment.update({
        where: { id: payment.id },
        data: { status: "COMPLETED", mpesaRef: receipt },
        include: { student: true },
      });
      await syncInvoice(updated.studentId, updated.term, updated.year);
      notifyPaymentReceived(updated).catch(() => {});
    } else {
      // Payment failed or cancelled (1032 = user cancelled, 1037 = timeout)
      const reason = resultCode === 1032
        ? "Payment cancelled by user"
        : resultCode === 1037
        ? "Payment timed out"
        : `Payment failed (code ${resultCode})`;

      await prisma.feePayment.update({
        where: { id: payment.id },
        data: { status: "FAILED", notes: reason },
      });
    }

    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("M-Pesa callback error:", err.message);
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" }); // always 200 to Safaricom
  }
};
