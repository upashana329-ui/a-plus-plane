
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

const complaintSchema = z.object({
  category: z.enum([
    "RAGGING",
    "HARASSMENT",
    "CYBER_CARE",
    "TRANSPORT_SAFETY",
    "OTHER_SAFETY",
  ]),
  title: z.string().trim().min(5).max(150),
  description: z.string().trim().min(20).max(5000),
  platform: z.string().trim().max(100).optional(),
  incidentDate: z.string().datetime().optional(),
});

router.post("/complaints", async (req: AuthRequest, res) => {
  const parsed = complaintSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Please check your complaint details.",
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const { category, title, description, platform, incidentDate } =
      parsed.data;

    // Do not include intimate images or passwords in the description.
    const complaint = await prisma.complaint.create({
      data: {
        title,
        category,
        description: [
          description,
          platform ? `Platform: ${platform}` : "",
          incidentDate ? `Incident date: ${incidentDate}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        studentId: req.auth!.studentId,
        isConfidential: true,
      },
      select: {
        id: true,
        ticketId: true,
        title: true,
        category: true,
        status: true,
        isConfidential: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "Your confidential complaint was submitted.",
      complaint,
    });
  } catch {
    return res.status(500).json({
      message: "Unable to submit the complaint. Please try again.",
    });
  }
});

// Students can view only their own safety complaints.
router.get("/my-complaints", async (req: AuthRequest, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: {
        studentId: req.auth!.studentId,
        isConfidential: true,
      },
      select: {
        ticketId: true,
        title: true,
        category: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(complaints);
  } catch {
    return res.status(500).json({
      message: "Unable to load your complaints.",
    });
  }
});

// Only authorized admins can see confidential complaints.
router.get(
  "/admin/complaints",
  requireAdmin,
  async (_req, res) => {
    try {
      const complaints = await prisma.complaint.findMany({
        where: { isConfidential: true },
        select: {
          id: true,
          ticketId: true,
          title: true,
          category: true,
          description: true,
          status: true,
          createdAt: true,
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

      return res.json(complaints);
    } catch {
      return res.status(500).json({
        message: "Unable to load confidential complaints.",
      });
    }
  }
);

export default router;
