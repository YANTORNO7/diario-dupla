import { docWrap } from '../helpers'
import type { M1State, M2State, M3State, M4State, M5State, MotorPilot, MotorRow, GrillaRow } from './types'

// ---- Shared design constants ----

const PILOT_PATH = `M200 40c52 0 88 40 88 98 0 46-22 84-52 98v22c70 12 140 40 164 92 8 18 0 110 0 110H0s-8-92 0-110c24-52 94-80 164-92v-22c-30-14-52-52-52-98 0-58 36-98 88-98z`

// ---- Private helpers ----

function motorStripes(opacity = '.035', spacing = '90px 150px'): string {
  return `<div style="position:absolute;inset:0;background:repeating-linear-gradient(120deg,rgba(255,255,255,0) 0 ${spacing.split(' ')[0]},rgba(255,255,255,${opacity}) ${spacing})"></div>`
}

function panelStripes(): string {
  return `<div style="position:absolute;inset:0;background:repeating-linear-gradient(120deg,rgba(255,255,255,0) 0 40px,rgba(255,255,255,.07) 40px 70px)"></div>`
}

function accentBars(color: string): string {
  return `<div style="position:absolute;left:0;right:0;top:66px;display:flex;align-items:center">
<div style="flex:1"></div><div style="width:640px;height:14px;background:${color};transform:skewX(-30deg);margin-right:-20px"></div>
</div>
<div style="position:absolute;left:0;right:0;top:88px;display:flex">
<div style="flex:1"></div><div style="width:560px;height:6px;background:${color};transform:skewX(-30deg);margin-right:-20px"></div>
</div>`
}

function motorLogo(bgColor: string): string {
  return `<div style="position:absolute;left:48px;top:48px;display:flex;flex-direction:column;z-index:5">
<div style="background:#FFF;color:${bgColor};font-family:'Bebas Neue',sans-serif;font-size:52px;line-height:1;padding:12px 22px 6px;transform:skewX(-8deg);letter-spacing:2px">DUPLA</div>
<div style="display:flex;height:7px;width:120px;margin-top:-2px">
<div style="flex:1;background:#74ACDF"></div><div style="flex:1;background:#FFF"></div><div style="flex:1;background:#009C3B"></div><div style="flex:1;background:#F2B632"></div>
</div></div>`
}

function bottomBar(accentColor: string): string {
  return `<div style="position:absolute;left:60px;right:60px;bottom:36px;height:8px;display:flex;border-radius:4px;overflow:hidden;z-index:6">
<div style="flex:1;background:${accentColor}"></div><div style="flex:1;background:#FFF"></div><div style="flex:1;background:${accentColor}"></div>
</div>`
}

function pilotFotoInPanel(p: MotorPilot): string {
  if (!p.foto) {
    return `<svg viewBox="0 0 400 460" preserveAspectRatio="xMidYMax meet" style="position:absolute;left:0;right:0;bottom:0;width:100%;height:100%"><path d="${PILOT_PATH}" fill="rgba(255,255,255,.22)"/></svg>`
  }
  const sc = p.fotoScale !== 1 ? `transform:scale(${p.fotoScale});transform-origin:${p.fotoPosX}% bottom;` : ''
  return `<img src="${p.foto}" alt="" style="position:absolute;left:0;right:0;bottom:0;width:100%;height:100%;object-fit:contain;object-position:${p.fotoPosX}% bottom;${sc}">`
}

function pilotFotoFull(foto: string, posX: number, posY: number, scale: number): string {
  if (!foto) {
    return `<svg viewBox="0 0 400 460" preserveAspectRatio="xMidYMax meet" style="position:absolute;left:0;right:0;bottom:0;width:100%;height:100%"><path d="${PILOT_PATH}" fill="rgba(255,255,255,.22)"/></svg>`
  }
  const sc = scale !== 1 ? `transform:scale(${scale});transform-origin:${posX}% bottom;` : ''
  return `<img src="${foto}" alt="" style="position:absolute;left:0;right:0;bottom:0;width:100%;height:100%;object-fit:contain;object-position:${posX}% bottom;${sc}">`
}

