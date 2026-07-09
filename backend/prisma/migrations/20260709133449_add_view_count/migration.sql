-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Blog_viewCount_idx" ON "Blog"("viewCount");
