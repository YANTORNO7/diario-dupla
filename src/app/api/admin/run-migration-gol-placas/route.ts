import { NextResponse } from "next/server"
import { requireAdminAPI } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const auth = await requireAdminAPI()
  if (auth instanceof NextResponse) return auth

  try {
    // Check if table already exists
    const tableExists = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'gol_placas'
      ) as exists
    `
    if (tableExists[0]?.exists) {
      return NextResponse.json({ ok: true, message: "Tabla gol_placas ya existe." })
    }

    await prisma.$executeRawUnsafe(`
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
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "gol_placas_pkey" PRIMARY KEY ("id")
      )
    `)

    await prisma.$executeRawUnsafe(`CREATE INDEX "gol_placas_clubId_idx" ON "gol_placas"("clubId")`)
    await prisma.$executeRawUnsafe(`CREATE INDEX "gol_placas_userId_idx" ON "gol_placas"("userId")`)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "gol_placas"
      ADD CONSTRAINT "gol_placas_clubId_fkey"
      FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `)
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "gol_placas"
      ADD CONSTRAINT "gol_placas_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `)

    // Register in Prisma migrations table so prisma migrate doesn't re-run it
    await prisma.$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (
        gen_random_uuid()::text,
        'manual',
        NOW(), '20261018_add_gol_placas',
        NULL, NULL, NOW(), 1
      )
      ON CONFLICT DO NOTHING
    `)

    return NextResponse.json({ ok: true, message: "Tabla gol_placas creada correctamente." })
  } catch (err) {
    console.error("[migration] error:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
