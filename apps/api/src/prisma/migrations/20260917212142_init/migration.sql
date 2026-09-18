-- CreateEnum
CREATE TYPE "link_source" AS ENUM ('PUBLIC', 'ADMIN');

-- CreateTable
CREATE TABLE "auth_state" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "token_version" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "replaced_by_token_id" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "session_expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "links" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "target_url" TEXT NOT NULL,
    "note" TEXT,
    "expires_at" TIMESTAMP(3),
    "disabled_at" TIMESTAMP(3),
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "last_visited_at" TIMESTAMP(3),
    "source" "link_source" NOT NULL DEFAULT 'PUBLIC',
    "creator_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_daily_stats" (
    "id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "link_daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "idx_refresh_token_subject" ON "refresh_tokens"("subject");

-- CreateIndex
CREATE INDEX "idx_refresh_token_expires_at" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "links_slug_key" ON "links"("slug");

-- CreateIndex
CREATE INDEX "idx_link_created_at" ON "links"("created_at");

-- CreateIndex
CREATE INDEX "idx_link_expires_at" ON "links"("expires_at");

-- CreateIndex
CREATE INDEX "idx_link_creator_hash_created_at" ON "links"("creator_hash", "created_at");

-- CreateIndex
CREATE INDEX "idx_link_daily_stat_date" ON "link_daily_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "link_daily_stats_link_id_date_key" ON "link_daily_stats"("link_id", "date");

-- AddForeignKey
ALTER TABLE "link_daily_stats" ADD CONSTRAINT "link_daily_stats_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
