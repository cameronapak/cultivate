-- CreateTable
CREATE TABLE "InviteCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedByUserId" INTEGER NOT NULL,
    "claimedByUserId" INTEGER,

    CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InviteCode_code_key" ON "InviteCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "InviteCode_claimedByUserId_key" ON "InviteCode"("claimedByUserId");

-- AddForeignKey
ALTER TABLE "InviteCode" ADD CONSTRAINT "InviteCode_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteCode" ADD CONSTRAINT "InviteCode_claimedByUserId_fkey" FOREIGN KEY ("claimedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
