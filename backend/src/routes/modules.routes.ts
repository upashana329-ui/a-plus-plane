
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  authenticate,
  requireAdmin,
  type AuthRequest,
} from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

const busSchema = z.object({
  name: z.string().trim().min(2).max(100),
  routeCode: z.string().trim().min(1).max(30),
});

const hostelSchema = z.object({
  name: z.string().trim().min(2).max(100),
  address: z.string().trim().min(2).max(250),
});

const subjectSchema = z.object({
  code: z.string().trim().min(1).max(30),
  name: z.string().trim().min(2).max(120),
  course: z.string().trim().min(1).max(100),
  semester: z.coerce.number().int().min(1).max(12),
  credits: z.coerce.number().int().min(0).max(30),
  faculty: z.string().trim().max(100).optional(),
});

const itemSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(2000),
  category: z.string().trim().min(2).max(50),
  location: z.string().trim().min(2).max(150),
  imageUrl: z.string().url().optional(),
});

const requestSchema = z.object({
  hostelId: z.string().min(1),
  type: z.enum(["ALLOCATION", "MAINTENANCE", "OTHER"]),
  description: z.string().trim().min(5).max(1500),
});

function studentIdOf(req: AuthRequest) {
  return req.auth!.studentId;
}

function isAdmin(req: AuthRequest) {
  return req.auth?.role === "ADMIN";
}

// ---------------- BUS MANAGEMENT ----------------

// List active bus routes, including stops and schedules.
router.get("/bus/routes", async (_req, res) => {
  try {
    const routes = await prisma.busRoute.findMany({
      where: { active: true },
      include: {
        stops: { orderBy: { sequence: "asc" } },
        schedules: true,
      },
      orderBy: { name: "asc" },
    });

    res.json(routes);
  } catch {
    res.status(500).json({ message: "Could not load bus routes." });
  }
});

// Create a bus route.
router.post("/bus/routes", requireAdmin, async (req, res) => {
  const parsed = busSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid route details.",
    });
  }

  try {
    const route = await prisma.busRoute.create({
      data: parsed.data,
    });

    res.status(201).json(route);
  } catch {
    res.status(409).json({
      message: "Could not create route. The route code may already exist.",
    });
  }
});

// Add a stop to a route.
router.post("/bus/routes/:id/stops", requireAdmin, async (req, res) => {
  const parsed = z.object({
    name: z.string().trim().min(2).max(100),
    sequence: z.coerce.number().int().min(1),
  }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid stop details." });
  }

  try {
    const stop = await prisma.busStop.create({
      data: {
        ...parsed.data,
        routeId: req.params.id as string,
      },
    });

    res.status(201).json(stop);
  } catch {
    res.status(400).json({
      message: "Could not add stop. Check the route and stop sequence.",
    });
  }
});

// Add a schedule.
router.post("/bus/routes/:id/schedules", requireAdmin, async (req, res) => {
  const parsed = z.object({
    departure: z.string().trim().min(1).max(50),
    arrival: z.string().trim().min(1).max(50),
    days: z.string().trim().min(1).max(100),
  }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid schedule details." });
  }

  try {
    const schedule = await prisma.busSchedule.create({
      data: {
        ...parsed.data,
        routeId: req.params.id as string,
      },
    });

    res.status(201).json(schedule);
  } catch {
    res.status(400).json({ message: "Could not create bus schedule." });
  }
});

// Assign the logged-in student to a route.
router.post("/bus/assignments", async (req: AuthRequest, res) => {
  const parsed = z.object({
    routeId: z.string().min(1),
  }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid route ID." });
  }

  try {
    const assignment = await prisma.busAssignment.create({
      data: {
        routeId: parsed.data.routeId,
        studentId: studentIdOf(req),
      },
    });

    res.status(201).json(assignment);
  } catch {
    res.status(409).json({
      message: "Assignment failed. Check the route or existing assignment.",
    });
  }
});

// View the logged-in student's bus assignments.
router.get("/bus/my-assignments", async (req: AuthRequest, res) => {
  try {
    const assignments = await prisma.busAssignment.findMany({
      where: { studentId: studentIdOf(req) },
      include: {
        route: {
          include: {
            stops: { orderBy: { sequence: "asc" } },
            schedules: true,
          },
        },
      },
    });

    res.json(assignments);
  } catch {
    res.status(500).json({ message: "Could not load assignments." });
  }
});

