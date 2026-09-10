-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MERCHANT', 'ADMIN');

-- CreateEnum
CREATE TYPE "StorePlan" AS ENUM ('FREE', 'BASIC', 'PRO');

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "plan" "StorePlan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "telegramBotToken" TEXT,
ADD COLUMN     "telegramChatId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'MERCHANT';
