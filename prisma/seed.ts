import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin"
  const password = process.env.ADMIN_PASSWORD || "admin123"
  const email = process.env.ADMIN_EMAIL || "admin@diariodupla.com"
  const name = process.env.ADMIN_NAME || "Administrador"

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    console.log(`El usuario "${username}" ya existe.`)
    return
  }

  const hash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      username,
      email,
      password: hash,
      name,
      role: "ADMIN",
    },
  })

  console.log(`Usuario admin "${username}" creado con éxito.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