// ---------------- BUS GRIEVANCE SYSTEM ----------------

export const BUS_COMPLAINT_CATEGORIES = [
  "Bus Arrived Late",
  "Bus Left Without Me",
  "Bus Did Not Arrive",
  "Bus Missed My Pickup Stop",
  "Bus Route Problem",
  "Bus Timing Mismatch",
  "Other Bus Problems",
] as const;

export const BUS_COMPLAINT_STATUSES = [
  "Pending",
  "Under Review",
  "In Progress",
  "Resolved",
  "Rejected",
] as const;

const busComplaintSchema = z.object({
  category: z.enum(BUS_COMPLAINT_CATEGORIES, {
    message: "Please select a valid bus complaint category.",
  }),
  route: z.string().trim().min(1).default("Campus to Haldwani"),
  scheduledTime: z.string().trim().min(1, "Scheduled bus time is required."),
  actualTime: z.string().trim().optional(),
  pickupLocation: z.string().trim().min(2, "Pickup location/bus stop is required.").max(150),
  incidentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "A valid date of incident is required.",
  }),
  description: z.string().trim().min(10, "Please provide a description of at least 10 characters.").max(2000),
  evidenceUrl: z.string().trim().optional(),
});

// Student: Register a bus transit complaint
router.post("/bus/complaints", async (req: AuthRequest, res) => {
  const parsed = busComplaintSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message || "Invalid complaint details.",
      errors: parsed.error.format(),
    });
  }

  try {
    const studentId = studentIdOf(req);
    // Generate unique readable complaint ID: BUS-TKT-XXXXX
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const ticketId = `BUS-TKT-${randomCode}`;

    const complaint = await prisma.busComplaint.create({
      data: {
        ticketId,
        studentId,
        route: parsed.data.route || "Campus to Haldwani",
        category: parsed.data.category,
        scheduledTime: parsed.data.scheduledTime,
        actualTime: parsed.data.actualTime || null,
        pickupLocation: parsed.data.pickupLocation,
        incidentDate: new Date(parsed.data.incidentDate),
        description: parsed.data.description,
        evidenceUrl: parsed.data.evidenceUrl || null,
        status: "Pending",
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            course: true,
            semester: true,
            section: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Bus complaint registered successfully.",
      ticketId: complaint.ticketId,
      complaint,
    });
  } catch (error: any) {
    console.error("Error submitting bus complaint:", error);
    res.status(500).json({ message: "Could not submit bus complaint." });
  }
});

// Student: View logged-in student's bus complaints
router.get("/bus/my-complaints", async (req: AuthRequest, res) => {
  try {
    const studentId = studentIdOf(req);
    const complaints = await prisma.busComplaint.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            studentId: true,
            name: true,
            course: true,
            semester: true,
          },
        },
      },
    });

    res.json(complaints);
  } catch (error: any) {
    console.error("Error loading student bus complaints:", error);
    res.status(500).json({ message: "Could not load your bus complaints." });
  }
});

