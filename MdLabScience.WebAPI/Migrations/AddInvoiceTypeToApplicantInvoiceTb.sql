-- ============================================================================
-- Migration: Add InvoiceType to ApplicantInvoiceTB
-- Database: db_aa41a7_rahatzaman (SQL5052.site4now.net)
--
-- Run in SQL Server Management Studio / Azure Data Studio.
-- Idempotent: safe to run more than once.
--
-- InvoiceType stores the kind of invoice being issued:
--   'Buy Course'    - the invoice is for purchasing a course
--   'For Procedure' - the invoice is for a procedure
-- NULL means the type was not recorded (older invoices).
-- ============================================================================

-- Guard against running against the wrong database.
IF DB_NAME() <> N'db_aa41a7_rahatzaman'
BEGIN
    DECLARE @dbName NVARCHAR(128) = DB_NAME();
    DECLARE @dbMsg NVARCHAR(400) = CONCAT('Connected to "', @dbName, '" but this script targets "db_aa41a7_rahatzaman". Switch database and run again.');
    THROW 50000, @dbMsg, 1;
END

GO
-- Guard: the table must exist before we can alter it.
IF OBJECT_ID('ApplicantInvoiceTB', 'U') IS NULL
BEGIN
    THROW 50001, 'Table ApplicantInvoiceTB does not exist in this database.', 1;
END

GO
-- Add the InvoiceType column only when it is missing.
IF COL_LENGTH('ApplicantInvoiceTB', 'InvoiceType') IS NULL
BEGIN
    ALTER TABLE ApplicantInvoiceTB ADD InvoiceType NVARCHAR(50) NULL;
    PRINT 'Added ApplicantInvoiceTB.InvoiceType';
END
ELSE
BEGIN
    PRINT 'ApplicantInvoiceTB.InvoiceType already exists - skipped';
END

GO
-- Verification. The row below must appear.
SELECT
    c.name        AS ColumnName,
    t.name        AS DataType,
    c.max_length  AS MaxLength,
    c.is_nullable AS IsNullable
FROM sys.columns c
JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('ApplicantInvoiceTB')
  AND c.name = 'InvoiceType';

GO
PRINT 'Migration complete: ApplicantInvoiceTB now has InvoiceType.';
GO
