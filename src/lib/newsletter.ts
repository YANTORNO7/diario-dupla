import { prisma } from "./prisma"
import { resend, FROM_EMAIL } from "./resend"
import { SITE_NAME, SITE_URL } from "./constants"

function buildEmailHtml(article: {
  title: string
  subtitle: string | null
  slug: string
  heroImageUrl: string | null
  primarySection: { slug: string; parent?: { slug: string } | null } | null
}) {
  const articlePath = article.primarySection
    ? article.primarySection.parent
      ? `/${article.primarySection.parent.slug}/${article.primarySection.slug}/${article.slug}`
      : `/${article.primarySection.slug}/${article.slug}`
    : `/${article.slug}`
  const articleUrl = `${SITE_URL}${articlePath}`

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#111111;padding:20px 24px;">
            <a href="${SITE_URL}" style="color:#ffffff;font-size:22px;font-weight:bold;text-decoration:none;">${SITE_NAME}</a>
          </td>
        </tr>
        ${article.heroImageUrl ? `<tr><td><img src="${article.heroImageUrl}" alt="" width="600" style="display:block;width:100%;height:auto;"></td></tr>` : ""}
        <tr>
          <td style="padding:24px;">
            <h1 style="margin:0 0 8px;font-size:24px;color:#111111;">${article.title}</h1>
            ${article.subtitle ? `<p style="margin:0 0 16px;font-size:16px;color:#666666;">${article.subtitle}</p>` : ""}
            <a href="${articleUrl}" style="display:inline-block;padding:12px 24px;background:#111111;color:#ffffff;text-decoration:none;border-radius:4px;font-weight:bold;">Leer artículo</a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;background:#f9f9f9;font-size:12px;color:#999999;text-align:center;">
            <p style="margin:0 0 8px;">Recibís este email porque te suscribiste a ${SITE_NAME}.</p>
            <a href="${SITE_URL}/api/subscriber/unsubscribe?email=%%EMAIL%%" style="color:#999999;">Cancelar suscripción</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendNewsletter(articleId: string) {
  try {
    const existing = await prisma.newsletterLog.findUnique({
      where: { articleId },
    })
    if (existing) return

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        primarySection: {
          include: { parent: true },
        },
      },
    })
    if (!article || article.status !== "PUBLISHED") return

    const subscribers = await prisma.subscriber.findMany({
      where: { newsletterOptIn: true, emailVerified: true },
      select: { email: true },
    })
    if (subscribers.length === 0) return

    const html = buildEmailHtml(article)

    const batchSize = 50
    let sentCount = 0

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)
      const promises = batch.map((sub) =>
        resend.emails.send({
          from: FROM_EMAIL,
          to: sub.email,
          subject: `${article.title} — ${SITE_NAME}`,
          html: html.replace("%%EMAIL%%", encodeURIComponent(sub.email)),
        })
      )
      const results = await Promise.allSettled(promises)
      sentCount += results.filter((r) => r.status === "fulfilled").length
    }

    await prisma.newsletterLog.create({
      data: { articleId, sentCount },
    })
  } catch (error) {
    console.error("Error enviando newsletter:", error)
  }
}
