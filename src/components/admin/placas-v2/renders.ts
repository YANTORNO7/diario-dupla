import {
  FONDO_COLORS, docWrap, logo, franjaBottom, fotoImg, escudoImg,
  BALL_SVG, YELLOW_CARD, RED_CARD
} from './helpers'
import type {
  GolState, ResultadoState, ExpulsionState, FraseState, PreviaState,
  NoticiaState, FormacionState, CaraACaraState, FotoSitioState,
  NoticiaBrasilState, TablaAnualState, AnuncioState, EventRow, TableRow
} from './types'

function renderEventRow(ev: EventRow): string {
  const icon = ev.type === 'gol' ? BALL_SVG : ev.type === 'amarilla' ? YELLOW_CARD : RED_CARD
  return `<div style="display: flex; align-items: center; gap: 8px; margin-top: 2px">
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 30px; line-height: 1; color: #F2B632">${ev.minute}'</div>
${icon}
<div style="font-size: 22px; font-weight: 800">${ev.player}</div>
</div>`
}

function renderTableRow(row: TableRow, idx: number): string {
  const bgRow = idx % 2 === 0 ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'
  const zoneBg = row.zone === 'verde' ? '#009C3B' : row.zone === 'amarillo' ? '#F2B632' : row.zone === 'azul' ? '#2F6FDB' : 'transparent'
  const zoneColor = row.zone === 'amarillo' ? '#0B1631' : '#FFFFFF'
  return `<div style="display: grid; grid-template-columns: 64px 56px minmax(0,1fr) 96px 72px 72px 88px; align-items: center; height: 51px; margin-top: 4px; background: ${bgRow}">
<div style="height: 51px; display: flex; align-items: center; justify-content: center; background: ${zoneBg}; color: ${zoneColor}; font-family: 'Bebas Neue', sans-serif; font-size: 36px; line-height: 1">${idx + 1}</div>
${escudoImg(row.escudo, 40, 40, ' justify-self: center;')}
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 36px; line-height: 1; letter-spacing: 1px; padding-left: 8px; white-space: nowrap; overflow: hidden">${row.team}</div>
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 40px; line-height: 1; text-align: center; color: #F2B632">${row.pts}</div>
<div style="font-size: 22px; font-weight: 600; text-align: center">${row.pj}</div>
<div style="font-size: 22px; font-weight: 600; text-align: center">${row.pg}</div>
<div style="font-size: 22px; font-weight: 600; text-align: center">${row.dg}</div>
</div>`
}

export function render01Gol(d: GolState): string {
  const { bg, rgba } = FONDO_COLORS[d.fondo]
  return docWrap(`<div style="width: 1080px; height: 1350px; position: relative; overflow: hidden; background: ${bg}; color: #FFFFFF; font-family: 'Archivo', sans-serif">
${fotoImg(d.foto, 1080, 1000, d.fotoPosX, d.fotoPosY, d.fotoScale)}
<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 1020px; background: linear-gradient(180deg, rgba(${rgba},0.55) 0%, rgba(${rgba},0) 16%, rgba(${rgba},0) 52%, rgba(${rgba},0.85) 80%, ${bg} 100%)"></div>
${logo(d.fondo)}
<div style="position: absolute; left: 0; right: 0; top: 800px; display: flex; flex-direction: column; align-items: center">
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 320px; line-height: 0.82; letter-spacing: 6px; color: #F2B632; transform: skewX(-6deg); text-shadow: 0 8px 0 rgba(0,0,0,0.35)">GOOOL</div>
<div style="margin-top: 36px; display: flex; align-items: center; gap: 28px">
${escudoImg(d.escudo1, 120, 120)}
<div style="width: 3px; height: 92px; background: #F2B632"></div>
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 104px; line-height: 1; letter-spacing: 2px">${d.playerName}</div>
</div>
</div>
${franjaBottom(d.franja)}
</div>`)
}

