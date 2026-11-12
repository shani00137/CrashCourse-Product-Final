-- ============================================================================
-- Migration: Add Explanation to QuestionsTB
-- Database: db_aa41a7_rahatzaman (SQL5052.site4now.net)
--
-- Run in SQL Server Management Studio / Azure Data Studio.
-- Idempotent: safe to run more than once.
--
-- Explanation stores the answer explanation shown alongside a question.
-- NULL means no explanation was recorded.
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
IF OBJECT_ID('QuestionsTB', 'U') IS NULL
BEGIN
    THROW 50001, 'Table QuestionsTB does not exist in this database.', 1;
END

GO
-- Add the Explanation column only when it is missing.
IF COL_LENGTH('QuestionsTB', 'Explanation') IS NULL
BEGIN
    ALTER TABLE QuestionsTB ADD Explanation NVARCHAR(MAX) NULL;
    PRINT 'Added QuestionsTB.Explanation';
END
ELSE
BEGIN
    PRINT 'QuestionsTB.Explanation already exists - skipped';
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
WHERE c.object_id = OBJECT_ID('QuestionsTB')
  AND c.name = 'Explanation';

GO
PRINT 'Migration complete: QuestionsTB now has Explanation.';
GO
