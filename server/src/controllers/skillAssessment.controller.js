import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";
import { logAudit } from "../utils/audit.js";

export const createSkillAssessment = async (req, res) => {
  try {
    const { skillName, level, evidence, term, year, studentId, competencyId } = req.body;
    if (!skillName || !term || !year || !studentId || !competencyId) {
      return error(res, "skillName, term, year, studentId, competencyId required", 400);
    }
    const record = await prisma.skillAssessment.create({
      data: {
        skillName,
        level: level ?? "DEVELOPING",
        evidence: evidence ?? "",
        term,
        year: Number(year),
        studentId: Number(studentId),
        competencyId: Number(competencyId),
        teacherId: req.user.id,
      },
      include: { competency: true, student: true },
    });
    await logAudit({ userId: req.user.id, action: "CREATE", entity: "SkillAssessment", entityId: record.id, after: record });
    return success(res, record, "Skill assessment created");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getByCompetency = async (req, res) => {
  try {
    const list = await prisma.skillAssessment.findMany({
      where: { competencyId: Number(req.params.competencyId) },
      orderBy: { createdAt: "desc" },
    });
    return success(res, list, "Skill assessments fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const updateSkillAssessment = async (req, res) => {
  try {
    const { skillName, level, evidence, term, year } = req.body;
    const updated = await prisma.skillAssessment.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(skillName && { skillName }),
        ...(level && { level }),
        ...(evidence !== undefined && { evidence }),
        ...(term && { term }),
        ...(year && { year: Number(year) }),
      },
    });
    return success(res, updated, "Skill assessment updated");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Not found", 404);
    return error(res, err.message);
  }
};

export const deleteSkillAssessment = async (req, res) => {
  try {
    await prisma.skillAssessment.delete({ where: { id: Number(req.params.id) } });
    return success(res, null, "Deleted");
  } catch (err) {
    if (err.code === "P2025") return error(res, "Not found", 404);
    return error(res, err.message);
  }
};
