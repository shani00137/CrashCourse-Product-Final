-- Migration: Add IsTrial flag to ApplicantsTb (5-day trial accounts)
-- Run this script against your SQL Server database

IF OBJECT_ID(N'dbo.ApplicantsTb', N'U') IS NULL
BEGIN
    RAISERROR('Table dbo.ApplicantsTb does not exist. Run against the correct database.', 16, 1);
    RETURN;
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.ApplicantsTb') AND name = N'IsTrial')
BEGIN
    ALTER TABLE dbo.ApplicantsTb ADD [IsTrial] BIT NOT NULL CONSTRAINT [DF_ApplicantsTb_IsTrial] DEFAULT (0);

    PRINT 'Column ApplicantsTb.IsTrial added.';
END
ELSE
BEGIN
    PRINT 'Column ApplicantsTb.IsTrial already exists.';
END
GO

-- Backfill: mark existing accounts whose registration-to-expiry span is ~5 days
-- (and are not yet expired) as trials, matching the app's isTrialByDates logic.
UPDATE dbo.ApplicantsTb
SET IsTrial = 1
WHERE IsTrial = 0
  AND RegistrationDate IS NOT NULL
  AND ExpiryDate IS NOT NULL
  AND ExpiryDate > GETDATE()
  AND DATEDIFF(DAY, RegistrationDate, ExpiryDate) <= 6;
GO

PRINT 'Migration completed: ApplicantsTb.IsTrial column ready.';