-- Migration: Create UserExerciseProgressTb for tracking completed exercises (KPI)
-- Run this script against your SQL Server database

IF OBJECT_ID('dbo.UserExerciseProgressTb', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserExerciseProgressTb
    (
        [Id]             INT IDENTITY(1,1) NOT NULL,
        [AppUserId]      INT NOT NULL,
        [CourseId]       INT NOT NULL,
        [ExerciseStart]  INT NOT NULL,
        [ExerciseEnd]    INT NOT NULL,
        [Questions]      INT NOT NULL DEFAULT 0,
        [RightQuestions] INT NOT NULL DEFAULT 0,
        [CompletedAt]    DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_UserExerciseProgressTb] PRIMARY KEY CLUSTERED ([Id] ASC)
    );

    PRINT 'Table UserExerciseProgressTb created.';
END
ELSE
BEGIN
    PRINT 'Table UserExerciseProgressTb already exists.';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_UserExerciseProgressTb_UserExercise' AND object_id = OBJECT_ID('dbo.UserExerciseProgressTb'))
BEGIN
    CREATE UNIQUE INDEX [UX_UserExerciseProgressTb_UserExercise]
        ON dbo.UserExerciseProgressTb ([AppUserId], [CourseId], [ExerciseStart], [ExerciseEnd]);

    PRINT 'Unique index UX_UserExerciseProgressTb_UserExercise created.';
END
ELSE
BEGIN
    PRINT 'Unique index UX_UserExerciseProgressTb_UserExercise already exists.';
END
GO

PRINT 'Migration completed: UserExerciseProgressTb ready.';
