-- CreateTable
CREATE TABLE "BusRoute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "routeCode" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusStop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "routeId" TEXT NOT NULL,

    CONSTRAINT "BusStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusSchedule" (
    "id" TEXT NOT NULL,
    "departure" TEXT NOT NULL,
    "arrival" TEXT NOT NULL,
    "days" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,

    CONSTRAINT "BusSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusAssignment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hostel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hostel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelRoom" (
    "id" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "occupied" INTEGER NOT NULL DEFAULT 0,
    "hostelId" TEXT NOT NULL,

    CONSTRAINT "HostelRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostelRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostFoundItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "imageUrl" TEXT,
    "reporterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LostFoundItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL,
    "faculty" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusRoute_routeCode_key" ON "BusRoute"("routeCode");

-- CreateIndex
CREATE UNIQUE INDEX "BusStop_routeId_sequence_key" ON "BusStop"("routeId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "BusAssignment_studentId_routeId_key" ON "BusAssignment"("studentId", "routeId");

-- CreateIndex
CREATE UNIQUE INDEX "HostelRoom_hostelId_roomNumber_key" ON "HostelRoom"("hostelId", "roomNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

-- AddForeignKey
ALTER TABLE "BusStop" ADD CONSTRAINT "BusStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "BusRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusSchedule" ADD CONSTRAINT "BusSchedule_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "BusRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusAssignment" ADD CONSTRAINT "BusAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusAssignment" ADD CONSTRAINT "BusAssignment_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "BusRoute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelRoom" ADD CONSTRAINT "HostelRoom_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelRequest" ADD CONSTRAINT "HostelRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelRequest" ADD CONSTRAINT "HostelRequest_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostFoundItem" ADD CONSTRAINT "LostFoundItem_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
