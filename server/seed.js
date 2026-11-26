import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CBC_CURRICULUM } from "./src/data/cbcCurriculum.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database (idempotent)...\n");

  const pw = await bcrypt.hash("password", 10);

  const school = await prisma.school.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "SchoolHub CBC Academy", county: "Nairobi", subdomain: "demo" },
  });

  await prisma.schoolSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, schoolId: school.id, schoolName: "SchoolHub CBC Academy", county: "Nairobi" },
  });

  const ay = await prisma.academicYear.upsert({
    where: { year: 2026 },
    update: { isCurrent: true },
    create: { year: 2026, isCurrent: true },
  });
  const existingTerm = await prisma.term.findFirst({ where: { academicYearId: ay.id, name: "Term 1" } });
  if (!existingTerm) {
    await prisma.term.create({
      data: { name: "Term 1", startDate: new Date("2026-01-05"), endDate: new Date("2026-04-30"), academicYearId: ay.id },
    });
  }

  // ── Users ────────────────────────────────────────────────────────────────
  const adminUser   = await upsertUser("admin@school.com",   pw, "ADMIN",   "Alice Kamau");
  const teacherUser = await upsertUser("teacher@school.com", pw, "TEACHER", "Mr. James Otieno");
  const studentUser = await upsertUser("student@school.com", pw, "STUDENT", "Brian Mwangi");
  const parentUser  = await upsertUser("parent@school.com",  pw, "PARENT",  "Grace Mwangi");
  const su2 = await upsertUser("student2@school.com", pw, "STUDENT", "Amina Hassan");
  const su3 = await upsertUser("student3@school.com", pw, "STUDENT", "Kevin Odhiambo");
  const su4 = await upsertUser("student4@school.com", pw, "STUDENT", "Faith Njeri");
  const su5 = await upsertUser("student5@school.com", pw, "STUDENT", "David Kipchoge");
  console.log("✓ Users ready");

  // ── Classes ──────────────────────────────────────────────────────────────
  const cls1 = await findOrCreate("class", { name: "Grade 4 Mango"  }, { name: "Grade 4 Mango",  grade: "4", stream: "Mango",  schoolId: 1 });
  const cls2 = await findOrCreate("class", { name: "Grade 5 Baobab" }, { name: "Grade 5 Baobab", grade: "5", stream: "Baobab", schoolId: 1 });
  const cls3 = await findOrCreate("class", { name: "Grade 6 Acacia" }, { name: "Grade 6 Acacia", grade: "6", stream: "Acacia", schoolId: 1 });
  console.log("✓ Classes ready");

  // ── Teacher ──────────────────────────────────────────────────────────────
  const teacher = await prisma.teacher.upsert({
    where: { tscNo: "TSC-10001" },
    update: { classId: cls1.id },
    create: { tscNo: "TSC-10001", fullName: "Mr. James Otieno", email: "teacher@school.com", phone: "+254700000001", subject: "Mathematics", userId: teacherUser.id, classId: cls1.id, schoolId: 1 },
  });
  console.log("✓ Teacher ready");

  // ── Parent ───────────────────────────────────────────────────────────────
  const parent = await prisma.parent.upsert({
    where: { email: "parent@school.com" },
    update: {},
    create: { fullName: "Grace Mwangi", email: "parent@school.com", phone: "+254700000002", userId: parentUser.id },
  });
  console.log("✓ Parent ready");

  // ── Students ─────────────────────────────────────────────────────────────
  const s1 = await upsertStudent("ADM-2024-001", "Brian Mwangi",   "MALE",   "2012-03-15", cls1.id, parent.id, studentUser.id);
  const s2 = await upsertStudent("ADM-2024-002", "Amina Hassan",   "FEMALE", "2011-07-22", cls1.id, parent.id, su2.id);
  const s3 = await upsertStudent("ADM-2024-003", "Kevin Odhiambo", "MALE",   "2010-11-05", cls2.id, null,      su3.id);
  const s4 = await upsertStudent("ADM-2024-004", "Faith Njeri",    "FEMALE", "2010-04-18", cls2.id, null,      su4.id);
  const s5 = await upsertStudent("ADM-2024-005", "David Kipchoge", "MALE",   "2009-09-30", cls3.id, null,      su5.id);
  console.log("✓ Students ready");

  // ── Curriculum ───────────────────────────────────────────────────────────
  // Seed the full CBC curriculum (Grade 4–9)
  let seedLA, seedStrand1, seedSS1, seedSS2, seedSS3, seedSS4;

  for (const area of CBC_CURRICULUM) {
    const la = await findOrCreate(
      "learningArea",
      { name: area.name, grade: area.grade },
      { name: area.name, grade: area.grade }
    );

    // Keep references to Grade 4 Mathematics for assessments
    if (area.name === "Mathematics" && area.grade === "4") {
      seedLA = la;
    }

    for (const strand of area.strands) {
      const st = await findOrCreate(
        "strand",
        { name: strand.name, learningAreaId: la.id },
        { name: strand.name, learningAreaId: la.id }
      );

      // Keep references to first 4 sub-strands of Grade 4 Maths Numbers strand
      if (area.name === "Mathematics" && area.grade === "4" && strand.name === "Numbers") {
        const subs = [];
        for (const ssName of strand.subStrands) {
          const ss = await findOrCreate(
            "subStrand",
            { name: ssName, strandId: st.id },
            { name: ssName, strandId: st.id }
          );
          subs.push(ss);
        }
        [seedSS1, seedSS2, seedSS3, seedSS4] = subs;
        seedStrand1 = st;
      } else {
        for (const ssName of strand.subStrands) {
          await findOrCreate(
            "subStrand",
            { name: ssName, strandId: st.id },
            { name: ssName, strandId: st.id }
          );
        }
      }
    }
  }
  console.log("✓ CBC Curriculum ready (Grade 4–9)");

  // ── Assessments ───────────────────────────────────────────────────────────
  const assessmentData = [
    { studentId: s1.id, subStrandId: seedSS1.id, score: "EE", term: "1" },
    { studentId: s1.id, subStrandId: seedSS2.id, score: "ME", term: "1" },
    { studentId: s1.id, subStrandId: seedSS3.id, score: "ME", term: "1" },
    { studentId: s2.id, subStrandId: seedSS1.id, score: "AE", term: "1" },
    { studentId: s2.id, subStrandId: seedSS2.id, score: "BE", term: "1" },
    { studentId: s3.id, subStrandId: seedSS1.id, score: "EE", term: "1" },
    { studentId: s3.id, subStrandId: seedSS3.id, score: "ME", term: "1" },
    { studentId: s4.id, subStrandId: seedSS2.id, score: "AE", term: "1" },
    { studentId: s5.id, subStrandId: seedSS4.id, score: "ME", term: "1" },
  ];
  for (const a of assessmentData) {
    await findOrCreate("assessment", { studentId: a.studentId, subStrandId: a.subStrandId, term: a.term }, a);
  }
  console.log("✓ Assessments ready");

  // ── Attendance ────────────────────────────────────────────────────────────
  const allStudents = [s1, s2, s3, s4, s5];
  const statuses = ["PRESENT", "PRESENT", "PRESENT", "ABSENT", "LATE"];
  for (let d = 0; d < 5; d++) {
    const date = new Date(); date.setDate(date.getDate() - d);
    const dateOnly = new Date(date.toISOString().split("T")[0] + "T00:00:00.000Z");
    for (let i = 0; i < allStudents.length; i++) {
      const existing = await prisma.attendance.findUnique({
        where: { studentId_date: { studentId: allStudents[i].id, date: dateOnly } },
      });
      if (!existing) {
        await prisma.attendance.create({
          data: { studentId: allStudents[i].id, date: dateOnly, status: statuses[(i + d) % statuses.length], term: "1", year: 2026 },
        });
      }
    }
  }
  console.log("✓ Attendance ready");

  // ── Assignment ────────────────────────────────────────────────────────────
  let assignment = await prisma.assignment.findFirst({ where: { title: "Number Patterns Worksheet" } });
  if (!assignment) {
    assignment = await prisma.assignment.create({
      data: {
        title: "Number Patterns Worksheet",
        description: "Complete exercises 1–20 on number patterns from the textbook.",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        term: "1", teacherId: teacher.id, classId: cls1.id,
      },
    });
  }
  for (const s of [s1, s2]) {
    await prisma.studentAssignment.upsert({
      where: { studentId_assignmentId: { studentId: s.id, assignmentId: assignment.id } },
      update: {},
      create: { studentId: s.id, assignmentId: assignment.id, submitted: false },
    });
  }
  console.log("✓ Assignment ready");

  // ── Competencies ──────────────────────────────────────────────────────────
  const competencyData = [
    { code: "MATH-G4-01", name: "Number Sense",      description: "Understands place value and number relationships.", grade: "4", learningAreaId: seedLA.id, studentId: s1.id, level: "PROFICIENT" },
    { code: "MATH-G4-02", name: "Problem Solving",   description: "Applies strategies to solve mathematical problems.",  grade: "4", learningAreaId: seedLA.id, studentId: s1.id, level: "DEVELOPING" },
    { code: "MATH-G4-03", name: "Spatial Reasoning", description: "Identifies and describes 2D and 3D shapes.",          grade: "4", learningAreaId: seedLA.id, studentId: s2.id, level: "ADVANCED"   },
  ];
  for (const c of competencyData) {
    await prisma.competency.upsert({
      where: { studentId_code: { studentId: c.studentId, code: c.code } },
      update: { level: c.level },
      create: c,
    });
  }
  console.log("✓ Competencies ready");

  // ── Fee Structures ────────────────────────────────────────────────────────
  // Term 1 2026 fees per grade
  const feeStructures = [
    { grade: "4", term: "1", year: 2026, amount: 12500, description: "Tuition + lunch + activities" },
    { grade: "5", term: "1", year: 2026, amount: 13500, description: "Tuition + lunch + activities" },
    { grade: "6", term: "1", year: 2026, amount: 14500, description: "Tuition + lunch + activities" },
    { grade: "4", term: "2", year: 2026, amount: 12500, description: "Tuition + lunch + activities" },
    { grade: "5", term: "2", year: 2026, amount: 13500, description: "Tuition + lunch + activities" },
    { grade: "6", term: "2", year: 2026, amount: 14500, description: "Tuition + lunch + activities" },
  ];
  for (const fs of feeStructures) {
    await prisma.feeStructure.upsert({
      where: { grade_term_year: { grade: fs.grade, term: fs.term, year: fs.year } },
      update: { amount: fs.amount, description: fs.description },
      create: fs,
    });
  }
  console.log("✓ Fee structures ready");

  // ── Fee Payments — only seed if none exist for Term 1 2026 ──────────────
  const existingPayments = await prisma.feePayment.count({ where: { term: "1", year: 2026 } });
  if (existingPayments === 0) {
    // Brian Mwangi (Grade 4) — PARTIAL: paid KES 8,000, balance KES 4,500
    await prisma.feePayment.create({
      data: { studentId: s1.id, amount: 8000, method: "MPESA", mpesaRef: "QHX7Y8Z9A0", term: "1", year: 2026, status: "COMPLETED", recordedById: adminUser.id },
    });
    // Amina Hassan (Grade 4) — FULLY PAID: paid KES 12,500, balance KES 0
    await prisma.feePayment.create({
      data: { studentId: s2.id, amount: 12500, method: "CASH", term: "1", year: 2026, status: "COMPLETED", recordedById: adminUser.id },
    });
    // Kevin Odhiambo (Grade 5) — PARTIAL: paid KES 5,000, balance KES 8,500
    await prisma.feePayment.create({
      data: { studentId: s3.id, amount: 5000, method: "BANK", mpesaRef: "TRF-20260115", term: "1", year: 2026, status: "COMPLETED", recordedById: adminUser.id },
    });
    // Faith Njeri (Grade 5) — UNPAID: no payment, balance KES 13,500
    // David Kipchoge (Grade 6) — PARTIAL: paid KES 10,000, balance KES 4,500
    await prisma.feePayment.create({
      data: { studentId: s5.id, amount: 10000, method: "MPESA", mpesaRef: "RKL9M2N3P4", term: "1", year: 2026, status: "COMPLETED", recordedById: adminUser.id },
    });
  }
  console.log("✓ Fee payments ready");

  console.log("\n✅ Seed complete!\n");
  console.log("Demo credentials (password: 'password' for all):");
  console.log("  admin@school.com   → ADMIN");
  console.log("  teacher@school.com → TEACHER");
  console.log("  student@school.com → STUDENT");
  console.log("  parent@school.com  → PARENT");
}

// ── Helpers ──────────────────────────────────────────────────────────────────
async function upsertUser(email, pw, role, fullName) {
  return prisma.user.upsert({
    where: { email },
    update: { fullName, role, schoolId: 1 },
    create: { email, password: pw, role, fullName, schoolId: 1 },
  });
}

async function upsertStudent(admissionNo, fullName, gender, dob, classId, parentId, userId) {
  return prisma.student.upsert({
    where: { admissionNo },
    update: { classId, parentId, schoolId: 1 },
    create: { admissionNo, fullName, gender, dob: new Date(dob), classId, parentId, userId, schoolId: 1 },
  });
}

async function findOrCreate(model, where, data) {
  const existing = await prisma[model].findFirst({ where });
  return existing ?? prisma[model].create({ data });
}

main()
  .catch(e => { console.error("❌ Seed failed:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
