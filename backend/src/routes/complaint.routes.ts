import { Router } from "express";
import { z } from "zod";
import { authenticate, type AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  createComplaint,
  getStudentComplaints,
  getComplaintByIdOrTicket,
  reopenComplaint,
} from "../services/complaint.service";

const router = Router();

// All complaint routes require student/admin authentication
router.use(authenticate);

const complaintSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters.").max(120),
  description: z.string().trim().min(20, "Description must be at least 20 characters.").max(2000),
  category: z.string().trim().min(2),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
});

// Create new student grievance
router.post(
  "/",
  validateBody(complaintSchema),
  async (req: AuthRequest, res) => {
    try {
      const studentId = req.auth!.studentId;
      const complaint = await createComplaint({
        ...req.body,
        studentId,
      });

      return res.status(201).json({
        message: "Your grievance has been successfully lodged.",
        ticketId: complaint.ticketId,
        complaint,
      });
    } catch (error: any) {
      console.error("Complaint creation error:", error);
      return res.status(500).json({
        message: error.message || "Failed to submit complaint. Please try again.",
      });
    }
  }
);

// Get authenticated student's grievances
router.get("/my", async (req: AuthRequest, res) => {
  try {
    const studentId = req.auth!.studentId;
    const complaints = await getStudentComplaints(studentId);
    return res.json(complaints);
  } catch (error: any) {
    console.error("Error fetching student complaints:", error);
    return res.status(500).json({
      message: "Failed to load complaints.",
    });
  }
});

// Get single grievance details by ID or ticketId
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const studentId = req.auth!.studentId;
    const isAdmin = req.auth?.role === "ADMIN";
    const id = req.params.id as string;
    const complaint = await getComplaintByIdOrTicket(
      id,
      studentId,
      isAdmin
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found.",
      });
    }

    return res.json(complaint);
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return res.status(403).json({
        message: "You are not authorized to view this complaint.",
      });
    }
    return res.status(500).json({
      message: "Failed to retrieve complaint details.",
    });
  }
});

// Reopen a resolved grievance
router.post("/:id/reopen", async (req: AuthRequest, res) => {
  try {
    const studentId = req.auth!.studentId;
    const id = req.params.id as string;
    const updated = await reopenComplaint(id, studentId);

    if (!updated) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    return res.json({
      message: "Grievance ticket has been reopened for administrative review.",
      complaint: updated,
    });
  } catch (error: any) {
    if (error.message === "FORBIDDEN") {
      return res.status(403).json({ message: "Not authorized to reopen this complaint." });
    }
    if (error.message === "ONLY_RESOLVED_CAN_BE_REOPENED") {
      return res.status(400).json({
        message: "Only resolved or closed complaints can be reopened.",
      });
    }
    return res.status(500).json({ message: "Failed to reopen complaint." });
  }
});

export default router;
