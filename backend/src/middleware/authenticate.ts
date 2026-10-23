import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  auth?: {
    studentId: string;
    role: string;
  };
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return res.status(401).json({
      message: "Authentication required. Please log in.",
    });
  }

  try {
    const payload = jwt.verify(token, secret);

    if (
      typeof payload === "string" ||
      !payload.sub ||
      typeof payload.sub !== "string"
    ) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    req.auth = {
      studentId: payload.sub,
      role: typeof payload.role === "string" ? payload.role : "STUDENT",
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Session expired or invalid. Please log in again.",
    });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.auth?.role !== "ADMIN") {
    return res.status(403).json({
      message: "Administrator access required.",
    });
  }

  next();
}

export default authenticate;
