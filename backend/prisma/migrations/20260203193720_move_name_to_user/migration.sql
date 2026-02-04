/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Patient` DROP COLUMN `createdAt`,
    DROP COLUMN `email`,
    DROP COLUMN `firstName`,
    DROP COLUMN `lastName`,
    DROP COLUMN `phone`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL;
