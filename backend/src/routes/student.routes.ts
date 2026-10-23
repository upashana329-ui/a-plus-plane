import { Router } from "express";
import prisma from "../config/db";
import { authenticate, type AuthRequest } from "../middleware/auth";
import { ComplaintStatus } from "@prisma/client";

const router = Router();
router.use(authenticate);

// Authenticated Student Profile
router.get("/profile", async (req: AuthRequest, res) => {
  try {
    const authId = req.auth!.studentId;
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id: authId }, { studentId: authId }],
      },
      select: {
        id: true,
        studentId: true,
        name: true,
        course: true,
        semester: true,
        section: true,
        role: true,
        createdAt: true,
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    return res.json(student);
  } catch (error: any) {
    console.error("Profile error:", error);
    return res.status(500).json({ message: "Failed to retrieve student profile." });
  }
});

// Student Dashboard Metrics
router.get("/dashboard", async (req: AuthRequest, res) => {
  try {
    const studentId = req.auth!.studentId;

    const [total, resolved, rejected, recentComplaints, busAssignment, hostelRequests] =
      await Promise.all([
        prisma.complaint.count({ where: { studentId, isConfidential: false } }),
        prisma.complaint.count({
          where: { studentId, status: ComplaintStatus.RESOLVED, isConfidential: false },
        }),
        prisma.complaint.count({
          where: { studentId, status: ComplaintStatus.CLOSED, isConfidential: false },
        }),
        prisma.complaint.findMany({
          where: { studentId, isConfidential: false },
          take: 4,
          orderBy: { createdAt: "desc" },
        }),
        prisma.busAssignment.findFirst({
          where: { studentId },
          include: { route: true },
        }),
        prisma.hostelRequest.findMany({
          where: { studentId },
          take: 2,
          orderBy: { createdAt: "desc" },
          include: { hostel: true },
        }),
      ]);

    const open = total - (resolved + rejected);

    return res.json({
      summary: {
        total,
        open,
        resolved,
      },
      recentComplaints,
      busAssignment,
      hostelRequests,
    });
  } catch (error: any) {
    console.error("Dashboard metrics error:", error);
    return res.status(500).json({ message: "Failed to load dashboard metrics." });
  }
});

export default router;
