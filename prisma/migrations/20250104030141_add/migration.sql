/*
  Warnings:

  - Added the required column `transactionAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `transactionAt` DATETIME(3) NOT NULL;
