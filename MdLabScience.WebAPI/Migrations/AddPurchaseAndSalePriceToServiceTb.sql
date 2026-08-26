-- Migration: Add PurchasePrice and SalePrice columns to ServiceTb
-- Run this script against your SQL Server database

-- Add PurchasePrice column with default value 0
ALTER TABLE ServiceTb
ADD PurchasePrice DECIMAL(18,2) NOT NULL DEFAULT 0;

-- Add SalePrice column with default value 0
ALTER TABLE ServiceTb
ADD SalePrice DECIMAL(18,2) NOT NULL DEFAULT 0;

-- Update existing services to have 0 prices (if not already set by default)
UPDATE ServiceTb
SET PurchasePrice = 0, SalePrice = 0
WHERE PurchasePrice IS NULL OR SalePrice IS NULL;

PRINT 'Migration completed: PurchasePrice and SalePrice columns added to ServiceTb';
