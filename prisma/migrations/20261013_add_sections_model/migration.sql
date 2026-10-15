-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#888888',
    "order" INTEGER NOT NULL DEFAULT 0,
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sections_slug_key" ON "sections"("slug");

-- AddForeignKey (self-relation for parent/children)
ALTER TABLE "sections" ADD CONSTRAINT "sections_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add sectionId to articles
ALTER TABLE "articles" ADD COLUMN "sectionId" TEXT;

-- CreateIndex
CREATE INDEX "articles_sectionId_status_idx" ON "articles"("sectionId", "status");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable (implicit many-to-many for secondarySections)
CREATE TABLE "_SecondarySections" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SecondarySections_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SecondarySections_B_index" ON "_SecondarySections"("B");

-- AddForeignKey
ALTER TABLE "_SecondarySections" ADD CONSTRAINT "_SecondarySections_A_fkey" FOREIGN KEY ("A") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SecondarySections" ADD CONSTRAINT "_SecondarySections_B_fkey" FOREIGN KEY ("B") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
