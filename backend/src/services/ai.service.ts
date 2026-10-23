import prisma from "../config/db";
import { detectQueryIntent } from "./routing.service";

export interface ChatMessageInput {
  message: string;
  studentId?: string;
}

export interface ChatResponseOutput {
  reply: string;
  intent: string;
  targetPath?: string;
  quickLinks?: Array<{ label: string; to: string }>;
}

export async function processCampusQuery(
  input: ChatMessageInput
): Promise<ChatResponseOutput> {
  const text = (input.message || "").trim();
  const intent = detectQueryIntent(text);

  // If query is about bus
  if (intent.module === "bus") {
    try {
      const routes = await prisma.busRoute.findMany({
        where: { active: true },
        include: { stops: { orderBy: { sequence: "asc" } }, schedules: true },
        take: 3,
      });

      if (!routes.length) {
        return {
          reply:
            "There are currently no active bus routes posted. Please check with the transport desk.",
          intent: "bus",
          targetPath: "/bus",
          quickLinks: [{ label: "View Bus Portal", to: "/bus" }],
        };
      }

      const summary = routes
        .map(
          (r) =>
            `${r.name} (${r.routeCode}) with ${r.stops.length} stops`
        )
        .join("; ");

      return {
        reply: `Here are available campus bus routes: ${summary}. You can view the full schedule and enroll in a route on the Bus Management page.`,
        intent: "bus",
        targetPath: "/bus",
        quickLinks: [{ label: "Open Bus Management", to: "/bus" }],
      };
    } catch {
      return {
        reply:
          "You can manage your college bus pass, routes, and timings under the Bus Management section.",
        intent: "bus",
        targetPath: "/bus",
        quickLinks: [{ label: "Go to Bus Portal", to: "/bus" }],
      };
    }
  }

  // If query is about hostel
  if (intent.module === "hostel") {
    try {
      const hostels = await prisma.hostel.findMany({
        take: 3,
        include: { rooms: true },
      });

      const hostelNames = hostels.map((h) => h.name).join(", ");
      return {
        reply: hostels.length
          ? `Hostel blocks include ${hostelNames}. You can view bed vacancies or submit room allocation and maintenance requests online.`
          : "Hostel rooms and allocation requests can be managed directly through the Hostel Portal.",
        intent: "hostel",
        targetPath: "/hostel",
        quickLinks: [{ label: "Hostel Management", to: "/hostel" }],
      };
    } catch {
      return {
        reply:
          "You can submit hostel room requests and maintenance tickets under Hostel Management.",
        intent: "hostel",
        targetPath: "/hostel",
        quickLinks: [{ label: "Hostel Portal", to: "/hostel" }],
      };
    }
  }

  // If query is about subjects
  if (intent.module === "subjects") {
    try {
      let subjects: Array<{ code: string; name: string }> = [];
      if (input.studentId) {
        const student = await prisma.student.findFirst({
          where: {
            OR: [{ id: input.studentId }, { studentId: input.studentId }],
          },
        });
        if (student) {
          subjects = await prisma.subject.findMany({
            where: { course: student.course, semester: student.semester },
          });
        }
      }
      if (!subjects.length) {
        subjects = await prisma.subject.findMany({ take: 4 });
      }

      const list = subjects.map((s) => `${s.code} - ${s.name}`).join(", ");
      return {
        reply: subjects.length
          ? `Registered subjects: ${list}. View all syllabus credits and faculty details on the Academics page.`
          : "You can view your course curriculum and assigned faculty under the Academics section.",
        intent: "subjects",
        targetPath: "/subjects",
        quickLinks: [{ label: "View Subjects & Faculty", to: "/subjects" }],
      };
    } catch {
      return {
        reply:
          "View your semester curriculum and faculty contacts in the Subjects & Academics portal.",
        intent: "subjects",
        targetPath: "/subjects",
        quickLinks: [{ label: "Open Academics", to: "/subjects" }],
      };
    }
  }

  // If query is about safety / ragging / harassment
  if (intent.module === "safety") {
    return {
      reply:
        "Your safety is our top priority. For ragging, harassment, cyber threats, or unsafe situations, use our confidential Her Voice reporting portal. In immediate physical danger, please contact 112 or Women Helpline 1090 right away.",
      intent: "safety",
      targetPath: "/her-voice",
      quickLinks: [
        { label: "Her Voice & Safety Portal", to: "/her-voice" },
        { label: "Confidential Report", to: "/safety-complaint" },
      ],
    };
  }

  // If query is about lost and found
  if (intent.module === "lost-found") {
    return {
      reply:
        "Misplaced something or found an item on campus? Check existing listings or publish a new report with location details in the Campus Lost & Found portal.",
      intent: "lost-found",
      targetPath: "/lost-found",
      quickLinks: [{ label: "Open Lost & Found", to: "/lost-found" }],
    };
  }

  // If query is about complaints / grievances
  if (intent.module === "grievance") {
    return {
      reply:
        "Students can lodge grievances across Academic, IT & Wi-Fi, Examination, Hostel, Infrastructure, and Accounts categories with real-time status tracking.",
      intent: "grievance",
      targetPath: "/student/raise-grievance",
      quickLinks: [
        { label: "Raise a Grievance", to: "/student/raise-grievance" },
        { label: "My Complaints", to: "/student/complaints" },
      ],
    };
  }

  // General fallback
  return {
    reply:
      "Namaste! I am the A+ Plane Campus Assistant. How can I assist you today? You can ask about bus routes, hostel rooms, academic subjects, lost & found, grievance tracking, or campus safety.",
    intent: "general",
    quickLinks: [
      { label: "Raise Grievance", to: "/student/raise-grievance" },
      { label: "Bus Services", to: "/bus" },
      { label: "Hostel Portal", to: "/hostel" },
      { label: "Campus Safety", to: "/her-voice" },
    ],
  };
}
