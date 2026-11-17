/**
 * pt-strings.ts
 * UI strings for the PT version of the site.
 */

export const PT = {
  siteName:        "Diario Dupla",
  siteDescription: "O jornal do futebol argentino e brasileiro, e dos esportes que nos unem",
  home:            "Início",
  search:          "Buscar",
  readMore:        "Leia mais",
  latestNews:      "Últimas notícias",
  relatedArticles: "Mais de",
  noArticles:      "Sem artigos publicados nesta seção.",
  previous:        "← Anterior",
  next:            "Próximo →",
  translatedFrom:  "Traduzido do espanhol",
  seeOriginal:     "Ver original",
  by:              "Por",
  share:           "Compartilhar",

  months: [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ],

  formatDate(date: Date | string | null): string {
    if (!date) return ""
    const d = new Date(date)
    const day   = d.getDate()
    const month = PT.months[d.getMonth()]
    const year  = d.getFullYear()
    return `${day} de ${month} de ${year}`
  },

  formatDateShort(date: Date | string | null): string {
    if (!date) return ""
    const d = new Date(date)
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  },
}
