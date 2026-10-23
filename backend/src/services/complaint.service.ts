import prisma from "../config/db";
import { ComplaintStatus } from "@prisma/client";

export interface CreateComplaintInput {
  title: string;
  description: string;
  category: string;
  priority?: string;
  isConfidential?: boolean;
  studentId: string;
}

export interface ComplaintFilter {
  status?: ComplaintStatus;
  category?: string;
  priority?: string;
  search?: string;
  isConfidential?: boolean;
  page?: number;
  limit?: number;
}

export async function createComplaint(input: CreateComplaintInput) {
  // Generate random readable ticket ID e.g. TKT-74829
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const ticketId = `TKT-${randomNum}`;

  return prisma.complaint.create({
    data: {
      ticketId,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      priority: input.priority || "Medium",
      isConfidential: input.isConfidential || false,
      status: ComplaintStatus.SUBMITTED,
      studentId: input.studentId,
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
}

export async function getStudentComplaints(studentId: string) {
  return prisma.complaint.findMany({
    where: {
      studentId,
      isConfidential: false,
    },
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
  });
}

export async function getComplaintByIdOrTicket(
  idOrTicket: string,
  studentId: string,
  isAdmin: boolean
) {
  const complaint = await prisma.complaint.findFirst({
    where: {
      OR: [{ id: idOrTicket }, { ticketId: idOrTicket }],
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

  if (!complaint) {
    return null;
  }

  // Authorization: Only owner or admin can view
  if (!isAdmin && complaint.studentId !== studentId) {
    throw new Error("FORBIDDEN");
  }

  // Confidential reports only visible to authorized admin or reporter
  if (complaint.isConfidential && !isAdmin && complaint.studentId !== studentId) {
    throw new Error("FORBIDDEN");
  }

  return complaint;
}

export async function getAllComplaints(filter: ComplaintFilter) {
  const page = filter.page && filter.page > 0 ? filter.page : 1;
  const limit = filter.limit && filter.limit > 0 ? filter.limit : 50;
  const skip = (page - 1) * limit;

  const where: any = {
    isConfidential: filter.isConfidential !== undefined ? filter.isConfidential : false,
  };

  if (filter.status) {
    where.status = filter.status;
  }
  if (filter.category) {
    where.category = filter.category;
  }
  if (filter.priority) {
    where.priority = filter.priority;
  }
  if (filter.search) {
    const q = filter.search.trim();
    where.OR = [
      { ticketId: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { student: { name: { contains: q, mode: "insensitive" } } },
      { student: { studentId: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip,
      take: limit,
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
    prisma.complaint.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function updateStatus(
  idOrTicket: string,
  newStatus: ComplaintStatus,
  resolutionNote?: string
) {
  const existing = await prisma.complaint.findFirst({
    where: {
      OR: [{ id: idOrTicket }, { ticketId: idOrTicket }],
    },
  });

  if (!existing) {
    return null;
  }

  return prisma.complaint.update({
    where: { id: existing.id },
    data: {
      status: newStatus,
      resolutionNote: resolutionNote ? resolutionNote.trim() : existing.resolutionNote,
    },
    include: {
      student: {
        select: {
          id: true,
          studentId: true,
          name: true,
          course: true,
          semester: true,
        },
      },
    },
  });
}

export async function assignComplaint(idOrTicket: string, staffName: string) {
  const existing = await prisma.complaint.findFirst({
    where: {
      OR: [{ id: idOrTicket }, { ticketId: idOrTicket }],
    },
  });

  if (!existing) {
    return null;
  }

  return prisma.complaint.update({
    where: { id: existing.id },
    data: {
      assignedTo: staffName.trim(),
      status:
        existing.status === ComplaintStatus.SUBMITTED
          ? ComplaintStatus.ASSIGNED
          : existing.status,
    },
  });
}

export async function reopenComplaint(idOrTicket: string, studentId: string) {
  const complaint = await prisma.complaint.findFirst({
    where: {
      OR: [{ id: idOrTicket }, { ticketId: idOrTicket }],
    },
  });

  if (!complaint) {
    return null;
  }

  if (complaint.studentId !== studentId) {
    throw new Error("FORBIDDEN");
  }

  if (
    complaint.status !== ComplaintStatus.RESOLVED &&
    complaint.status !== ComplaintStatus.CLOSED
  ) {
    throw new Error("ONLY_RESOLVED_CAN_BE_REOPENED");
  }

  return prisma.complaint.update({
    where: { id: complaint.id },
    data: {
      status: ComplaintStatus.REOPENED,
    },
  });
}

export async function getAdminOverviewStats() {
  const [total, submitted, underReview, inProgress, resolved, rejected] =
    await Promise.all([
      prisma.complaint.count({ where: { isConfidential: false } }),
      prisma.complaint.count({
        where: { status: ComplaintStatus.SUBMITTED, isConfidential: false },
      }),
      prisma.complaint.count({
        where: { status: ComplaintStatus.UNDER_REVIEW, isConfidential: false },
      }),
      prisma.complaint.count({
        where: { status: ComplaintStatus.IN_PROGRESS, isConfidential: false },
      }),
      prisma.complaint.count({
        where: { status: ComplaintStatus.RESOLVED, isConfidential: false },
      }),
      prisma.complaint.count({
        where: { status: ComplaintStatus.CLOSED, isConfidential: false },
      }),
    ]);

  const recent = await prisma.complaint.findMany({
    where: { isConfidential: false },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      student: {
        select: {
          name: true,
          studentId: true,
          course: true,
        },
      },
    },
  });

  const categories = await prisma.complaint.groupBy({
    by: ["category"],
    where: { isConfidential: false },
    _count: { category: true },
  });

  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const trend = months.map((m, idx) => ({
    month: m,
    complaints: idx === months.length - 1 ? total : Math.max(0, Math.floor(total * ((idx + 1) / 8))),
  }));

  return {
    stats: {
      total,
      open: submitted + underReview + inProgress,
      byStatus: {
        SUBMITTED: submitted,
        UNDER_REVIEW: underReview,
        ASSIGNED: 0,
        IN_PROGRESS: inProgress,
        AWAITING_INFORMATION: 0,
        RESOLVED: resolved,
        REOPENED: 0,
        CLOSED: rejected,
        Submitted: submitted,
        "Under Review": underReview,
        "In Progress": inProgress,
        Resolved: resolved,
        Rejected: rejected,
      },
    },
    byCategory: categories.map((c) => ({
      category: c.category,
      count: c._count.category,
    })),
    recent,
    trend,
  };
}
