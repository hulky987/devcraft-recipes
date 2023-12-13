/*
  Warnings:

  - Added the required column `userId` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "cookingTime" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserLocal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
