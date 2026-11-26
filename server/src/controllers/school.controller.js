import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

export const getSchools = async (req, res) => {
  try {
    const schools = await prisma.school.findMany({ where: { isActive: true } });
    return success(res, schools, "Schools fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createSchool = async (req, res) => {
  try {
    const { name, subdomain, county, phone, email } = req.body;
    if (!name) return error(res, "name required", 400);
    const school = await prisma.school.create({
      data: { name, subdomain, county, phone, email },
    });
    await prisma.schoolSettings.create({
      data: { schoolId: school.id, schoolName: name, county },
    });
    return success(res, school, "School created");
  } catch (err) {
    if (err.code === "P2002") return error(res, "Subdomain already exists", 400);
    return error(res, err.message);
  }
};

export const getNotificationLogs = async (req, res) => {
  try {
    const logs = await prisma.notificationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return success(res, logs, "Notification logs fetched");
  } catch (err) {
    return error(res, err.message);
  }
};
