
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const router = Router();
const prisma = new PrismaClient();

const registerSchema = z.object({
  studentId: z.string().trim().min(1).max(50),
  name: z.string().trim().min(2).max(100),
  password: z.string().min(8).max(128),
  course: z.string().trim().min(1).max(100),
  semester: z.coerce.number().int().min(1).max(12),
  section: z.string().trim().min(1).max(20),
});

const loginSchema = z.object({
  studentId: z.string().trim().min(1),
  password: z.string().min(1).max(128),
});

function createToken(student: {
  id: string;
  role: string;
}) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing in .env");
  }

  return jwt.sign(
    { role: student.role },
    secret,
    {
      subject: student.id,
      expiresIn: "1d",
    }
  );
}

// Student Registration
router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Please enter valid student details.",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const {
      studentId,
      name,
      password,
      course,
      semester,
      section,
    } = parsed.data;

    const existingStudent = await prisma.student.findUnique({
      where: { studentId },
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "This student ID is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await prisma.student.create({
      data: {
        studentId,
        name,
        password: hashedPassword,
        course,
        semester,
        section,
      },
    });

    const token = createToken(student);

    return res.status(201).json({
      message: "Student registered successfully!",
      token,
      student: {
        id: student.id,
        studentId: student.studentId,
        name: student.name,
        course: student.course,
        semester: student.semester,
        section: student.section,
        role: student.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
});

// Student Login
router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Please enter a valid student ID and password.",
      });
    }

    const { studentId, password } = parsed.data;

    const student = await prisma.student.findUnique({
      where: { studentId },
    });

    if (
      !student ||
      !(await bcrypt.compare(password, student.password))
    ) {
      return res.status(401).json({
        message: "Invalid student ID or password.",
      });
    }

    const token = createToken(student);

    return res.status(200).json({
      message: "Login successful!",
      token,
      student: {
        id: student.id,
        studentId: student.studentId,
        name: student.name,
        course: student.course,
        semester: student.semester,
        section: student.section,
        role: student.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
});

export default router;