function nameBar(color: string, flag: string, apellido: string, fontSize = 40): string {
  return `<div style="position:absolute;left:0;right:0;bottom:0;height:78px;background:${color};display:flex;align-items:center;justify-content:center;gap:10px;font-family:'Bebas Neue',sans-serif;font-size:${fontSize}px;letter-spacing:2px;color:#FFF;z-index:3">
<span style="font-size:${Math.round(fontSize * 0.7)}px;line-height:1">${flag}</span>${apellido}
</div>`
}

function panelGradient(color: string): string {
  return `linear-gradient(160deg,${color},rgba(0,0,0,.55)),${color}`
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) || 14
  const g = parseInt(hex.slice(3, 5), 16) || 15
  const b = parseInt(hex.slice(5, 7), 16) || 19
  return `${r},${g},${b}`
}

// ---- M1 – Resultado de carrera con podio ----

function podiumPanel(p: MotorPilot, pos: number, w: number, h: number, accentColor: string): string {
  const c = p.panelColor
  return `<div style="position:relative;width:${w}px;height:${h}px;background:${panelGradient(c)};overflow:hidden">
${panelStripes()}
<div style="position:absolute;left:14px;top:4px;font-family:'Bebas Neue',sans-serif;font-size:150px;line-height:1;color:#FFF;z-index:2;text-shadow:0 4px 0 rgba(0,0,0,.2)">${pos}</div>
<div style="position:absolute;left:0;right:0;top:40px;bottom:78px">
${pilotFotoInPanel(p)}
</div>
<div style="position:absolute;right:10px;bottom:90px;background:rgba(0,0,0,.55);padding:6px 10px;text-align:center;z-index:3">
<div style="font-family:'Bebas Neue',sans-serif;font-size:38px;line-height:.9;color:#F2B632">${p.puntos}</div>
<div style="font-size:11px;font-weight:800;letter-spacing:2px;color:#F2B632">PTS</div>
</div>
${nameBar(c, p.pais, p.piloto)}
</div>`
}

function resultRow(r: MotorRow, idx: number, accentColor: string): string {
  const bg = idx % 2 === 0 ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)'
  return `<div style="display:grid;grid-template-columns:62px 1fr 260px 80px;align-items:center;height:56px;background:${bg}">
<div style="height:56px;background:${accentColor};display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:34px">${r.pos}</div>
<div style="padding-left:18px;font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:1px">${r.piloto}</div>
<div style="display:flex;align-items:center;gap:10px;font-family:'Bebas Neue',sans-serif;font-size:28px;color:#B8BCC4">
<span style="width:6px;height:28px;background:${r.equipoColor}"></span>${r.equipo}
</div>
<div style="text-align:center;font-family:'Bebas Neue',sans-serif;font-size:30px;line-height:.9;color:#F2B632">${r.puntos}<div style="font-family:'Archivo',sans-serif;font-size:10px;font-weight:800;letter-spacing:2px">PTS</div></div>
</div>`
}

export function renderM1(d: M1State): string {
  const rowsHtml = d.rows.map((r, i) => resultRow(r, i, d.accentColor)).join('')
  return docWrap(`<div style="width:1080px;height:1350px;position:relative;overflow:hidden;background:${d.bgColor};color:#FFF;font-family:'Archivo',sans-serif">
${motorStripes()}
${accentBars(d.accentColor)}
<div style="position:absolute;left:0;right:0;top:132px;text-align:center;font-family:'Bebas Neue',sans-serif;font-size:64px;letter-spacing:4px">
<span style="color:#F2B632">${d.fecha}</span> / GP DE ${d.gp}
</div>
<div style="position:absolute;left:60px;right:60px;top:220px;display:flex;gap:22px;justify-content:center;align-items:flex-start">
<div style="margin-top:60px">${podiumPanel(d.p2, 2, 305, 560, d.accentColor)}</div>
<div style="margin-top:0px">${podiumPanel(d.p1, 1, 305, 620, d.accentColor)}</div>
<div style="margin-top:80px">${podiumPanel(d.p3, 3, 305, 540, d.accentColor)}</div>
</div>
<div style="position:absolute;left:60px;right:60px;top:862px">
${rowsHtml}
</div>
${motorLogo(d.bgColor)}
${bottomBar(d.accentColor)}
</div>`)
}

// ---- M2 – Piloto destacado ----

