import { Router } from "express";
import { z } from "zod";
import { authenticate, type AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { processCampusQuery } from "../services/ai.service";

const router = Router();

const chatSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty.").max(1000),
});

// Chat endpoint (can be called authenticated or public; if auth token provided, attaches student context)
router.post(
  "/chat",
  (req, res, next) => {
    // Optional authentication: if Bearer token present, verify it; otherwise proceed as guest
    if (req.headers.authorization) {
      return authenticate(req as AuthRequest, res, next);
    }
    next();
  },
  validateBody(chatSchema),
  async (req: AuthRequest, res) => {
    try {
      const studentId = req.auth?.studentId;
      const response = await processCampusQuery({
        message: req.body.message,
        studentId,
      });

      return res.json(response);
    } catch (error: any) {
      console.error("AI chat error:", error);
      return res.status(500).json({
        reply: "I am having trouble answering right now. Please navigate to the appropriate portal directly.",
        intent: "general",
      });
    }
  }
);

export default router;
