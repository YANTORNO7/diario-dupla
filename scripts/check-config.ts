import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function run() {
  const configs = await prisma.siteConfig.findMany({ orderBy: { key: "asc" } })
  for (const c of configs) console.log(`${c.key} = "${c.value}"`)
  
  const sectionCount = await prisma.section.count({ where: { NOT: { slugPt: null } } })
  console.log(`\nSeções com slugPt: ${sectionCount}`)
  
  const glossaryCount = await prisma.glossaryTerm.count()
  console.log(`Termos do glossário: ${glossaryCount}`)
  
  const migrationResult = await prisma.$queryRaw`SELECT migration_name FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5` as any[]
  console.log(`\nMigrações recentes:`)
  for (const m of migrationResult) console.log(`  - ${m.migration_name}`)
  
  await prisma.$disconnect()
}
run().catch(console.error)
