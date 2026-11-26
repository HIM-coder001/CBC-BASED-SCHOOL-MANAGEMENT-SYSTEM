import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

// GET full curriculum tree: LearningArea → Strands → SubStrands
export const getLearningAreas = async (req, res) => {
  try {
    const areas = await prisma.learningArea.findMany({
      include: {
        strands: {
          include: {
            subStrands: true,
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
    return success(res, areas, "Learning areas fetched successfully");
  } catch (err) {
    return error(res, err.message);
  }
};