export function renderM2(d: M2State): string {
  const rgb = hexToRgb(d.bgColor)
  return docWrap(`<div style="width:1080px;height:1350px;position:relative;overflow:hidden;background:${d.bgColor};color:#FFF;font-family:'Archivo',sans-serif">
${motorStripes('.035', '90px 150px')}
<div style="position:absolute;inset:0;background:linear-gradient(180deg,${d.panelColor} 0%,rgba(0,0,0,0) 70%);opacity:.75"></div>
<div style="position:absolute;inset:0;background:repeating-linear-gradient(120deg,rgba(255,255,255,0) 0 120px,rgba(255,255,255,.06) 120px 200px)"></div>
${accentBars(d.accentColor)}
<div style="position:absolute;left:90px;right:90px;top:150px;bottom:330px">
${pilotFotoFull(d.foto, d.fotoPosX, d.fotoPosY, d.fotoScale)}
</div>
<div style="position:absolute;left:0;right:0;top:880px;height:470px;background:linear-gradient(180deg,rgba(${rgb},0),${d.bgColor} 35%)"></div>
<div style="position:absolute;left:0;right:0;top:960px;text-align:center;font-size:30px;font-weight:800;letter-spacing:22px;padding-left:22px">${d.piloto}</div>
<div style="position:absolute;left:0;right:0;top:1000px;text-align:center;font-family:'Bebas Neue',sans-serif;font-size:230px;line-height:1;letter-spacing:4px;transform:skewX(-6deg)">${d.palabraGigante}</div>
<div style="position:absolute;left:0;right:0;top:1228px;text-align:center;font-size:24px;font-weight:600;letter-spacing:12px;padding-left:12px;color:#B8BCC4">${d.lineaDatos}</div>
${motorLogo(d.bgColor)}
${bottomBar(d.accentColor)}
</div>`)
}

// ---- M3 – El más rápido ----

export function renderM3(d: M3State): string {
  const p = d.p1
  const c = p.panelColor
  return docWrap(`<div style="width:1080px;height:1350px;position:relative;overflow:hidden;background:${d.bgColor};color:#FFF;font-family:'Archivo',sans-serif">
${motorStripes()}
${accentBars(d.accentColor)}
<div style="position:absolute;left:0;right:0;top:128px;text-align:center;font-family:'Bebas Neue',sans-serif;font-size:150px;line-height:1;letter-spacing:6px;transform:skewX(-6deg)">EL MÁS RÁPIDO</div>
<div style="position:absolute;left:0;right:0;top:278px;text-align:center;font-size:30px;font-weight:800;letter-spacing:16px;padding-left:16px;color:#F2B632">${d.sesion.toUpperCase()}</div>
<div style="position:absolute;left:60px;right:60px;top:360px;bottom:110px">
<div style="position:relative;width:960px;height:880px;background:${panelGradient(c)};overflow:hidden">
${panelStripes()}
<div style="position:absolute;left:0;right:0;top:40px;bottom:78px">
${pilotFotoInPanel(p)}
</div>
${nameBar(c, p.pais, p.piloto)}
</div>
</div>
${motorLogo(d.bgColor)}
${bottomBar(d.accentColor)}
</div>`)
}

// ---- M4 – Los más rápidos (top 3 sesión) ----

function sesionPanel(p: MotorPilot, pos: string): string {
  const c = p.panelColor
  return `<div style="position:relative;width:310px;height:820px;background:${panelGradient(c)};overflow:hidden">
${panelStripes()}
<div style="position:absolute;left:14px;top:4px;font-family:'Bebas Neue',sans-serif;font-size:90px;line-height:1;color:#FFF;z-index:2;text-shadow:0 4px 0 rgba(0,0,0,.2)">${pos}</div>
<div style="position:absolute;left:0;right:0;top:40px;bottom:78px">
${pilotFotoInPanel(p)}
</div>
${nameBar(c, p.pais, p.piloto)}
</div>`
}

