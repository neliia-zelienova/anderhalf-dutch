-- CreateEnum
CREATE TYPE "Language" AS ENUM ('en', 'uk', 'it', 'es', 'de', 'pl', 'da', 'fi');

-- CreateEnum
CREATE TYPE "PartOfSpeech" AS ENUM ('noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'numeral');

-- CreateEnum
CREATE TYPE "Article" AS ENUM ('de', 'het', 'none');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('review', 'new', 'learning');

-- CreateEnum
CREATE TYPE "WordStatus" AS ENUM ('new', 'learning', 'review', 'relearning');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('again', 'hard', 'good', 'easy');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "language" "Language" NOT NULL,
    "desiredRetention" DOUBLE PRECISION NOT NULL DEFAULT 0.9,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "article" "Article" NOT NULL DEFAULT 'none',
    "partOfSpeech" "PartOfSpeech" NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordTranslation" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "example" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stabilityFast" DOUBLE PRECISION NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "lastReviewAt" TIMESTAMP(3),
    "reps" INTEGER NOT NULL,
    "lapses" INTEGER NOT NULL,
    "scheduledDays" INTEGER NOT NULL,
    "learningStep" INTEGER NOT NULL,
    "state" "WordStatus" NOT NULL DEFAULT 'new',
    "scheduleStatus" "ScheduleStatus" NOT NULL DEFAULT 'new',

    CONSTRAINT "UserWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "userWordId" TEXT NOT NULL,
    "stabilityFast" DOUBLE PRECISION NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "lastReviewAt" TIMESTAMP(3),
    "scheduledDays" INTEGER NOT NULL,
    "learningStep" INTEGER NOT NULL,
    "reviewTime" TIMESTAMP(3) NOT NULL,
    "state" "WordStatus" NOT NULL,
    "scheduleStatus" "ScheduleStatus" NOT NULL,
    "rating" "Grade" NOT NULL,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Word_title_partOfSpeech_article_key" ON "Word"("title", "partOfSpeech", "article");

-- CreateIndex
CREATE UNIQUE INDEX "WordTranslation_wordId_language_key" ON "WordTranslation"("wordId", "language");

-- CreateIndex
CREATE INDEX "UserWord_userId_dueAt_idx" ON "UserWord"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserWord_userId_wordId_key" ON "UserWord"("userId", "wordId");

-- AddForeignKey
ALTER TABLE "WordTranslation" ADD CONSTRAINT "WordTranslation_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWord" ADD CONSTRAINT "UserWord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWord" ADD CONSTRAINT "UserWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_userWordId_fkey" FOREIGN KEY ("userWordId") REFERENCES "UserWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
