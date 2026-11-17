export {}
/**
 * Backup do banco de produção via Prisma → JSON
 * Salva em ~/Backups/diario-dupla/ fora do projeto
 */
import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

async function run() {
  const backupDir = path.join(process.env.HOME!, "Backups", "diario-dupla")
  fs.mkdirSync(backupDir, { recursive: true })
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`)

  console.log("Iniciando backup...")
  
  const [articles, sections, users, tags, articleTranslations, glossaryTerms, siteConfig, clubs] = await Promise.all([
    prisma.article.findMany(),
    prisma.section.findMany(),
    prisma.user.findMany({ select: { id: true, username: true, name: true, email: true, role: true, active: true, createdAt: true, updatedAt: true } }), // sem password
    prisma.tag.findMany(),
    prisma.articleTranslation.findMany(),
    prisma.glossaryTerm.findMany(),
    prisma.siteConfig.findMany(),
    prisma.club.findMany(),
  ])

  const backup = {
    timestamp: new Date().toISOString(),
    tables: {
      articles:            { count: articles.length,            data: articles },
      sections:            { count: sections.length,            data: sections },
      users:               { count: users.length,               data: users },
      tags:                { count: tags.length,                data: tags },
      articleTranslations: { count: articleTranslations.length, data: articleTranslations },
      glossaryTerms:       { count: glossaryTerms.length,       data: glossaryTerms },
      siteConfig:          { count: siteConfig.length,          data: siteConfig },
      clubs:               { count: clubs.length,               data: clubs },
    }
  }

  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))
  
  const stats = fs.statSync(backupFile)
  const sizeMb = (stats.size / 1024 / 1024).toFixed(2)
  
  console.log(`✓ Backup salvo em: ${backupFile}`)
  console.log(`  Tamanho: ${sizeMb} MB`)
  console.log(`  Artigos: ${articles.length}`)
  console.log(`  Seções: ${sections.length}`)
  console.log(`  Usuários: ${users.length} (sem senhas)`)
  console.log(`  Traduções PT: ${articleTranslations.length}`)
  console.log(`  Glossário: ${glossaryTerms.length} termos`)

  await prisma.$disconnect()
}
run().catch(console.error)
