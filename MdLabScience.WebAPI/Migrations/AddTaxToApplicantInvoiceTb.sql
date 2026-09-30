-- ============================================================================
-- Migration: Add TaxType, TaxValue and TaxAmount to ApplicantInvoiceTB
-- Database: db_aa41a7_rahatzaman (SQL5052.site4now.net)
--
-- Run in SQL Server Management Studio / Azure Data Studio.
-- Idempotent: safe to run more than once.
--
-- IMPORTANT: the UPDATE in step 4 must stay in its own batch (separated by GO).
-- SQL Server compiles a whole batch before executing it, so referencing
-- TaxAmount in the same batch as the ALTER that creates it fails with
-- "Invalid column name 'TaxAmount'". That is exactly the error this script
-- had to work around.
-- ============================================================================

-- Guard against running against the wrong database.
IF DB_NAME() <> N'db_aa41a7_rahatzaman'
BEGIN
    RAISERROR('Connected to "%s" but this script targets "db_aa41a7_rahatzaman". Switch database and run again.', 16, 1, DB_NAME());
    RETURN;
END

GO
-- Guard: the table must exist before we can alter it.
IF OBJECT_ID('ApplicantInvoiceTB', 'U') IS NULL
BEGIN
    RAISERROR('Table ApplicantInvoiceTB does not exist in this database.', 16, 1);
    RETURN;
END

GO
-- Step 1-3: add the three tax columns. Each is added only when missing.

-- TaxType: 'Percentage' | 'Amount' | NULL when no tax is applied.
IF COL_LENGTH('ApplicantInvoiceTB', 'TaxType') IS NULL
BEGIN
    ALTER TABLE ApplicantInvoiceTB ADD TaxType NVARCHAR(20) NULL;
    PRINT 'Added ApplicantInvoiceTB.TaxType';
END
ELSE
BEGIN
    PRINT 'ApplicantInvoiceTB.TaxType already exists - skipped';
END

GO
-- TaxValue: the percentage (e.g. 5 for 5%) or the fixed tax amount.
IF COL_LENGTH('ApplicantInvoiceTB', 'TaxValue') IS NULL
BEGIN
    ALTER TABLE ApplicantInvoiceTB ADD TaxValue FLOAT NULL;
    PRINT 'Added ApplicantInvoiceTB.TaxValue';
END
ELSE
BEGIN
    PRINT 'ApplicantInvoiceTB.TaxValue already exists - skipped';
END

GO
-- TaxAmount: the computed money value of the tax, 0 when no tax is applied.
IF COL_LENGTH('ApplicantInvoiceTB', 'TaxAmount') IS NULL
BEGIN
    ALTER TABLE ApplicantInvoiceTB ADD TaxAmount FLOAT NULL;
    PRINT 'Added ApplicantInvoiceTB.TaxAmount';
END
ELSE
BEGIN
    PRINT 'ApplicantInvoiceTB.TaxAmount already exists - skipped';
END

GO
-- Step 4: backfill. MUST be a separate batch from the ALTERs above.
UPDATE ApplicantInvoiceTB
SET TaxAmount = 0
WHERE TaxAmount IS NULL;

PRINT 'Backfilled TaxAmount = 0 for existing invoices';

GO
-- Step 5: verification. All three rows below must appear.
SELECT
    c.name        AS ColumnName,
    t.name        AS DataType,
    c.max_length  AS MaxLength,
    c.is_nullable AS IsNullable
FROM sys.columns c
JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('ApplicantInvoiceTB')
  AND c.name IN ('TaxType', 'TaxValue', 'TaxAmount')
ORDER BY c.column_id;

GO
PRINT 'Migration complete: ApplicantInvoiceTB now has TaxType, TaxValue and TaxAmount.';
GO
