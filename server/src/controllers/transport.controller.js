import prisma from "../../prisma/client.js";
import { success, error } from "../utils/response.js";

export const getRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: { vehicle: { include: { driver: true } }, students: { include: { student: true } } },
    });
    return success(res, routes, "Routes fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createRoute = async (req, res) => {
  try {
    const { name, zone, fee, vehicleId } = req.body;
    if (!name) return error(res, "name required", 400);
    const route = await prisma.route.create({
      data: { name, zone, fee: Number(fee ?? 0), vehicleId: vehicleId ? Number(vehicleId) : null },
    });
    return success(res, route, "Route created");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createDriver = async (req, res) => {
  try {
    const { fullName, phone, licenseNo } = req.body;
    const driver = await prisma.driver.create({ data: { fullName, phone, licenseNo } });
    return success(res, driver, "Driver created");
  } catch (err) {
    return error(res, err.message);
  }
};

export const createVehicle = async (req, res) => {
  try {
    const { plateNumber, capacity, driverId } = req.body;
    const vehicle = await prisma.vehicle.create({
      data: { plateNumber, capacity: capacity ? Number(capacity) : null, driverId: driverId ? Number(driverId) : null },
    });
    return success(res, vehicle, "Vehicle created");
  } catch (err) {
    if (err.code === "P2002") return error(res, "Plate number exists", 400);
    return error(res, err.message);
  }
};

export const assignStudentRoute = async (req, res) => {
  try {
    const { studentId, routeId, pickupPoint } = req.body;
    const assignment = await prisma.studentRoute.upsert({
      where: { studentId: Number(studentId) },
      update: { routeId: Number(routeId), pickupPoint },
      create: { studentId: Number(studentId), routeId: Number(routeId), pickupPoint },
      include: { route: true, student: true },
    });
    return success(res, assignment, "Student assigned to route");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getDrivers = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({ include: { vehicles: true } });
    return success(res, drivers, "Drivers fetched");
  } catch (err) {
    return error(res, err.message);
  }
};

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({ include: { driver: true } });
    return success(res, vehicles, "Vehicles fetched");
  } catch (err) {
    return error(res, err.message);
  }
};
