/*
  Warnings:

  - A unique constraint covering the columns `[title,partOfSpeech,article]` on the table `Word` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,partOfSpeech,article,ownerId]` on the table `Word` will be added. If there are existing duplicate values, this will fail.

*/

-- DropIndex
DROP INDEX "Word_title_partOfSpeech_article_key";

-- AlterTable
ALTER TABLE "Word" ADD COLUMN "ownerId" TEXT;

-- CreateIndex
CREATE INDEX "Word_ownerId_idx" ON "Word"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Word_title_partOfSpeech_article_key" ON "Word"("title", "partOfSpeech", "article") WHERE ("ownerId" IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "Word_title_partOfSpeech_article_ownerId_key" ON "Word"("title", "partOfSpeech", "article", "ownerId") WHERE ("ownerId" IS NOT NULL);

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
