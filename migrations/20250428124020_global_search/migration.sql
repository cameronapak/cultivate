-- CreateIndex
CREATE INDEX "Resource_title_description_url_idx" ON "Resource"("title", "description", "url");

-- CreateIndex
CREATE INDEX "Task_title_description_idx" ON "Task"("title", "description");

-- CreateIndex
CREATE INDEX "Thought_content_idx" ON "Thought"("content");
