// Department mapping for complaint routing
export const DEPARTMENT_MAP: Record<string, string> = {
  Academic: "Dean of Academic Affairs & Faculty Heads",
  Examination: "Controller of Examinations (COE) Office",
  Hostel: "Chief Warden & Residence Management",
  Library: "Chief Librarian & Digital Resource Desk",
  Transport: "Campus Transport Officer & Bus Logistics",
  Infrastructure: "Estate & Civil Maintenance Department",
  "IT & Wi-Fi": "Systems & Network Operations Center (NOC)",
  "Fees & Accounts": "Finance & Accounts Section",
  Other: "Student Welfare & Grievance Cell",
};

export function getAssignedDepartment(category: string): string {
  return DEPARTMENT_MAP[category] || "Student Welfare & Grievance Cell";
}

// Automatic intent detection for user text query
export function detectQueryIntent(text: string): {
  module: "bus" | "hostel" | "lost-found" | "subjects" | "safety" | "grievance" | "general";
  path: string;
  suggestion: string;
} {
  const query = (text || "").toLowerCase();

  if (
    query.includes("bus") ||
    query.includes("route") ||
    query.includes("transport") ||
    query.includes("stop") ||
    query.includes("pickup")
  ) {
    return {
      module: "bus",
      path: "/bus",
      suggestion: "View active university bus routes, stops, and schedules in Bus Management.",
    };
  }

  if (
    query.includes("hostel") ||
    query.includes("room") ||
    query.includes("bed") ||
    query.includes("warden") ||
    query.includes("maintenance")
  ) {
    return {
      module: "hostel",
      path: "/hostel",
      suggestion: "Submit hostel room change or maintenance requests in Hostel Management.",
    };
  }

  if (
    query.includes("lost") ||
    query.includes("found") ||
    query.includes("belonging") ||
    query.includes("id card") ||
    query.includes("wallet")
  ) {
    return {
      module: "lost-found",
      path: "/lost-found",
      suggestion: "Check or report misplaced campus articles in Lost & Found.",
    };
  }

  if (
    query.includes("subject") ||
    query.includes("syllabus") ||
    query.includes("course") ||
    query.includes("credits") ||
    query.includes("faculty") ||
    query.includes("teacher")
  ) {
    return {
      module: "subjects",
      path: "/subjects",
      suggestion: "View your semester curriculum and faculty details in Subjects & Academics.",
    };
  }

  if (
    query.includes("ragging") ||
    query.includes("harass") ||
    query.includes("cyber") ||
    query.includes("threat") ||
    query.includes("unsafe") ||
    query.includes("emergency")
  ) {
    return {
      module: "safety",
      path: "/her-voice",
      suggestion: "Access confidential reporting and immediate emergency hotlines in Her Voice & Campus Safety.",
    };
  }

  if (
    query.includes("complaint") ||
    query.includes("grievance") ||
    query.includes("ticket") ||
    query.includes("status") ||
    query.includes("issue")
  ) {
    return {
      module: "grievance",
      path: "/student/complaints",
      suggestion: "Track existing grievance tickets or lodge a new one in the Grievance Portal.",
    };
  }

  return {
    module: "general",
    path: "/",
    suggestion: "I can help guide you to Bus, Hostel, Subjects, Lost & Found, Safety, or Grievance tracking.",
  };
}