function renderResultadoBase(d: ResultadoState, badge: string): string {
  const { bg, rgba } = FONDO_COLORS[d.fondo]
  const ev1 = d.events.filter(e => e.team === 1)
  const ev2 = d.events.filter(e => e.team === 2)
  return docWrap(`<div style="width: 1080px; height: 1350px; position: relative; overflow: hidden; background: ${bg}; color: #FFFFFF; font-family: 'Archivo', sans-serif">
${fotoImg(d.foto, 1080, 960, d.fotoPosX, d.fotoPosY, d.fotoScale)}
<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 980px; background: linear-gradient(180deg, rgba(${rgba},0.55) 0%, rgba(${rgba},0) 16%, rgba(${rgba},0) 55%, rgba(${rgba},0.85) 82%, ${bg} 100%)"></div>
${logo(d.fondo)}
<div style="position: absolute; left: 64px; right: 64px; top: 868px; display: flex; flex-direction: column; align-items: center">
<div style="background: #F2B632; color: ${bg}; font-size: 22px; font-weight: 800; letter-spacing: 5px; padding: 10px 22px 9px 22px">${badge}</div>
<div style="margin-top: 34px; width: 100%; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: center">
<div style="display: flex; flex-direction: column; align-items: center; gap: 12px">
${escudoImg(d.escudo1, 130, 130)}
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 48px; line-height: 1; letter-spacing: 2px">${d.team1}</div>
${ev1.map(renderEventRow).join('')}
</div>
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 220px; line-height: 0.85; text-align: center; letter-spacing: 4px">${d.score1}<span style="color: #F2B632; padding: 0 18px">-</span>${d.score2}</div>
<div style="display: flex; flex-direction: column; align-items: center; gap: 12px">
${escudoImg(d.escudo2, 130, 130)}
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 48px; line-height: 1; letter-spacing: 2px">${d.team2}</div>
${ev2.map(renderEventRow).join('')}
</div>
</div>
<div style="margin-top: 30px; font-size: 18px; font-weight: 600; letter-spacing: 3px; color: #B8C2D9">${d.info}</div>
</div>
${franjaBottom(d.franja)}
</div>`)
}

export function render02ResultadoFinal(d: ResultadoState): string {
  return renderResultadoBase(d, d.badge)
}

export function render03Entretiempo(d: ResultadoState): string {
  return renderResultadoBase(d, d.badge)
}

export function render04Expulsion(d: ExpulsionState): string {
  const { bg, rgba } = FONDO_COLORS[d.fondo]
  return docWrap(`<div style="width: 1080px; height: 1350px; position: relative; overflow: hidden; background: ${bg}; color: #FFFFFF; font-family: 'Archivo', sans-serif">
${fotoImg(d.foto, 1080, 1040, d.fotoPosX, d.fotoPosY, d.fotoScale)}
<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 1060px; background: linear-gradient(180deg, rgba(${rgba},0.55) 0%, rgba(${rgba},0) 16%, rgba(${rgba},0) 52%, rgba(${rgba},0.85) 80%, ${bg} 100%)"></div>
${logo(d.fondo)}
<div style="position: absolute; left: 0; right: 0; top: 960px; display: flex; flex-direction: column; align-items: center">
<div style="display: flex; align-items: center; gap: 26px">
<div style="width: 80px; height: 114px; background: #E10600; border-radius: 8px; transform: rotate(10deg); box-shadow: 0 10px 0 rgba(0,0,0,0.35)"></div>
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 150px; line-height: 0.85; letter-spacing: 4px; color: #E10600; transform: skewX(-6deg); text-shadow: 0 8px 0 rgba(0,0,0,0.35)">EXPULSADO</div>
</div>
<div style="margin-top: 36px; display: flex; align-items: center; gap: 28px">
${escudoImg(d.escudo1, 96, 96)}
<div style="width: 3px; height: 72px; background: #F2B632"></div>
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 80px; line-height: 1; letter-spacing: 2px">${d.playerName}</div>
</div>
</div>
${franjaBottom(d.franja)}
</div>`)
}