// Admin: View all bus complaints with filtering and recurring problem analytics
router.get("/bus/complaints", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { category, date, route, status, search } = req.query;

    const where: any = {};
    if (category) where.category = String(category);
    if (route) where.route = { contains: String(route), mode: "insensitive" };
    if (status) where.status = String(status);
    if (date) {
      const d = new Date(String(date));
      if (!isNaN(d.getTime())) {
        const nextDay = new Date(d);
        nextDay.setDate(nextDay.getDate() + 1);
        where.incidentDate = { gte: d, lt: nextDay };
      }
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { ticketId: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { pickupLocation: { contains: q, mode: "insensitive" } },
        { student: { name: { contains: q, mode: "insensitive" } } },
        { student: { studentId: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [complaints, allComplaints] = await Promise.all([
      prisma.busComplaint.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              studentId: true,
              name: true,
              course: true,
              semester: true,
              section: true,
            },
          },
        },
      }),
      prisma.busComplaint.findMany({
        select: { category: true, status: true },
      }),
    ]);

    // Recurring problem intelligence
    const recurringProblems = {
      total: allComplaints.length,
      busArrivedLate: allComplaints.filter((c) => c.category === "Bus Arrived Late").length,
      busLeftWithoutMe: allComplaints.filter((c) => c.category === "Bus Left Without Me").length,
      busDidNotArrive: allComplaints.filter((c) => c.category === "Bus Did Not Arrive").length,
      busMissedPickupStop: allComplaints.filter((c) => c.category === "Bus Missed My Pickup Stop").length,
      busRouteProblem: allComplaints.filter((c) => c.category === "Bus Route Problem").length,
      busTimingMismatch: allComplaints.filter((c) => c.category === "Bus Timing Mismatch").length,
      otherBusProblems: allComplaints.filter((c) => c.category === "Other Bus Problems").length,
      byStatus: {
        pending: allComplaints.filter((c) => c.status === "Pending").length,
        underReview: allComplaints.filter((c) => c.status === "Under Review").length,
        inProgress: allComplaints.filter((c) => c.status === "In Progress").length,
        resolved: allComplaints.filter((c) => c.status === "Resolved").length,
        rejected: allComplaints.filter((c) => c.status === "Rejected").length,
      },
    };

    res.json({
      complaints,
      recurringProblems,
    });
  } catch (error: any) {
    console.error("Error loading admin bus complaints:", error);
    res.status(500).json({ message: "Could not load bus complaints." });
  }
});

// Admin: Update bus complaint status and add official remarks
router.patch("/bus/complaints/:id/status", requireAdmin, async (req: AuthRequest, res) => {
  const parsed = z.object({
    status: z.enum(BUS_COMPLAINT_STATUSES),
    adminRemarks: z.string().trim().max(1000).optional(),
  }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message || "Invalid status or remarks.",
    });
  }

  try {
    const complaint = await prisma.busComplaint.update({
      where: { id: req.params.id as string },
      data: {
        status: parsed.data.status,
        ...(parsed.data.adminRemarks !== undefined && { adminRemarks: parsed.data.adminRemarks }),
      },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            course: true,
            semester: true,
            section: true,
          },
        },
      },
    });

    res.json({
      message: "Bus complaint status updated successfully.",
      complaint,
    });
  } catch (error: any) {
    console.error("Error updating bus complaint status:", error);
    res.status(500).json({ message: "Could not update bus complaint." });
  }
});

// ---------------- HOSTEL MANAGEMENT ----------------

router.get("/hostels", async (_req, res) => {
  try {
    const hostels = await prisma.hostel.findMany({
      include: { rooms: true },
      orderBy: { name: "asc" },
    });

    res.json(hostels);
  } catch {
    res.status(500).json({ message: "Could not load hostels." });
  }
});

router.post("/hostels", requireAdmin, async (req, res) => {
  const parsed = hostelSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid hostel details." });
  }

  try {
    const hostel = await prisma.hostel.create({
      data: parsed.data,
    });

    res.status(201).json(hostel);
  } catch {
    res.status(500).json({ message: "Could not create hostel." });
  }
});

router.post("/hostels/:id/rooms", requireAdmin, async (req, res) => {
  const parsed = z.object({
    roomNumber: z.string().trim().min(1).max(20),
    capacity: z.coerce.number().int().min(1).max(20),
  }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid room details." });
  }

  try {
    const room = await prisma.hostelRoom.create({
      data: {
        ...parsed.data,
        hostelId: req.params.id as string,
      },
    });

    res.status(201).json(room);
  } catch {
    res.status(400).json({
      message: "Could not create room. Check the hostel and room number.",
    });
  }
});

// Students can submit their own requests.
router.post("/hostels/requests", async (req: AuthRequest, res) => {
  const parsed = requestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Enter a valid hostel request.",
    });
  }

  try {
    const request = await prisma.hostelRequest.create({
      data: {
        ...parsed.data,
        studentId: studentIdOf(req),
      },
    });

    res.status(201).json(request);
  } catch {
    res.status(400).json({
      message: "Could not submit the hostel request.",
    });
  }
});

