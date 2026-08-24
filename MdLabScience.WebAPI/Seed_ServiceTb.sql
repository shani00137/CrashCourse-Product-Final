-- Seed script for ServiceTb (MdLabScience)
-- Run this against your database (SQL Server).
-- The 6 MOHAP / Data Flow services will be inserted only if they don't already exist.

INSERT INTO ServiceTb (ServiceName)
SELECT v.ServiceName
FROM (
    VALUES
        ('Data Flow Transfer'),
        ('Additional Data flow 2 Document'),
        ('MOHAP Application Submission'),
        ('MOHAP Approval'),
        ('MOHAP Exam Booking'),
        ('MOHAP Evaluation Letter')
) AS v(ServiceName)
WHERE NOT EXISTS (
    SELECT 1 FROM ServiceTb s WHERE s.ServiceName = v.ServiceName
);

-- Verify
SELECT ServiceId, ServiceName FROM ServiceTb ORDER BY ServiceId;