export function renderM4(d: M4State): string {
  return docWrap(`<div style="width:1080px;height:1350px;position:relative;overflow:hidden;background:${d.bgColor};color:#FFF;font-family:'Archivo',sans-serif">
${motorStripes()}
${accentBars(d.accentColor)}
<div style="position:absolute;left:0;right:0;top:128px;text-align:center;font-family:'Bebas Neue',sans-serif;font-size:150px;line-height:1;letter-spacing:6px;transform:skewX(-6deg)">LOS MÁS RÁPIDOS</div>
<div style="position:absolute;left:0;right:0;top:278px;text-align:center;font-size:30px;font-weight:800;letter-spacing:16px;padding-left:16px;color:#F2B632">${d.sesion.toUpperCase()}</div>
<div style="position:absolute;left:60px;right:60px;top:380px;display:flex;gap:15px;justify-content:center">
${sesionPanel(d.p2, '2°')}
${sesionPanel(d.p1, '1°')}
${sesionPanel(d.p3, '3°')}
</div>
${motorLogo(d.bgColor)}
${bottomBar(d.accentColor)}
</div>`)
}

// ---- M5 – Grilla de largada ----

function grillaRowHtml(r: GrillaRow, idx: number, highlighted: boolean): string {
  const n = parseInt(r.pos)
  const isTop2 = n <= 2
  const bg = highlighted
    ? 'background:rgba(242,182,50,.18);outline:2px solid #F2B632'
    : idx % 2 === 0 ? 'background:rgba(255,255,255,.06)' : 'background:rgba(255,255,255,.03)'
  const posColor = isTop2 ? '#F2B632' : '#FFF'
  return `<div style="display:grid;grid-template-columns:56px 8px 1fr auto;align-items:center;height:70px;${bg};margin-top:6px">
<div style="font-family:'Bebas Neue',sans-serif;font-size:38px;text-align:center;color:${posColor}">${r.pos}</div>
<div style="height:40px;background:${r.equipoColor}"></div>
<div style="padding-left:14px">
<div style="font-family:'Bebas Neue',sans-serif;font-size:32px;line-height:1;letter-spacing:1px">${r.piloto}</div>
<div style="font-size:13px;font-weight:600;letter-spacing:2px;color:#B8BCC4">${r.equipo}</div>
</div>
<div style="padding-right:16px;font-size:18px;font-weight:600;color:#B8BCC4">${r.tiempo || '—'}</div>
</div>`
}

export function renderM5(d: M5State): string {
  const half = Math.ceil(d.rows.length / 2)
  const leftRows = d.rows.slice(0, half)
  const rightRows = d.rows.slice(half)
  const leftHtml = leftRows.map((r, i) => grillaRowHtml(r, i, !!d.destacado && r.piloto === d.destacado)).join('')
  const rightHtml = rightRows.map((r, i) => grillaRowHtml(r, i, !!d.destacado && r.piloto === d.destacado)).join('')
  const legend = d.destacado
    ? `<div style="position:absolute;left:60px;right:60px;top:1190px;font-size:16px;font-weight:800;letter-spacing:2px;color:#B8BCC4;display:flex;align-items:center;gap:10px"><div style="width:18px;height:18px;outline:2px solid #F2B632;background:rgba(242,182,50,.18);flex-shrink:0"></div>${d.destacado}</div>`
    : ''
  return docWrap(`<div style="width:1080px;height:1350px;position:relative;overflow:hidden;background:${d.bgColor};color:#FFF;font-family:'Archivo',sans-serif">
${motorStripes()}
${motorLogo(d.bgColor)}
<div style="position:absolute;left:60px;right:60px;top:150px">
<div style="display:inline-block;background:${d.accentColor};color:#FFF;font-size:22px;font-weight:800;letter-spacing:5px;padding:10px 22px 9px">${d.categoria.toUpperCase()} · ${d.gp.toUpperCase()}</div>
<div style="margin-top:14px;font-family:'Bebas Neue',sans-serif;font-size:104px;line-height:.9;letter-spacing:2px;transform:skewX(-6deg)">GRILLA DE LARGADA</div>
<div style="margin-top:12px;font-size:20px;font-weight:800;letter-spacing:4px;color:#B8BCC4">${d.circuito} · ${d.fecha}</div>
</div>
<div style="position:absolute;left:60px;right:60px;top:390px;display:grid;grid-template-columns:1fr 1fr;column-gap:20px">
<div>${leftHtml}</div>
<div>${rightHtml}</div>
</div>
${legend}
${bottomBar(d.accentColor)}
</div>`)
}