export function render05Frase(d: FraseState): string {
  const { bg, rgba } = FONDO_COLORS[d.fondo]
  return docWrap(`<div style="width: 1080px; height: 1350px; position: relative; overflow: hidden; background: ${bg}; color: #FFFFFF; font-family: 'Archivo', sans-serif">
${fotoImg(d.foto, 1080, 930, d.fotoPosX, d.fotoPosY, d.fotoScale)}
<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 950px; background: linear-gradient(180deg, rgba(${rgba},0.5) 0%, rgba(${rgba},0) 18%, rgba(${rgba},0) 56%, rgba(${rgba},0.85) 84%, ${bg} 100%)"><img src="${d.escudo1 || 'data:image/svg+xml;charset=utf-8,<svg xmlns=&apos;http://www.w3.org/2000/svg&apos; width=&apos;160&apos; height=&apos;160&apos;><rect width=&apos;160&apos; height=&apos;160&apos; fill=&apos;transparent&apos;/></svg>'}" alt="" style="position: absolute; top: 760px; left: 856px; width: 160px; height: 160px; object-fit: contain"></div>
${logo(d.fondo)}
<div style="position: absolute; left: 64px; right: 64px; top: 930px; display: flex; flex-direction: column">
<div style="font-size: 22px; font-weight: 800; letter-spacing: 5px; color: #F2B632">${d.category}</div>
<div style="margin-top: 30px; display: flex; gap: 20px; align-items: flex-start">
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 120px; line-height: 0.75; color: #F2B632">"</div>
<div style="display: flex; flex-direction: column; gap: 14px">
<div style="font-size: 50px; font-weight: 600; font-style: italic; line-height: 1.25">${d.quote}<span style="font-family: 'Bebas Neue', sans-serif; font-style: normal; font-size: 96px; line-height: 0; color: #F2B632; vertical-align: -34px; margin-left: 8px">"</span></div>
<div style="font-size: 20px; font-weight: 800; letter-spacing: 3px; color: #B8C2D9">${d.attribution} <span style="font-weight: 600; letter-spacing: 1px">${d.context}</span></div>
</div>
</div>
</div>
${franjaBottom(d.franja)}
</div>`)
}

export function render06Previa(d: PreviaState): string {
  const { bg, rgba } = FONDO_COLORS[d.fondo]
  return docWrap(`<div style="width: 1080px; height: 1350px; position: relative; overflow: hidden; background: ${bg}; color: #FFFFFF; font-family: 'Archivo', sans-serif">
${fotoImg(d.foto, 1080, 760, d.fotoPosX, d.fotoPosY, d.fotoScale)}
<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 780px; background: linear-gradient(180deg, rgba(${rgba},0.6) 0%, rgba(${rgba},0) 18%, rgba(${rgba},0) 50%, rgba(${rgba},0.85) 80%, ${bg} 100%)"></div>
${logo(d.fondo)}
<div style="position: absolute; left: 64px; right: 64px; top: 640px; display: flex; flex-direction: column; align-items: center">
<div style="background: #F2B632; color: ${bg}; font-family: 'Bebas Neue', sans-serif; font-size: 52px; line-height: 1; letter-spacing: 6px; padding: 10px 30px 4px 30px; transform: skewX(-8deg)">ES HOY</div>
<div style="margin-top: 20px; font-size: 22px; font-weight: 800; letter-spacing: 5px; color: #B8BCC4">${d.competition}</div>
<div style="margin-top: 36px; width: 100%; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: center">
<div style="display: flex; flex-direction: column; align-items: center; gap: 18px">
${escudoImg(d.escudo1, 230, 250)}
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 64px; line-height: 1; letter-spacing: 2px">${d.team1}</div>
</div>
<div style="display: flex; flex-direction: column; align-items: center; gap: 10px">
<div style="width: 3px; height: 70px; background: #F2B632"></div>
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 110px; line-height: 1; color: #F2B632; letter-spacing: 3px; transform: skewX(-6deg)">VS</div>
<div style="width: 3px; height: 70px; background: #F2B632"></div>
</div>
<div style="display: flex; flex-direction: column; align-items: center; gap: 18px">
${escudoImg(d.escudo2, 250, 250)}
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 64px; line-height: 1; letter-spacing: 2px">${d.team2}</div>
</div>
</div>
<div style="margin-top: 44px; display: flex; align-items: center; gap: 30px; font-family: 'Bebas Neue', sans-serif; font-size: 50px; line-height: 1; letter-spacing: 2px">
<div>${d.date}</div>
<div style="width: 3px; height: 40px; background: #F2B632"></div>
<div style="color: #F2B632">${d.time}</div>
<div style="width: 3px; height: 40px; background: #F2B632"></div>
<div>${d.stadium}</div>
</div>
</div>
${franjaBottom(d.franja)}
</div>`)
}

