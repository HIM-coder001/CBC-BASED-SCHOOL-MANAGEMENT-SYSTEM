import PDFDocument from "pdfkit";

export const generateReceiptPDF = (payment, student, school) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text(school?.schoolName ?? "SchoolHub", { align: "center" });
    doc.fontSize(12).text("OFFICIAL FEE RECEIPT", { align: "center" });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Receipt No: PAY-${payment.id}`);
    doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString("en-KE")}`);
    doc.text(`Student: ${student.fullName} (${student.admissionNo})`);
    doc.text(`Amount: KES ${payment.amount.toLocaleString()}`);
    doc.text(`Method: ${payment.method}`);
    if (payment.mpesaRef) doc.text(`M-Pesa Ref: ${payment.mpesaRef}`);
    if (payment.term) doc.text(`Term: ${payment.term} / ${payment.year}`);
    doc.moveDown();
    doc.text("Thank you for your payment.", { align: "center" });
    doc.end();
  });
};
