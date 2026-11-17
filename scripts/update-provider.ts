import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
async function run() {
  await prisma.siteConfig.upsert({
    where:  { key: "translation_provider" },
    update: { value: "deepl" },
    create: { key: "translation_provider", value: "deepl" },
  })
  console.log("✓ translation_provider = deepl")
  await prisma.$disconnect()
}
run().catch(console.error)