export function render07Noticia(d: NoticiaState): string {
  const { bg, rgba } = FONDO_COLORS[d.fondo]
  return docWrap(`<div style="width: 1080px; height: 1350px; position: relative; overflow: hidden; background: ${bg}; color: #FFFFFF; font-family: 'Archivo', sans-serif">
${fotoImg(d.foto, 1080, 900, d.fotoPosX, d.fotoPosY, d.fotoScale)}
<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 920px; background: linear-gradient(180deg, rgba(${rgba},0.5) 0%, rgba(${rgba},0) 18%, rgba(${rgba},0) 55%, rgba(${rgba},0.85) 82%, ${bg} 100%)"></div>
${logo(d.fondo)}
<div style="position: absolute; left: 64px; right: 64px; top: 840px; display: flex; flex-direction: column">
<div style="font-size: 22px; font-weight: 800; letter-spacing: 5px; color: #F2B632">${d.category}</div>
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 112px; line-height: 0.9; margin-top: 12px">${d.titleBebas}</div>
<div style="margin-top: 26px; font-size: 48px; font-weight: 600; line-height: 1.3; color: #FFFFFF; text-wrap: balance">${d.subtitle}</div>
</div>
${franjaBottom(d.franja)}
</div>`)
}

export function render08Formacion(d: FormacionState): string {
  const { bg, rgba } = FONDO_COLORS[d.fondo]
  const col1 = d.players.slice(0, 6)
  const col2 = d.players.slice(6, 11)
  function playerRow(p: { num: string; name: string }, isLast = false): string {
    return `<div style="display: flex; align-items: center; gap: 18px; height: 62px; ${isLast ? '' : 'border-bottom: 2px solid rgba(255,255,255,0.15);'}"><div style="font-family: 'Bebas Neue', sans-serif; font-size: 42px; color: #F2B632; width: 52px">${p.num}</div><div style="font-size: 25px; font-weight: 800">${p.name}</div></div>`
  }
  return docWrap(`<div style="width: 1080px; height: 1350px; position: relative; overflow: hidden; background: ${bg}; color: #FFFFFF; font-family: 'Archivo', sans-serif">
${fotoImg(d.foto, 1080, 720, d.fotoPosX, d.fotoPosY, d.fotoScale)}
<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 740px; background: linear-gradient(180deg, rgba(${rgba},0.5) 0%, rgba(${rgba},0) 18%, rgba(${rgba},0) 50%, rgba(${rgba},0.9) 82%, ${bg} 100%)"></div>
${logo(d.fondo)}
<div style="position: absolute; left: 64px; right: 64px; top: 560px; display: flex; flex-direction: column">
<div style="font-size: 20px; font-weight: 800; letter-spacing: 5px; color: #F2B632">${d.competition}</div>
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 136px; line-height: 0.88; margin-top: 8px">${d.title}</div>
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 40px; line-height: 1; letter-spacing: 1px; color: #B8C2D9; margin-top: 6px">${d.opponent}</div>
</div>
<div style="position: absolute; left: 64px; right: 64px; top: 830px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 48px">
<div style="display: flex; flex-direction: column">
${col1.map((p, i) => playerRow(p, i === 5)).join('')}
</div>
<div style="display: flex; flex-direction: column">
${col2.map((p, i) => playerRow(p, i === 4)).join('')}
<div style="display: flex; align-items: center; gap: 18px; height: 62px"><div style="font-family: 'Bebas Neue', sans-serif; font-size: 34px; color: #0B1631; background: #F2B632; width: 52px; text-align: center; line-height: 40px">DT</div><div style="font-size: 25px; font-weight: 800">${d.dtName}</div></div>
</div>
</div>
${franjaBottom(d.franja)}
</div>`)
}

