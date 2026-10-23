import { Router } from "express";
import { z } from "zod";
import { ComplaintStatus } from "@prisma/client";
import { authenticate, requireAdmin, type AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  getAllComplaints,
  updateStatus,
  assignComplaint,
  getAdminOverviewStats,
} from "../services/complaint.service";

const router = Router();

// All admin routes strictly require valid ADMIN role
router.use(authenticate, requireAdmin);

// Admin overview stats and metrics
router.get("/overview", async (_req, res) => {
  try {
    const data = await getAdminOverviewStats();
    return res.json(data);
  } catch (error: any) {
    console.error("Admin overview error:", error);
    return res.status(500).json({
      message: "Failed to load admin overview.",
    });
  }
});

// List all student complaints with filtering
router.get("/complaints", async (req, res) => {
  try {
    const { status, category, priority, search, page, limit } = req.query;

    const data = await getAllComplaints({
      status: status as ComplaintStatus | undefined,
      category: category as string | undefined,
      priority: priority as string | undefined,
      search: search as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return res.json(data.items);
  } catch (error: any) {
    console.error("Error listing admin complaints:", error);
    return res.status(500).json({
      message: "Failed to load complaints list.",
    });
  }
});

const statusMap: Record<string, ComplaintStatus> = {
  SUBMITTED: ComplaintStatus.SUBMITTED,
  Submitted: ComplaintStatus.SUBMITTED,
  UNDER_REVIEW: ComplaintStatus.UNDER_REVIEW,
  "Under Review": ComplaintStatus.UNDER_REVIEW,
  ASSIGNED: ComplaintStatus.ASSIGNED,
  Assigned: ComplaintStatus.ASSIGNED,
  IN_PROGRESS: ComplaintStatus.IN_PROGRESS,
  "In Progress": ComplaintStatus.IN_PROGRESS,
  AWAITING_INFORMATION: ComplaintStatus.AWAITING_INFORMATION,
  RESOLVED: ComplaintStatus.RESOLVED,
  Resolved: ComplaintStatus.RESOLVED,
  REOPENED: ComplaintStatus.REOPENED,
  Reopened: ComplaintStatus.REOPENED,
  CLOSED: ComplaintStatus.CLOSED,
  Closed: ComplaintStatus.CLOSED,
  Rejected: ComplaintStatus.CLOSED,
};

const statusSchema = z.object({
  status: z.string().transform((val, ctx) => {
    const mapped = statusMap[val] || (Object.values(ComplaintStatus).includes(val as any) ? (val as ComplaintStatus) : undefined);
    if (!mapped) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid complaint status: ${val}`,
      });
      return z.NEVER;
    }
    return mapped;
  }),
  resolutionNote: z.string().trim().max(1000).optional(),
});

// Update complaint status
router.patch(
  "/complaints/:id/status",
  validateBody(statusSchema),
  async (req, res) => {
    try {
      const { status, resolutionNote } = req.body;
      const id = req.params.id as string;
      const updated = await updateStatus(id, status, resolutionNote);

      if (!updated) {
        return res.status(404).json({ message: "Complaint not found." });
      }

      return res.json({
        message: `Complaint status updated to ${status}.`,
        complaint: updated,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      return res.status(500).json({
        message: "Failed to update complaint status.",
      });
    }
  }
);

const assignSchema = z.object({
  staffName: z.string().trim().min(2, "Staff name is required.").max(100),
});

// Assign complaint to staff
router.patch(
  "/complaints/:id/assign",
  validateBody(assignSchema),
  async (req, res) => {
    try {
      const { staffName } = req.body;
      const id = req.params.id as string;
      const updated = await assignComplaint(id, staffName);

      if (!updated) {
        return res.status(404).json({ message: "Complaint not found." });
      }

      return res.json({
        message: `Complaint assigned to ${staffName}.`,
        complaint: updated,
      });
    } catch (error: any) {
      console.error("Error assigning complaint:", error);
      return res.status(500).json({
        message: "Failed to assign complaint.",
      });
    }
  }
);

export default router;