// Admins see all requests; students see only their own.
router.get("/hostels/requests", async (req: AuthRequest, res) => {
  try {
    const requests = await prisma.hostelRequest.findMany({
      where: isAdmin(req) ? {} : { studentId: studentIdOf(req) },
      include: {
        hostel: true,
        student: {
          select: {
            name: true,
            studentId: true,
            course: true,
            semester: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(requests);
  } catch {
    res.status(500).json({ message: "Could not load hostel requests." });
  }
});

// Admin can approve/reject a request.
router.patch("/hostels/requests/:id/status", requireAdmin, async (req, res) => {
  const parsed = z.object({
    status: z.enum(["APPROVED", "REJECTED", "IN_PROGRESS", "COMPLETED"]),
  }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request status." });
  }

  try {
    const updated = await prisma.hostelRequest.update({
      where: { id: req.params.id as string },
      data: { status: parsed.data.status },
    });

    res.json(updated);
  } catch {
    res.status(404).json({ message: "Hostel request not found." });
  }
});

// ---------------- LOST & FOUND ----------------

// Public-to-authenticated-users listing with optional filters.
router.get("/lost-found", async (req, res) => {
  const search = String(req.query.search || "").trim().slice(0, 100);
  const category = String(req.query.category || "").trim().slice(0, 50);
  const status = String(req.query.status || "OPEN").trim();

  try {
    const items = await prisma.lostFoundItem.findMany({
      where: {
        ...(status === "ALL" ? {} : { status }),
        ...(category ? { category } : {}),
        ...(search
          ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ],
          }
          : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        location: true,
        status: true,
        imageUrl: true,
        createdAt: true,
        reporter: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    res.json(items);
  } catch {
    res.status(500).json({ message: "Could not load lost-and-found items." });
  }
});

// Create a lost/found report.
router.post("/lost-found", async (req: AuthRequest, res) => {
  const parsed = itemSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Enter valid item details.",
    });
  }

  try {
    const item = await prisma.lostFoundItem.create({
      data: {
        ...parsed.data,
        reporterId: studentIdOf(req),
      },
    });

    res.status(201).json(item);
  } catch {
    res.status(500).json({ message: "Could not create item report." });
  }
});

// Owner can mark their report resolved; admins can moderate all reports.
router.patch("/lost-found/:id/status", async (req: AuthRequest, res) => {
  const parsed = z.object({
    status: z.enum(["OPEN", "CLAIMED", "RESOLVED"]),
  }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid item status." });
  }

  try {
    const item = await prisma.lostFoundItem.findUnique({
      where: { id: req.params.id as string },
    });

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (!isAdmin(req) && item.reporterId !== studentIdOf(req)) {
      return res.status(403).json({
        message: "You cannot change another student's report.",
      });
    }

    const updated = await prisma.lostFoundItem.update({
      where: { id: item.id },
      data: { status: parsed.data.status },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Could not update item status." });
  }
});

// ---------------- SUBJECTS & ACADEMICS ----------------

// Students can only see subjects matching their course and semester.
router.get("/subjects", async (req: AuthRequest, res) => {
  const semesterQuery = req.query.semester
    ? Number(req.query.semester)
    : undefined;

  if (
    semesterQuery !== undefined &&
    (!Number.isInteger(semesterQuery) ||
      semesterQuery < 1 ||
      semesterQuery > 12)
  ) {
    return res.status(400).json({ message: "Invalid semester." });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentIdOf(req) },
      select: { course: true, semester: true },
    });

    if (!student) {
      return res.status(401).json({ message: "Student account not found." });
    }

    const subjects = await prisma.subject.findMany({
      where: {
        course: student.course,
        semester: semesterQuery ?? student.semester,
      },
      orderBy: { code: "asc" },
    });

    res.json(subjects);
  } catch {
    res.status(500).json({ message: "Could not load subjects." });
  }
});

// Only admins can add subjects.
router.post("/subjects", requireAdmin, async (req, res) => {
  const parsed = subjectSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid subject details." });
  }

  try {
    const subject = await prisma.subject.create({
      data: parsed.data,
    });

    res.status(201).json(subject);
  } catch {
    res.status(409).json({
      message: "Could not create subject. Check whether its code already exists.",
    });
  }
});

export default router;
