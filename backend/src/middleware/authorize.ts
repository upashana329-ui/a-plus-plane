import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./authenticate";

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.auth || !allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to access this resource.",
      });
    }
    next();
  };
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.auth?.role !== "ADMIN") {
    return res.status(403).json({
      message: "Administrator access required.",
    });
  }
  next();
}
