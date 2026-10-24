import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // --- Admin user ---
  const username = process.env.ADMIN_USERNAME || "admin"
  const password = process.env.ADMIN_PASSWORD || "admin123"
  const email = process.env.ADMIN_EMAIL || "admin@diariodupla.com"
  const name = process.env.ADMIN_NAME || "Administrador"

  const existing = await prisma.user.findUnique({ where: { username } })
  if (!existing) {
    const hash = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: { username, email, password: hash, name, role: "ADMIN" },
    })
    console.log(`Usuario admin "${username}" creado con éxito.`)
  } else {
    // Always keep admin name in sync with env var
    if (existing.name !== name) {
      await prisma.user.update({ where: { username }, data: { name } })
      console.log(`Admin "${username}" actualizado: "${existing.name}" → "${name}"`)
    } else {
      console.log(`El usuario "${username}" ya existe.`)
    }
  }

  // --- Colaboradores (EDITOR) ---
  const colaboradores = [
    { username: "bartjyantorno", email: "bartjyantorno@gmail.com", name: "Bart J Yantorno" },
    { username: "fabripileggi", email: "fabripileggi@gmail.com", name: "Fabri Pileggi" },
    { username: "kevinfolino", email: "kevinfolino9@gmail.com", name: "Kevin Folino" },
  ]

  for (const colab of colaboradores) {
    const existingColab = await prisma.user.findUnique({ where: { email: colab.email } })
    if (!existingColab) {
      const colabHash = await bcrypt.hash("trescinco35", 10)
      await prisma.user.create({
        data: { username: colab.username, email: colab.email, password: colabHash, name: colab.name, role: "EDITOR" },
      })
      console.log(`Colaborador "${colab.username}" creado.`)
    } else {
      // Always keep collaborator names correct
      if (existingColab.name !== colab.name) {
        await prisma.user.update({ where: { email: colab.email }, data: { name: colab.name } })
        console.log(`Colaborador "${colab.email}" actualizado: "${existingColab.name}" → "${colab.name}"`)
      } else {
        console.log(`Colaborador "${colab.email}" ya existe.`)
      }
    }
  }

  // --- Sections ---
  const laDupla = await prisma.section.upsert({
    where: { slug: "la-dupla" },
    update: { order: 0, description: "La sección de Diario Dupla que reúne todo lo que conecta al fútbol argentino y brasileño" },
    create: { name: "La Dupla", slug: "la-dupla", color: "#FFDF00", order: 0, showOnHomepage: true, description: "La sección de Diario Dupla que reúne todo lo que conecta al fútbol argentino y brasileño" },
  })
  await prisma.section.upsert({
    where: { slug: "clubes" },
    update: { color: "#75AADB" },
    create: { name: "Clubes", slug: "clubes", color: "#75AADB", order: 1, showOnHomepage: false, parentId: laDupla.id },
  })
  await prisma.section.upsert({
    where: { slug: "selecciones" },
    update: { color: "#20B2AA" },
    create: { name: "Selecciones", slug: "selecciones", color: "#20B2AA", order: 2, showOnHomepage: false, parentId: laDupla.id },
  })
  const brasil = await prisma.section.upsert({
    where: { slug: "brasil" },
    update: { name: "Fútbol Brasileño", showOnHomepage: true, order: 1, description: "El Brasileirão, los estaduales y la Seleção, contados para el hincha argentino." },
    create: { name: "Fútbol Brasileño", slug: "brasil", color: "#009C3B", order: 1, showOnHomepage: true, description: "El Brasileirão, los estaduales y la Seleção, contados para el hincha argentino." },
  })
  const argentina = await prisma.section.upsert({
    where: { slug: "argentina" },
    update: { name: "Fútbol Argentino", order: 2, showOnHomepage: true, description: "Todo lo de la Liga Profesional, el ascenso y la Selección: resultados, tablas, previas y lo que pasa en cada club." },
    create: { name: "Fútbol Argentino", slug: "argentina", color: "#75AADB", order: 2, showOnHomepage: true, description: "Todo lo de la Liga Profesional, el ascenso y la Selección: resultados, tablas, previas y lo que pasa en cada club." },
  })
  const copas = await prisma.section.upsert({
    where: { slug: "copas" },
    update: { showOnHomepage: true, order: 3, description: "Libertadores, Sudamericana y todas las competencias donde se cruzan argentinos y brasileños." },
    create: { name: "Copas", slug: "copas", color: "#D4AF37", order: 3, showOnHomepage: true, description: "Libertadores, Sudamericana y todas las competencias donde se cruzan argentinos y brasileños." },
  })
  await prisma.section.upsert({
    where: { slug: "libertadores" },
    update: { color: "#F2B632" },
    create: { name: "Libertadores", slug: "libertadores", color: "#F2B632", order: 1, showOnHomepage: false, parentId: copas.id },
  })
  await prisma.section.upsert({
    where: { slug: "sudamericana" },
    update: { color: "#2F6FDB" },
    create: { name: "Sudamericana", slug: "sudamericana", color: "#2F6FDB", order: 2, showOnHomepage: false, parentId: copas.id },
  })
  // Eliminar Copa Argentina y Copa do Brasil si existen por error
  await prisma.section.deleteMany({ where: { slug: { in: ["copa-argentina", "copa-do-brasil"] } } })

  // Renombrar Automovilismo → Deporte motor (actualizar slug si existe con slug viejo)
  const automovilismoViejo = await prisma.section.findFirst({ where: { slug: "automovilismo" } })
  if (automovilismoViejo) {
    await prisma.section.update({ where: { id: automovilismoViejo.id }, data: { slug: "deporte-motor", name: "Deporte motor" } })
    console.log("Sección 'Automovilismo' renombrada a 'Deporte motor' con slug 'deporte-motor'")
  }
  const deporteMotor = await prisma.section.upsert({
    where: { slug: "deporte-motor" },
    update: { name: "Deporte motor", showOnHomepage: true, order: 4, color: "#DC2626", description: "Todo el deporte motor: carreras, resultados y lo que pasa en las pistas de autos y motos." },
    create: { name: "Deporte motor", slug: "deporte-motor", color: "#DC2626", order: 4, showOnHomepage: true, description: "Todo el deporte motor: carreras, resultados y lo que pasa en las pistas de autos y motos." },
  })
  await prisma.section.upsert({
    where: { slug: "f1" },
    update: { color: "#E10600", parentId: deporteMotor.id },
    create: { name: "F1", slug: "f1", color: "#E10600", order: 1, showOnHomepage: false, parentId: deporteMotor.id },
  })
  await prisma.section.upsert({
    where: { slug: "motogp" },
    update: { color: "#C8A951", parentId: deporteMotor.id },
    create: { name: "MotoGP", slug: "motogp", color: "#C8A951", order: 2, showOnHomepage: false, parentId: deporteMotor.id },
  })
  console.log("Secciones OK: La Dupla (Clubes, Selecciones), Fútbol Brasileño, Fútbol Argentino, Copas (Libertadores, Sudamericana, Copa Argentina, Copa do Brasil), Deporte motor (F1, MotoGP)")

  // Migrate existing articles without sectionId
  const articlesArgentina = await prisma.article.updateMany({
    where: { section: "ARGENTINA", sectionId: null },
    data: { sectionId: argentina.id },
  })
  const articlesBrasil = await prisma.article.updateMany({
    where: { section: "BRASIL", sectionId: null },
    data: { sectionId: brasil.id },
  })
  if (articlesArgentina.count > 0 || articlesBrasil.count > 0) {
    console.log(`Artículos migrados: ${articlesArgentina.count} Argentina, ${articlesBrasil.count} Brasil`)
  }

  // Remover La Dupla como seção secundária indevida
  const wrongSecondary = await prisma.article.findMany({
    where: {
      secondarySections: { some: { id: laDupla.id } },
      NOT: { sectionId: laDupla.id },
    },
    select: { id: true, title: true },
  })
  for (const article of wrongSecondary) {
    await prisma.article.update({
      where: { id: article.id },
      data: { secondarySections: { disconnect: { id: laDupla.id } } },
    })
  }
  if (wrongSecondary.length > 0) {
    console.log(`Corregidos ${wrongSecondary.length} artículos con La Dupla como sección secundaria indebida`)
  }

  // Corrigir artigos que têm La Dupla como seção PRIMÁRIA (não deveria acontecer)
  // Mover para Fútbol Argentino como fallback
  const wrongPrimary = await prisma.article.findMany({
    where: { sectionId: laDupla.id },
    select: { id: true, title: true },
  })
  for (const article of wrongPrimary) {
    await prisma.article.update({
      where: { id: article.id },
      data: { sectionId: argentina.id },
    })
    console.log(`  Artículo "${article.title}" movido de La Dupla a Fútbol Argentino`)
  }
  if (wrongPrimary.length > 0) {
    console.log(`Corregidos ${wrongPrimary.length} artículos con La Dupla como sección primaria`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
