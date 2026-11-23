# Traducción PT — Pendiente hasta 14 de diciembre 2026

## Estado al 23/11/2026

| Métrica | Valor |
|---|---|
| Artículos publicados (ES) | 244 |
| Con traducción PT | 156 |
| **Sin traducción PT** | **88** |
| Status AUTO (publicables en /pt/) | 74 |
| Status REVIEW (necesitan revisión) | 82 |

> **Cuota DeepL**: agotada (~998k/1M chars). Se renueva el **14 de diciembre 2026**.

---

## Por qué pausamos

La API de DeepL devuelve `429 Quota Exceeded` a partir del ~14 de noviembre. No
tiene sentido forzar traducciones hasta que el plan se renueve.

---

## Cómo retomar en diciembre

### 1. Traducir los 88 artículos sin traducción

Desde la UI de admin:
- Ir a `/admin/configuracion` → sección **Traducción en lote**
- Hacer click en "Traducir artículos sin traducción"
- El endpoint `/api/admin/translate/batch` procesa en lotes de 10

O desde terminal (si se prefiere):
```bash
curl -X POST https://diariodupla.com/api/admin/translate/batch \
  -H "Cookie: <session-cookie>" \
  -H "Content-Type: application/json"
```

### 2. Revisar los 82 artículos con status REVIEW

Los artículos en REVIEW tienen discrepancias detectadas automáticamente
(números, resultados, nombres propios). Para revisarlos:

- Ir a cada artículo en `/admin/articulos/{id}/editar` → pestaña "Português"
- Revisar el texto, corregir si es necesario
- Cambiar status de REVIEW a REVIEWED

O si se decide que están bien tal cual, pueden publicarse igual
(el /pt/ también muestra traducciones AUTO y REVIEW).

---

## Checklist de verificación final (Tarea #25)

Cuando la traducción esté completa, verificar:

- [ ] Todas las URLs del sitio ES siguen respondiendo 200 (mismos titles y canonicals)
- [ ] Interruptor "Apagado": /pt/ devuelve 404
- [ ] Interruptor "Solo admin": /pt/ requiere login
- [ ] Interruptor "Público" + visitante NO-Brasil: sin banner, sin botón PT
- [ ] Interruptor "Público" + visitante Brasil (simular con `x-vercel-ip-country: BR`): banner aparece en artículo con traducción AUTO/REVIEWED
- [ ] 3 artículos PT: revisar canonical `/pt/...`, hreflang en página ES correspondiente
- [ ] Sitemap principal incluye entradas PT con alternates hreflang
- [ ] News sitemap incluye artículos PT de las últimas 48h
- [ ] Google Search Console: agregar propiedad `diariodupla.com/pt/` y enviar sitemap

---

## Procesos en segundo plano

Al pausar (23/11/2026) **no había ningún proceso de traducción corriendo**.
Verificado con `ps aux | grep translate`.
