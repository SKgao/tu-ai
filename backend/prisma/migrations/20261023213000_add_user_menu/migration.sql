-- CreateTable
CREATE TABLE "UserMenu" (
    "userId" INTEGER NOT NULL,
    "menuId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMenu_pkey" PRIMARY KEY ("userId","menuId")
);

-- CreateIndex
CREATE INDEX "UserMenu_menuId_idx" ON "UserMenu"("menuId");

-- AddForeignKey
ALTER TABLE "UserMenu" ADD CONSTRAINT "UserMenu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMenu" ADD CONSTRAINT "UserMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
