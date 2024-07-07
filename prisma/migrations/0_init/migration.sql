-- CreateTable
CREATE TABLE "project_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "project_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectTypeId" TEXT NOT NULL,
    "url" TEXT,
    "imageUrl" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "registered" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "cdnAccess" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shortened_urls" (
    "id" TEXT NOT NULL,
    "originUrl" TEXT NOT NULL,
    "expirationDate" TIMESTAMPTZ(6),

    CONSTRAINT "shorted_url_pkey" PRIMARY KEY ("id")
);

