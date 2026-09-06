-- Migration: Create UserReadingTimeTb table for tracking per-exercise reading time
-- Run this script against your SQL Server database

IF OBJECT_ID('dbo.UserReadingTimeTb', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserReadingTimeTb
    (
        [Id]            INT IDENTITY(1,1) NOT NULL,
        [AppUserId]     INT NOT NULL,
        [CourseId]      INT NOT NULL,
        [ExerciseStart] INT NOT NULL,
        [ExerciseEnd]   INT NOT NULL,
        [TotalSeconds]  INT NOT NULL DEFAULT 0,
        [LastUpdated]   DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_UserReadingTimeTb] PRIMARY KEY CLUSTERED ([Id] ASC)
    );

    PRINT 'Table UserReadingTimeTb created.';
END
ELSE
BEGIN
    PRINT 'Table UserReadingTimeTb already exists.';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_UserReadingTimeTb_UserExercise' AND object_id = OBJECT_ID('dbo.UserReadingTimeTb'))
BEGIN
    CREATE UNIQUE INDEX [UX_UserReadingTimeTb_UserExercise]
        ON dbo.UserReadingTimeTb ([AppUserId], [CourseId], [ExerciseStart], [ExerciseEnd]);

    PRINT 'Unique index UX_UserReadingTimeTb_UserExercise created.';
END
ELSE
BEGIN
    PRINT 'Unique index UX_UserReadingTimeTb_UserExercise already exists.';
END
GO

PRINT 'Migration completed: UserReadingTimeTb ready.';