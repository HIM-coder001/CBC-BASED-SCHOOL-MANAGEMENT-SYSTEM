import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

// Get school settings (creates default if none exist)
export const getSettings = async (req, res) => {
  try {
    let settings = await prisma.schoolSettings.findFirst();
    if (!settings) {
      settings = await prisma.schoolSettings.create({
        data: { schoolName: "SchoolHub CBC Academy" },
      });
    }
    return success(res, settings, "Settings fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

// Update school settings (upsert)
export const updateSettings = async (req, res) => {
  try {
    const {
      schoolName, address, phone, email, motto, county, logoUrl,
      smsEnabled, smsAbsenceAlerts, smsFeeReminders, smsReportCardAlerts, emailEnabled,
    } = req.body;
    if (!schoolName) return error(res, "School name is required", 400);

    let settings = await prisma.schoolSettings.findFirst();
    const data = {
      schoolName, address, phone, email, motto, county, logoUrl,
      ...(smsEnabled !== undefined && { smsEnabled }),
      ...(smsAbsenceAlerts !== undefined && { smsAbsenceAlerts }),
      ...(smsFeeReminders !== undefined && { smsFeeReminders }),
      ...(smsReportCardAlerts !== undefined && { smsReportCardAlerts }),
      ...(emailEnabled !== undefined && { emailEnabled }),
    };
    if (settings) {
      settings = await prisma.schoolSettings.update({ where: { id: settings.id }, data });
    } else {
      settings = await prisma.schoolSettings.create({ data: { schoolName, ...data } });
    }
    return success(res, settings, "Settings updated");
  } catch (err) {
    return error(res, err.message);
  }
};
