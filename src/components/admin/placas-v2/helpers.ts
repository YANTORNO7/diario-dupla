export type Fondo = 'azul' | 'negro'
export type Franja = '4' | 'arg' | 'bra'

export const FONDO_COLORS: Record<Fondo, { bg: string; rgba: string }> = {
  azul: { bg: '#0B1631', rgba: '11,22,49' },
  negro: { bg: '#111214', rgba: '17,18,20' },
}

export function getFranjaInner(franja: Franja): string {
  if (franja === '4')
    return `<div style="flex: 1; background: #74ACDF"></div><div style="flex: 1; background: #FFFFFF"></div><div style="flex: 1; background: #009C3B"></div><div style="flex: 1; background: #F2B632"></div>`
  if (franja === 'arg')
    return `<div style="flex: 1; background: #74ACDF"></div><div style="flex: 1; background: #FFFFFF"></div><div style="flex: 1; background: #74ACDF"></div>`
  return `<div style="flex: 1; background: #009C3B"></div><div style="flex: 1; background: #FFDF00"></div><div style="flex: 1; background: #009C3B"></div>`
}

export function franjaBottom(franja: Franja): string {
  return `<div style="position: absolute; left: 60px; right: 60px; bottom: 40px; height: 8px; display: flex; border-radius: 4px; overflow: hidden">${getFranjaInner(franja)}</div>`
}

export function logo(fondo: Fondo): string {
  const c = FONDO_COLORS[fondo].bg
  return `<div style="position: absolute; left: 48px; top: 48px; display: flex; flex-direction: column">
<div style="background: #FFFFFF; color: ${c}; font-family: 'Bebas Neue', sans-serif; font-size: 56px; line-height: 1; padding: 12px 24px 6px 24px; transform: skewX(-8deg); letter-spacing: 2px">DUPLA</div>
<div style="display: flex; height: 7px; width: 128px; margin-top: -2px">
<div style="flex: 1; background: #74ACDF"></div>
<div style="flex: 1; background: #FFFFFF"></div>
<div style="flex: 1; background: #009C3B"></div>
<div style="flex: 1; background: #F2B632"></div>
</div>
</div>`
}

export function docWrap(inner: string): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Archivo:ital,wght@0,400;0,600;0,800;1,600&display=swap" rel="stylesheet">
<style>body{margin:0}</style>
</head>
<body>${inner}</body>
</html>`
}

export function fotoImg(url: string, w: number, h: number, posX: number, posY: number, scale: number, extraStyle = ''): string {
  const src = url || EMPTY_FOTO
  const scaleStr = scale !== 1 ? ` transform: scale(${scale}); transform-origin: ${posX}% ${posY}%;` : ''
  return `<img src="${src}" alt="" style="position: absolute; left: 0; top: 0; width: ${w}px; height: ${h}px; object-fit: cover; object-position: ${posX}% ${posY}%;${scaleStr}${extraStyle}">`
}

export function escudoImg(url: string, w: number, h: number, extraStyle = ''): string {
  const src = url || EMPTY_ESCUDO
  return `<img src="${src}" alt="" style="width: ${w}px; height: ${h}px; object-fit: contain;${extraStyle}">`
}

// Minimal SVG placeholders
export const EMPTY_FOTO = `data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1350'><rect width='1080' height='1350' fill='%23222'/><text x='540' y='675' font-size='72' fill='%23555' text-anchor='middle' dominant-baseline='middle'>FOTO</text></svg>`
export const EMPTY_ESCUDO = `data:image/svg+xml;charset=utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' fill='%23333' rx='8'/><text x='60' y='65' font-size='14' fill='%23888' text-anchor='middle'>ESCUDO</text></svg>`

export const BALL_SVG = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="1"></circle><polygon points="12,7.2 15.6,9.8 14.2,14 9.8,14 8.4,9.8" fill="#0B1631"></polygon><path d="M12 7.2 L12 2 M15.6 9.8 L20.8 8.2 M14.2 14 L17.4 18.6 M9.8 14 L6.6 18.6 M8.4 9.8 L3.2 8.2" stroke="#0B1631" stroke-width="1.4" fill="none"></path></svg>`
export const YELLOW_CARD = `<div style="width: 15px; height: 21px; background: #F2B632; border-radius: 3px; margin: 0 3px"></div>`
export const RED_CARD = `<div style="width: 15px; height: 21px; background: #E10600; border-radius: 3px; margin: 0 3px"></div>`
