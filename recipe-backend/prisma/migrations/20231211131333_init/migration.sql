-- CreateTable
CREATE TABLE "UserLocal" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "UserLocal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGithub" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "UserGithub_pkey" PRIMARY KEY ("id")
);
