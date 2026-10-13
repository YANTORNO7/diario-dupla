import { resend, FROM_EMAIL } from "./resend"
import { SITE_NAME } from "./constants"

export async function notifyAuthor(
  authorEmail: string,
  articleTitle: string,
  action: "approve" | "reject",
  rejectionNote?: string
) {
  const isApproved = action === "approve"

  const subject = isApproved
    ? `Tu artículo fue aprobado — ${SITE_NAME}`
    : `Tu artículo necesita cambios — ${SITE_NAME}`

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#111111;padding:20px 24px;">
            <span style="color:#ffffff;font-size:22px;font-weight:bold;">${SITE_NAME}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <h1 style="margin:0 0 16px;font-size:20px;color:#111111;">
              ${isApproved ? "¡Artículo aprobado!" : "Artículo devuelto para revisión"}
            </h1>
            <p style="margin:0 0 8px;font-size:16px;color:#333333;">
              <strong>"${articleTitle}"</strong>
            </p>
            <p style="margin:0 0 16px;font-size:14px;color:#666666;">
              ${isApproved
                ? "Tu artículo fue aprobado y ya está publicado en el sitio."
                : "Tu artículo fue devuelto para revisión. Por favor, revisá las observaciones y reenvialo."
              }
            </p>
            ${!isApproved && rejectionNote ? `
            <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:4px;padding:12px 16px;margin:0 0 16px;">
              <p style="margin:0;font-size:14px;color:#991B1B;"><strong>Motivo:</strong></p>
              <p style="margin:4px 0 0;font-size:14px;color:#991B1B;">${rejectionNote}</p>
            </div>
            ` : ""}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;background:#f9f9f9;font-size:12px;color:#999999;text-align:center;">
            <p style="margin:0;">Este es un mensaje automático de ${SITE_NAME}.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: authorEmail,
    subject,
    html,
  })
}