export function render09CaraACara(d: CaraACaraState): string {
  const { bg, rgba } = FONDO_COLORS[d.fondo]
  return docWrap(`<div style="width: 1080px; height: 1350px; position: relative; overflow: hidden; background: ${bg}; color: #FFFFFF; font-family: 'Archivo', sans-serif">
${fotoImg(d.foto, 660, 1350, d.fotoPosX, d.fotoPosY, d.fotoScale)}
<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 1350px; background: linear-gradient(90deg, rgba(${rgba},0) 0%, rgba(${rgba},0) 38%, rgba(${rgba},0.85) 56%, ${bg} 64%)"></div>
<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 1350px; background: linear-gradient(180deg, rgba(${rgba},0.55) 0%, rgba(${rgba},0) 18%, rgba(${rgba},0) 78%, rgba(${rgba},0.8) 100%)"></div>
${logo(d.fondo)}
<div style="position: absolute; left: 640px; top: 90px; width: 4px; height: 1160px; background: #F2B632"></div>
<div style="position: absolute; left: 680px; top: 90px; width: 360px; display: flex; flex-direction: column">
<div style="font-size: 16px; font-weight: 800; letter-spacing: 3px; color: #F2B632">${d.category}</div>
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 96px; line-height: 0.92; margin-top: 10px; white-space: nowrap">CARA<br>A CARA</div>
<div style="font-size: 17px; font-weight: 600; letter-spacing: 2px; color: #B8BCC4; margin-top: 14px">${d.historialTitle}</div>
<div style="margin-top: 24px; display: flex; flex-direction: column">
${d.stats.map(s => `<div style="display: flex; align-items: center; gap: 16px; padding: 7px 0; border-bottom: 2px solid rgba(255,255,255,0.25)">
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 66px; line-height: 0.9; color: #F2B632; width: 90px">${s.value}</div>
<div style="font-size: 18px; font-weight: 800; letter-spacing: 2px; white-space: nowrap">${s.label}</div>
</div>`).join('')}
</div>
<div style="margin-top: 28px; font-size: 16px; font-weight: 800; letter-spacing: 3px; color: #F2B632">${d.recentTitle}</div>
<div style="margin-top: 8px; display: flex; flex-direction: column">
${d.recentMatches.map(m => `<div style="display: flex; flex-direction: column; gap: 2px; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.2)">
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 27px; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${m.result}</div>
<div style="font-size: 13px; font-weight: 600; color: #B8BCC4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${m.competition}</div>
</div>`).join('')}
</div>
<div style="margin-top: 12px; font-size: 15px; color: #B8BCC4">${d.note}</div>
</div>
${franjaBottom(d.franja)}
</div>`)
}

export function render10FotoSitio(d: FotoSitioState): string {
  return docWrap(`<div style="width: 1170px; height: 658px; position: relative; overflow: hidden; background: #111214">
${fotoImg(d.foto, 1170, 658, d.fotoPosX, d.fotoPosY, d.fotoScale)}
</div>`)
}

export function render11NoticiaBrasil(d: NoticiaBrasilState): string {
  const { bg, rgba } = FONDO_COLORS[d.fondo]
  return docWrap(`<div style="width: 1080px; height: 1350px; position: relative; overflow: hidden; background: ${bg}; color: #FFFFFF; font-family: 'Archivo', sans-serif">
${fotoImg(d.foto, 1080, 860, d.fotoPosX, d.fotoPosY, d.fotoScale)}
<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 880px; background: linear-gradient(180deg, rgba(${rgba},0.5) 0%, rgba(${rgba},0) 18%, rgba(${rgba},0) 58%, rgba(${rgba},0.85) 84%, ${bg} 100%)"></div>
${logo(d.fondo)}
<div style="position: absolute; left: 64px; right: 64px; top: 830px; display: flex; flex-direction: column">
<div style="font-size: 22px; font-weight: 800; letter-spacing: 5px; color: #F2B632">${d.category}</div>
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 132px; line-height: 0.9; margin-top: 14px">${d.titlePart1}<span style="color: #F2B632">${d.titleHighlight}</span></div>
</div>
${franjaBottom(d.franja)}
</div>`)
}

