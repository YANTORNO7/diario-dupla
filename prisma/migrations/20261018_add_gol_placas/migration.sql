-- CreateTable
CREATE TABLE "gol_placas" (
    "id" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fotoUrl" TEXT NOT NULL,
    "fotoPosX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "fotoPosY" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "fotoScale" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "escudoUrl" TEXT NOT NULL,
    "fondo" TEXT NOT NULL DEFAULT 'azul',
    "franja" TEXT NOT NULL DEFAULT '4',
    "imageUrl" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gol_placas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gol_placas_clubId_idx" ON "gol_placas"("clubId");

-- CreateIndex
CREATE INDEX "gol_placas_userId_idx" ON "gol_placas"("userId");

-- AddForeignKey
ALTER TABLE "gol_placas" ADD CONSTRAINT "gol_placas_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gol_placas" ADD CONSTRAINT "gol_placas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
