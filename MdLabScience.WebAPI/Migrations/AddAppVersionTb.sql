-- Migration: Create AppVersionTb for the in-app "update available" prompt.
-- When a new build is uploaded to Google Play (or the App Store), set the row
-- below to the new version, e.g.:
--
--     UPDATE dbo.AppVersionTb
--     SET [LatestVersion] = '1.0.1', [ForceUpdate] = 1, [UpdatedAt] = GETDATE()
--     WHERE [Id] = 1;
--
-- Set ForceUpdate = 1 for releases that must be installed (no "Not now" shown),
-- or 0 for optional-but-recommended updates.
-- Run this script against your SQL Server database.

IF OBJECT_ID('dbo.AppVersionTb', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AppVersionTb
    (
        [Id]            INT NOT NULL,
        [LatestVersion] NVARCHAR(50) NOT NULL,
        [ForceUpdate]   BIT NOT NULL DEFAULT 0,
        [StoreUrl]      NVARCHAR(500) NULL,
        [Message]       NVARCHAR(500) NULL,
        [UpdatedAt]     DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_AppVersionTb] PRIMARY KEY CLUSTERED ([Id] ASC)
    );

    PRINT 'Table AppVersionTb created.';
END
ELSE
BEGIN
    PRINT 'Table AppVersionTb already exists.';
END
GO

-- Seed with the current live version so the endpoint has a value while the
-- table is empty (overwrite with the real released version when updating).
IF NOT EXISTS (SELECT 1 FROM dbo.AppVersionTb WHERE [Id] = 1)
BEGIN
    INSERT INTO dbo.AppVersionTb ([Id], [LatestVersion], [ForceUpdate], [StoreUrl], [Message])
    VALUES (1, N'1.0.0', 0, N'market://details?id=com.onlinecrashcourse.app', N'An updated version of Crash Course is available.');

    PRINT 'AppVersionTb seeded.';
END
ELSE
BEGIN
    PRINT 'AppVersionTb already seeded.';
END
GO

PRINT 'Migration completed: AppVersionTb ready.';