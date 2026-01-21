-- CreateTable
CREATE TABLE "VoteResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voteId" TEXT NOT NULL,
    "totalVotes" INTEGER NOT NULL,
    "winnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoteResult_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VoteResult_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "VoteOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResultRound" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resultId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "eliminatedId" TEXT,
    CONSTRAINT "ResultRound_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "VoteResult" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResultRound_eliminatedId_fkey" FOREIGN KEY ("eliminatedId") REFERENCES "VoteOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoundTally" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roundId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "votes" INTEGER NOT NULL,
    CONSTRAINT "RoundTally_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "ResultRound" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoundTally_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "VoteOption" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VoteResult_voteId_key" ON "VoteResult"("voteId");

-- CreateIndex
CREATE UNIQUE INDEX "VoteResult_winnerId_key" ON "VoteResult"("winnerId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultRound_eliminatedId_key" ON "ResultRound"("eliminatedId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultRound_resultId_roundNumber_key" ON "ResultRound"("resultId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RoundTally_roundId_optionId_key" ON "RoundTally"("roundId", "optionId");