export function render12TablaAnual(d: TablaAnualState): string {
  const { bg, rgba } = FONDO_COLORS[d.fondo]
  return docWrap(`<div style="width: 1080px; height: 1350px; position: relative; overflow: hidden; background: ${bg}; color: #FFFFFF; font-family: 'Archivo', sans-serif">
${fotoImg(d.foto, 1080, 1000, d.fotoPosX, d.fotoPosY, d.fotoScale)}
<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 1010px; background: linear-gradient(180deg, rgba(${rgba},0.55) 0%, rgba(${rgba},0) 14%, rgba(${rgba},0) 30%, rgba(${rgba},0.9) 48%, ${bg} 60%)"></div>
${logo(d.fondo)}
<div style="position: absolute; left: 60px; right: 60px; top: 404px; display: flex; flex-direction: column; align-items: flex-start">
<div style="background: #F2B632; color: ${bg}; font-size: 22px; font-weight: 800; letter-spacing: 5px; padding: 10px 22px 9px 22px">${d.badge}</div>
<div style="margin-top: 14px; font-family: 'Bebas Neue', sans-serif; font-size: 120px; line-height: 0.9; letter-spacing: 2px; transform: skewX(-6deg); text-shadow: 0 6px 0 rgba(0,0,0,0.3)">${d.title}</div>
<div style="margin-top: 26px; width: 100%">
<div style="display: grid; grid-template-columns: 64px 56px minmax(0,1fr) 96px 72px 72px 88px; align-items: center; height: 34px; font-size: 16px; font-weight: 800; letter-spacing: 3px; color: #B8C2D9">
<div style="text-align: center">#</div><div></div><div style="padding-left: 8px">EQUIPO</div><div style="text-align: center">PTS</div><div style="text-align: center">PJ</div><div style="text-align: center">PG</div><div style="text-align: center">DG</div>
</div>
${d.rows.map((row, i) => renderTableRow(row, i)).join('')}
</div>
<div style="margin-top: 18px; display: flex; flex-wrap: wrap; gap: 28px; font-size: 16px; font-weight: 800; letter-spacing: 2px; color: #FFFFFF">
<div style="display: flex; align-items: center; gap: 10px"><div style="width: 18px; height: 18px; background: #009C3B"></div><div>LIBERTADORES · FASE DE GRUPOS</div></div>
<div style="display: flex; align-items: center; gap: 10px"><div style="width: 18px; height: 18px; background: #F2B632"></div><div>LIBERTADORES · FASE PREVIA</div></div>
<div style="display: flex; align-items: center; gap: 10px"><div style="width: 18px; height: 18px; background: #2F6FDB"></div><div>SUDAMERICANA</div></div>
</div>
<div style="margin-top: 14px; font-size: 16px; font-weight: 600; letter-spacing: 3px; color: #B8C2D9">${d.note}</div>
</div>
${franjaBottom(d.franja)}
</div>`)
}

export function render13Anuncio(d: AnuncioState): string {
  const { bg, rgba } = FONDO_COLORS[d.fondo]
  return docWrap(`<div style="width: 1080px; height: 1350px; position: relative; overflow: hidden; background: ${bg}; color: #FFFFFF; font-family: 'Archivo', sans-serif">
${fotoImg(d.foto, 1080, 1060, d.fotoPosX, d.fotoPosY, d.fotoScale)}
<div style="position: absolute; left: 0; top: 0; width: 1080px; height: 1070px; background: linear-gradient(180deg, rgba(${rgba},0.55) 0%, rgba(${rgba},0) 16%, rgba(${rgba},0) 50%, rgba(${rgba},0.88) 76%, ${bg} 100%)"></div>
${logo(d.fondo)}
<div style="position: absolute; left: 0; right: 0; top: 860px; display: flex; flex-direction: column; align-items: center">
<div style="background: #F2B632; color: ${bg}; font-size: 22px; font-weight: 800; letter-spacing: 5px; padding: 10px 22px 9px 22px">${d.badge}</div>
<div style="margin-top: 18px; font-family: 'Bebas Neue', sans-serif; font-size: 140px; line-height: 0.85; letter-spacing: 3px; white-space: nowrap; color: #FFFFFF; transform: skewX(-6deg); text-shadow: 0 8px 0 rgba(0,0,0,0.35)">${d.titleLine1} <span style="color: #F2B632">${d.titleHighlight}</span></div>
<div style="margin-top: 30px; display: flex; align-items: center; gap: 28px">
${escudoImg(d.escudo1, 110, 110)}
<div style="width: 3px; height: 86px; background: #F2B632"></div>
<div style="font-family: 'Bebas Neue', sans-serif; font-size: 96px; line-height: 1; letter-spacing: 2px">${d.personName}</div>
</div>
<div style="margin-top: 26px; font-size: 22px; font-weight: 600; letter-spacing: 3px; color: #C9CDD4; text-align: center">${d.subtitle}</div>
</div>
${franjaBottom(d.franja)}
</div>`)
}
