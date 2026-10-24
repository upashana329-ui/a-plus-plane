-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'Medium';
ALTER TABLE "Complaint" ADD COLUMN IF NOT EXISTS "isConfidential" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Complaint" ADD COLUMN IF NOT EXISTS "assignedTo" TEXT;
ALTER TABLE "Complaint" ADD COLUMN IF NOT EXISTS "resolutionNote" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "BusComplaint" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "route" TEXT NOT NULL DEFAULT 'Campus to Haldwani',
    "category" TEXT NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "actualTime" TEXT,
    "pickupLocation" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "adminRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusComplaint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "BusComplaint_ticketId_key" ON "BusComplaint"("ticketId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'BusComplaint_studentId_fkey'
    ) THEN
        ALTER TABLE "BusComplaint" ADD CONSTRAINT "BusComplaint_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
