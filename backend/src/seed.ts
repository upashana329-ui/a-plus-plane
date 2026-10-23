import bcrypt from "bcryptjs";
import prisma from "./config/db";

async function main() {
  console.log("Checking database seed...");

  // 1. Create or ensure default Admin
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.student.upsert({
    where: { studentId: "ADMIN01" },
    update: { role: "ADMIN", password: adminPassword },
    create: {
      studentId: "ADMIN01",
      name: "Dr. Arvind Rawat (Administrator)",
      password: adminPassword,
      course: "Administration",
      semester: 1,
      section: "A",
      role: "ADMIN",
    },
  });
  console.log("Admin account ready:", admin.studentId);

  // 2. Create or ensure sample Student
  const studentPassword = await bcrypt.hash("Student@123", 12);
  const student = await prisma.student.upsert({
    where: { studentId: "TEST1001" },
    update: { password: studentPassword },
    create: {
      studentId: "TEST1001",
      name: "Upasana Sharma",
      password: studentPassword,
      course: "B.Tech CSE AI-ML",
      semester: 3,
      section: "A",
      role: "STUDENT",
    },
  });
  console.log("Student account ready:", student.studentId);

  // 3. Seed Bus Routes if not present
  const routeCount = await prisma.busRoute.count();
  if (routeCount === 0) {
    const route1 = await prisma.busRoute.create({
      data: {
        name: "Campus to Haldwani",
        routeCode: "BUS-HALDWANI",
        active: true,
        stops: {
          create: [
            { name: "Main Campus Bus Terminal", sequence: 1 },
            { name: "ISBT Transit Bay", sequence: 2 },
            { name: "Haridwar Bypass Junction", sequence: 3 },
            { name: "Rampur Road Toll Plaza", sequence: 4 },
            { name: "Haldwani Central Bus Station", sequence: 5 },
          ],
        },
        schedules: {
          create: [
            { departure: "01:00 AM", arrival: "04:30 AM", days: "Daily (Mon - Sun)" },
          ],
        },
      },
    });
    console.log("Bus route seeded:", route1.routeCode, route1.name);
  }

  // 4. Seed Hostels if not present
  const hostelCount = await prisma.hostel.count();
  if (hostelCount === 0) {
    const h1 = await prisma.hostel.create({
      data: {
        name: "Mandakini Girls Residence",
        address: "North Campus, Girls Hostel Complex, Sector 2",
        rooms: {
          create: [
            { roomNumber: "G-101", capacity: 3, occupied: 1 },
            { roomNumber: "G-102", capacity: 3, occupied: 2 },
            { roomNumber: "G-103", capacity: 2, occupied: 0 },
            { roomNumber: "G-104", capacity: 2, occupied: 1 },
          ],
        },
      },
    });

    const h2 = await prisma.hostel.create({
      data: {
        name: "Bhagirathi Boys Residence",
        address: "South Campus, Block B, Near Sports Ground",
        rooms: {
          create: [
            { roomNumber: "B-201", capacity: 2, occupied: 1 },
            { roomNumber: "B-202", capacity: 2, occupied: 0 },
            { roomNumber: "B-203", capacity: 3, occupied: 2 },
            { roomNumber: "B-204", capacity: 3, occupied: 1 },
          ],
        },
      },
    });
    console.log("Hostels seeded:", h1.name, h2.name);
  }

  // 5. Seed Subjects if not present
  const subjectCount = await prisma.subject.count();
  if (subjectCount === 0) {
    await prisma.subject.createMany({
      data: [
        {
          code: "TCS-301",
          name: "Data Structures & Algorithms",
          course: "B.Tech CSE AI-ML",
          semester: 3,
          credits: 4,
          faculty: "Dr. R. K. Sharma",
        },
        {
          code: "TCS-302",
          name: "Computer Organization & Architecture",
          course: "B.Tech CSE AI-ML",
          semester: 3,
          credits: 4,
          faculty: "Prof. Amit Verma",
        },
        {
          code: "TCS-349",
          name: "Responsible & Trustworthy AI",
          course: "B.Tech CSE AI-ML",
          semester: 3,
          credits: 3,
          faculty: "Dr. Neha Kapoor",
        },
        {
          code: "TMA-310",
          name: "Discrete Mathematical Structures",
          course: "B.Tech CSE AI-ML",
          semester: 3,
          credits: 4,
          faculty: "Dr. S. P. Nautiyal",
        },
        {
          code: "XCS-301",
          name: "Career Skills & Professional Ethics",
          course: "B.Tech CSE AI-ML",
          semester: 3,
          credits: 2,
          faculty: "Ms. Priyanka Negi",
        },
      ],
    });
    console.log("Semester 3 subjects seeded.");
  }

  console.log("Seeding completed successfully! 🌟");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
