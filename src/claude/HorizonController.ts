import { PARTS, PROPS, type Part } from './designData'

export type DomRefs = {
  hud?: HTMLElement | null
  markers?: HTMLElement | null
  callout?: HTMLElement | null
  coTerm?: HTMLElement | null
  coNum?: HTMLElement | null
  coPin?: HTMLElement | null
  lead?: SVGElement | null
  leadLine?: SVGLineElement | null
  cur?: HTMLElement | null
  curV?: HTMLElement | null
  curH?: HTMLElement | null
  curDot?: HTMLElement | null
  curTxt?: HTMLElement | null
  trail?: HTMLElement | null
  grav?: HTMLElement | null
  gravBar?: HTMLElement | null
  tidal?: HTMLElement | null
  tidalBar?: HTMLElement | null
  focal?: HTMLElement | null
  azEl?: HTMLElement | null
  elEl?: HTMLElement | null
  tel?: HTMLElement | null
  clock?: HTMLElement | null
  reset?: HTMLElement | null
  sensL?: HTMLElement | null
  optR?: HTMLElement | null
  pre?: HTMLElement | null
  preBar?: HTMLElement | null
  prePct?: HTMLElement | null
  pl1?: HTMLElement | null
  pl2?: HTMLElement | null
  pl3?: HTMLElement | null
}

type Cam = {
  pos: [number, number, number]
  fw: [number, number, number]
  rt: [number, number, number]
  up: [number, number, number]
  tanHalf: number
  D: number
}

/** Uniforms consumed each frame by the R3F raymarch plane. */
export type ShaderState = {
  resX: number
  resY: number
  mouseX: number
  mouseY: number
  hotX: number
  hotY: number
  t: number
  az: number
  el: number
  zoom: number
  glow: number
  grain: number
  dense: number
  flash: number
  steps: number
  flare: number
  flareA: number
  hotI: number
  stars: number
}

/**
 * Claude Design interaction + HUD controller.
 * Rendering is done by R3F ShaderMaterial reading `shader`.
 */
export class HorizonController {
  r: DomRefs = {}
  props = { ...PROPS }
  parts: Part[] = PARTS
  shader: ShaderState = {
    resX: 1,
    resY: 1,
    mouseX: 999,
    mouseY: 999,
    hotX: 999,
    hotY: 999,
    t: 0,
    az: 0.55,
    el: 0.47,
    zoom: 1,
    glow: PROPS.diskGlow,
    grain: PROPS.grain,
    dense: PROPS.diskDensity,
    flash: 0,
    steps: 118,
    flare: 0,
    flareA: 0,
    hotI: PROPS.anamorphic * 0.55,
    stars: PROPS.starfield,
  }

  t = 0
  tScale = 1
  flash = 0
  hold = false
  holdAt = 0
  az = 0.55
  el = 0.47
  azT = 0.55
  elT = 0.47
  zoom = 1
  mx: number | null = null
  my: number | null = null
  /** Soft progress 0..1 shown on the loader bar */
  pre = 0
  /** Milestone target the bar eases toward */
  preTarget = 0
  readyE = 0
  boot = { hud: false, gl: false, shader: false }
  rm = false
  hover = -1
  pinned = -1
  focusE = 0
  scale = 1
  steps = 118
  slow = 0
  fps = 60
  trail: [number, number][] = []
  W = 1
  H = 1
  last = 0
  shk = 0
  shkE = 0
  flare = 0
  flareA = 0
  flareSet = false
  running = false
  dpr = 1
  /** Cached marker screen positions — frozen while focused to avoid hover flicker/lag */
  markerPos: ([number, number] | null)[] = Array(8).fill(null)
  markersFrozen = false
  lastActive = -1
  calloutBlocks: (HTMLElement | null)[] | null = null
  overMarker = false
  renderSteps = 118
  scratchBuf = { x: 1, y: 1 }
  markerAbort: AbortController | null = null
  calloutAbort: AbortController | null = null

  bind(refs: DomRefs) {
    this.r = refs
  }

  private bumpPreTarget() {
    let t = 0
    if (this.boot.hud) t += 0.28
    if (this.boot.gl) t += 0.34
    if (this.boot.shader) t += 0.38
    this.preTarget = Math.min(1, t)
  }

  /** HUD bound / controller started */
  markBootHud = () => {
    if (this.boot.hud) return
    this.boot.hud = true
    this.bumpPreTarget()
  }

  /** WebGL context created (R3F Canvas onCreated) */
  markBootGl = () => {
    if (this.boot.gl) return
    this.boot.gl = true
    this.bumpPreTarget()
  }

  /** Shader compiled and at least one frame drawn */
  markBootShader = () => {
    if (this.boot.shader) return
    this.boot.shader = true
    this.bumpPreTarget()
  }

  start() {
    this.rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (window.innerWidth < 760) {
      this.scale = 0.85
      this.steps = 84
    } else {
      this.scale = 1
      this.steps = 110
    }
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    this.renderSteps = this.steps
    this.props.grain = 0.12
    this.onResize()
    this.bindMarkers()
    this.pre = 0
    this.readyE = 0
    this.running = true
    this.markBootHud()
    window.addEventListener('resize', this.onResize)
    window.addEventListener('pointermove', this.onPointer, { passive: true })
    window.addEventListener('pointerdown', this.onDown)
    window.addEventListener('pointerup', this.onUp)
    window.addEventListener('pointercancel', this.onUp)
    window.addEventListener('keydown', this.onKey)
  }

  stop() {
    this.running = false
    this.markerAbort?.abort()
    this.markerAbort = null
    this.calloutAbort?.abort()
    this.calloutAbort = null
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('pointermove', this.onPointer)
    window.removeEventListener('pointerdown', this.onDown)
    window.removeEventListener('pointerup', this.onUp)
    window.removeEventListener('pointercancel', this.onUp)
    window.removeEventListener('keydown', this.onKey)
  }

  pinToggle = (i: number) => {
    this.pinned = this.pinned === i ? -1 : i
    if (this.pinned >= 0) {
      this.hover = this.pinned
      this.overMarker = true
      this.markersFrozen = true
    } else {
      this.markersFrozen = this.hover >= 0
    }
  }

  clearHoverIfUnpinned = () => {
    if (this.pinned >= 0) return
    this.hover = -1
    this.overMarker = false
    this.markersFrozen = false
  }

  bindMarkers = () => {
    const host = this.r.markers
    if (!host) return
    this.markerAbort?.abort()
    this.markerAbort = new AbortController()
    const { signal } = this.markerAbort
    const co = this.r.callout

    Array.prototype.forEach.call(host.children, (el: HTMLElement) => {
      const i = parseInt(el.getAttribute('data-part') || '0', 10)
      el.addEventListener(
        'pointerenter',
        () => {
          this.hover = i
          this.overMarker = true
          this.markersFrozen = true
        },
        { signal },
      )
      el.addEventListener(
        'pointerleave',
        (e) => {
          if (this.hover !== i) return
          const to = e.relatedTarget as Node | null
          // Keep focus while moving from marker → callout ("клик — закрепить")
          if (co && to && co.contains(to)) return
          this.clearHoverIfUnpinned()
        },
        { signal },
      )
      el.addEventListener(
        'pointerup',
        (e) => {
          e.stopPropagation()
          if (e.button !== 0) return
          this.pinToggle(i)
        },
        { signal },
      )
    })

    this.bindCalloutPin()
  }

  bindCalloutPin = () => {
    const co = this.r.callout
    const host = this.r.markers
    if (!co) return
    this.calloutAbort?.abort()
    this.calloutAbort = new AbortController()
    const { signal } = this.calloutAbort

    co.addEventListener(
      'pointerleave',
      (e) => {
        if (this.pinned >= 0) return
        const to = e.relatedTarget as Node | null
        if (host && to && host.contains(to)) return
        this.clearHoverIfUnpinned()
      },
      { signal },
    )

    co.addEventListener(
      'pointerup',
      (e) => {
        e.stopPropagation()
        if (e.button !== 0) return
        const active = this.pinned >= 0 ? this.pinned : this.hover
        if (active < 0) return
        this.pinToggle(active)
      },
      { signal },
    )
  }

  resetView = () => {
    this.pinned = -1
    this.hover = -1
    this.overMarker = false
    this.markersFrozen = false
  }

  onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.resetView()
  }

  onResize = () => {
    this.W = window.innerWidth
    this.H = window.innerHeight
    const mob = this.W < 720
    for (const k of ['sensL', 'optR'] as const) {
      const el = this.r[k]
      if (el) el.style.display = mob ? 'none' : 'flex'
    }
    if (this.r.callout) this.r.callout.style.width = mob ? '78vw' : '330px'
  }

  onPointer = (e: PointerEvent) => {
    this.mx = e.clientX
    this.my = e.clientY
    this.trail.unshift([e.clientX, e.clientY])
    if (this.trail.length > 8) this.trail.pop()
  }

  onDown = () => {
    this.flash = 1
    this.holdAt = performance.now()
    this.hold = true
  }

  onUp = () => {
    this.hold = false
  }

  project(p: [number, number, number], cam: Cam): [number, number] | null {
    const v = [p[0] - cam.pos[0], p[1] - cam.pos[1], p[2] - cam.pos[2]]
    const z = v[0] * cam.fw[0] + v[1] * cam.fw[1] + v[2] * cam.fw[2]
    if (z <= 0.2) return null
    const x = v[0] * cam.rt[0] + v[1] * cam.rt[1] + v[2] * cam.rt[2]
    const y = v[0] * cam.up[0] + v[1] * cam.up[1] + v[2] * cam.up[2]
    const k = 1 / (2 * cam.tanHalf)
    return [this.W * 0.5 + (x / z) * k * this.H, this.H * 0.5 - (y / z) * k * this.H]
  }

  camBasis(): Cam {
    const D = 30
    const ca = Math.cos(this.az)
    const sa = Math.sin(this.az)
    const ce = Math.cos(this.el)
    const se = Math.sin(this.el)
    const pos: [number, number, number] = [sa * ce * D, se * D, ca * ce * D]
    const fw: [number, number, number] = [-pos[0] / D, -pos[1] / D, -pos[2] / D]
    let rt: [number, number, number] = [fw[2], 0, -fw[0]]
    const rl = Math.hypot(rt[0], rt[1], rt[2]) || 1
    rt = [rt[0] / rl, rt[1] / rl, rt[2] / rl]
    const up: [number, number, number] = [
      fw[1] * rt[2] - fw[2] * rt[1],
      fw[2] * rt[0] - fw[0] * rt[2],
      fw[0] * rt[1] - fw[1] * rt[0],
    ]
    return { pos, fw, rt, up, tanHalf: 0.3 * this.zoom, D }
  }

  hotAnchor(): [number, number, number] {
    let best = -1
    let bestA = 0
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * 6.283
      const vz = -Math.sin(a) * Math.sin(this.az) + Math.cos(a) * Math.cos(this.az)
      if (vz > best) {
        best = vz
        bestA = a
      }
    }
    return [Math.cos(bestA) * 3.6, 0, Math.sin(bestA) * 3.6]
  }

  /** Call from R3F useFrame with clock.getElapsedTime()-style ms timestamp. */
  tick(tsMs: number) {
    if (!this.running) return
    const now = tsMs / 1000
    const dt = Math.min(0.05, this.last ? now - this.last : 0.016)
    this.last = now
    this.fps += (1 / Math.max(0.008, dt) - this.fps) * 0.08

    if (dt > 0.026) this.slow++
    else this.slow = Math.max(0, this.slow - 1)
    if (this.slow > 80 && this.steps > 72) {
      this.steps = 84
      this.slow = 0
    }

    const holding = this.hold && performance.now() - (this.holdAt || 0) > 220
    this.tScale += ((holding ? 0.2 : 1) - this.tScale) * Math.min(1, dt * 3.4)
    this.t += dt * this.tScale
    this.flash = Math.max(0, this.flash - dt * 1.5)

    if (this.pre < 1) {
      const k = 1 - Math.exp(-dt * (this.preTarget >= 1 ? 5 : 3.2))
      this.pre += (this.preTarget - this.pre) * k
      if (this.preTarget >= 1 && this.pre > 0.997) this.pre = 1
    }
    this.readyE += ((this.pre >= 1 ? 1 : 0) - this.readyE) * Math.min(1, dt * 3)

    const active = this.pinned >= 0 ? this.pinned : this.hover
    this.focusE += ((active >= 0 ? 1 : 0) - this.focusE) * Math.min(1, dt * 4)

    let tAz: number
    let tEl: number
    let tZoom: number
    if (active >= 0) {
      const c = this.parts[active].cam
      tAz = c.az
      tEl = c.el
      tZoom = c.z
    } else {
      tAz =
        this.mx != null
          ? 0.55 + (this.mx / this.W - 0.5) * 1.15
          : 0.55 + Math.sin(this.t * 0.05) * 0.35
      tEl =
        this.my != null
          ? Math.max(0.26, Math.min(0.72, 0.47 - (this.my / this.H - 0.5) * 0.42))
          : 0.47 + Math.sin(this.t * 0.037) * 0.05
      tZoom = 1
    }
    const kIn = 1 - Math.exp(-(active >= 0 ? 5.5 : 3.2) * dt)
    this.azT += (tAz - this.azT) * kIn
    this.elT += (tEl - this.elT) * kIn
    const kOut = 1 - Math.exp(-(active >= 0 ? 4.5 : 2.6) * dt)
    this.az += (this.azT - this.az) * kOut
    this.el += (this.elT - this.el) * kOut
    const amp = this.rm ? 0 : 0.0011 * (active >= 0 ? 0.25 : 1)
    this.shk = Math.sin(this.t * 4.1) * amp + Math.sin(this.t * 9.7) * amp * 0.4
    this.shkE = Math.sin(this.t * 3.3 + 1.4) * amp * 0.6
    this.zoom += (tZoom - this.zoom) * (1 - Math.exp(-3.2 * dt))

    // Cheaper raymarch while camera is settling on a marker — avoids hitch on hover
    const settling =
      active >= 0 &&
      (Math.abs(this.zoom - tZoom) > 0.015 ||
        Math.abs(this.az - tAz) > 0.012 ||
        Math.abs(this.el - tEl) > 0.012)
    this.renderSteps = settling
      ? Math.min(this.steps, 80)
      : active >= 0
        ? Math.min(this.steps, 96)
        : this.steps

    const cyc = (this.t * 0.055) % 1
    this.flare = Math.exp(-Math.pow(cyc - 0.5, 2) * 260) * (this.rm ? 0.3 : 1)
    if (cyc < 0.02 && !this.flareSet) {
      this.flareA = Math.random() * 6.283
      this.flareSet = true
    }
    if (cyc > 0.1) this.flareSet = false

    this.syncShader(active)
    this.applyDom(active)
  }

  syncShader(active: number) {
    const P = this.props
    const cam = this.camBasis()
    const hp = this.project(this.hotAnchor(), cam)
    const s = this.shader
    s.resX = Math.max(2, Math.round(this.W * this.scale * this.dpr))
    s.resY = Math.max(2, Math.round(this.H * this.scale * this.dpr))
    // Disable cursor warp while inspecting a marker — saves cost + stops jitter
    if (active >= 0 || this.overMarker) {
      s.mouseX = 999
      s.mouseY = 999
    } else if (this.mx != null && this.my != null) {
      s.mouseX = (this.mx - this.W * 0.5) / this.H
      s.mouseY = (this.H * 0.5 - this.my) / this.H
    } else {
      s.mouseX = 999
      s.mouseY = 999
    }
    if (hp) {
      s.hotX = (hp[0] - this.W * 0.5) / this.H
      s.hotY = (this.H * 0.5 - hp[1]) / this.H
    } else {
      s.hotX = 999
      s.hotY = 999
    }
    s.t = this.t
    s.az = this.az + (this.shk || 0)
    s.el = this.el + (this.shkE || 0)
    s.zoom = this.zoom
    s.glow = P.diskGlow
    s.grain = P.grain
    s.dense = P.diskDensity
    s.flash = this.flash
    s.steps = this.renderSteps
    s.flare = this.flare || 0
    s.flareA = this.flareA || 0
    s.hotI = P.anamorphic * (0.55 + 0.45 * (this.flare || 0))
    s.stars = P.starfield
  }

  applyDom(active: number) {
    const r = this.r
    const ready = this.readyE || 0
    const cam = this.camBasis()
    const Rpx = (Math.tan(2.6 / cam.D) / (2 * cam.tanHalf)) * this.H
    const cx = this.W * 0.5
    const cy = this.H * 0.5

    if (r.pre) {
      const done = this.pre >= 1
      r.pre.style.opacity = done ? '0' : '1'
      r.pre.style.pointerEvents = done ? 'none' : 'auto'
      if (done && ready > 0.98) r.pre.style.display = 'none'
      if (r.preBar) r.preBar.style.width = (this.pre * 100).toFixed(1) + '%'
      if (r.prePct)
        r.prePct.textContent = String(Math.round(this.pre * 100)).padStart(3, '0') + ' %'
      ;(
        [
          ['pl1', 0.3],
          ['pl2', 0.62],
          ['pl3', 0.92],
        ] as const
      ).forEach(([key, thr]) => {
        const el = r[key]
        if (!el) return
        const on = this.pre >= thr
        el.textContent = on ? 'ok' : 'wait'
        el.style.color = on ? '#F2DCB4' : '#4E5459'
      })
    }

    if (r.hud) r.hud.style.opacity = (ready * (1 - this.focusE * 0.45)).toFixed(3)

    let activePos: [number, number] | null = null
    if (r.markers) {
      const kids = r.markers.children
      const freeze = this.markersFrozen || this.pinned >= 0

      for (let i = 0; i < kids.length; i++) {
        const part = this.parts[i]
        let pos: [number, number] | null = null

        if (freeze && this.markerPos[i]) {
          pos = this.markerPos[i]
        } else {
          if (part.s) pos = [cx + part.s[0] * Rpx * 1.35, cy + part.s[1] * Rpx * 1.35]
          else
            pos = this.project(
              part.hot ? this.hotAnchor() : (part.w as [number, number, number]),
              cam,
            )
          this.markerPos[i] = pos
        }

        const el = kids[i] as HTMLElement
        if (!pos) {
          el.style.opacity = '0'
          el.style.pointerEvents = 'none'
          continue
        }
        el.style.transform = 'translate(' + pos[0].toFixed(1) + 'px,' + pos[1].toFixed(1) + 'px)'
        const on = i === active
        el.style.opacity = (ready * (on ? 1 : 0.62)).toFixed(2)
        el.style.pointerEvents = ready > 0.9 ? 'auto' : 'none'
        const dot = el.lastElementChild as HTMLElement | null
        if (dot) {
          dot.style.background = on ? '#F2DCB4' : 'transparent'
          dot.style.borderColor = on ? '#F2DCB4' : 'rgba(232,234,236,.7)'
          dot.style.boxShadow = on ? '0 0 10px rgba(242,220,180,.9)' : 'none'
          dot.style.width = on ? '7px' : '5px'
          dot.style.height = on ? '7px' : '5px'
        }
        if (on) activePos = pos
      }
    }

    if (r.callout) {
      const co = r.callout
      if (!this.calloutBlocks) {
        this.calloutBlocks = []
        for (let i = 0; i < 8; i++) {
          this.calloutBlocks[i] = co.querySelector('[data-info="' + i + '"]') as HTMLElement | null
        }
      }
      if (active >= 0) {
        if (this.lastActive !== active) {
          for (let i = 0; i < 8; i++) {
            const b = this.calloutBlocks[i]
            if (b) b.style.display = i === active ? 'block' : 'none'
          }
          if (r.coTerm) r.coTerm.textContent = this.parts[active].term
          if (r.coNum) r.coNum.textContent = String(active + 1).padStart(2, '0') + ' / 08'
        }
        if (r.coPin)
          r.coPin.textContent =
            this.pinned === active
              ? 'закреплено — клик или esc, чтобы снять'
              : 'клик — закрепить'
        const cw = co.offsetWidth || 330
        const ch = co.offsetHeight || 200
        let bx: number
        let by: number
        if (this.pinned === active && activePos) {
          bx = activePos[0] + 34
          by = activePos[1] + 26
        } else {
          bx = (this.mx || cx) + 26
          by = (this.my || cy) + 22
        }
        bx = Math.max(16, Math.min(this.W - cw - 16, bx))
        by = Math.max(16, Math.min(this.H - ch - 16, by))
        co.style.transform = 'translate(' + bx.toFixed(0) + 'px,' + by.toFixed(0) + 'px)'
        co.style.opacity = '1'
        co.style.pointerEvents = 'auto'
        co.style.cursor = 'pointer'
        if (r.lead && activePos) {
          r.lead.style.opacity = '1'
          if (r.leadLine) {
            r.leadLine.setAttribute('x1', activePos[0].toFixed(0))
            r.leadLine.setAttribute('y1', activePos[1].toFixed(0))
            r.leadLine.setAttribute('x2', (bx + 6).toFixed(0))
            r.leadLine.setAttribute('y2', (by + 14).toFixed(0))
          }
        }
      } else {
        if (this.lastActive >= 0) {
          co.style.opacity = '0'
          co.style.pointerEvents = 'none'
          if (r.lead) r.lead.style.opacity = '0'
        }
      }
      this.lastActive = active
    }

    if (r.cur) {
      const on = this.mx != null && ready > 0.9
      r.cur.style.opacity = on ? '1' : '0'
      if (on && this.mx != null && this.my != null) {
        if (r.curV) r.curV.style.transform = 'translateX(' + this.mx.toFixed(0) + 'px)'
        if (r.curH) r.curH.style.transform = 'translateY(' + this.my.toFixed(0) + 'px)'
        if (r.curDot)
          r.curDot.style.transform =
            'translate(' + this.mx.toFixed(0) + 'px,' + this.my.toFixed(0) + 'px)'
        if (r.curTxt) {
          const rr = (Math.hypot(this.mx - cx, this.my - cy) / Rpx) * 2.6
          r.curTxt.style.transform =
            'translate(' + (this.mx + 14).toFixed(0) + 'px,' + (this.my - 18).toFixed(0) + 'px)'
          r.curTxt.textContent =
            'r ' +
            rr.toFixed(1) +
            ' r\u209B  ' +
            ((this.mx / this.W) * 100).toFixed(0) +
            '/' +
            ((this.my / this.H) * 100).toFixed(0)
        }
      }
    }

    if (r.trail) {
      const kids = r.trail.children
      for (let i = 0; i < kids.length; i++) {
        const p = this.trail[i + 1]
        const el = kids[i] as HTMLElement
        if (!p) {
          el.style.opacity = '0'
          continue
        }
        el.style.transform =
          'translate(' +
          p[0].toFixed(0) +
          'px,' +
          p[1].toFixed(0) +
          'px) scale(' +
          (1 - i * 0.1).toFixed(2) +
          ')'
        el.style.opacity = (0.28 * (1 - i / kids.length)).toFixed(2)
      }
    }

    const gr = 0.86 + Math.sin(this.t * 0.6) * 0.02 + this.focusE * 0.6
    if (r.grav) r.grav.textContent = gr.toFixed(2) + ' g'
    if (r.gravBar) r.gravBar.style.width = Math.min(100, (gr / 2.2) * 100).toFixed(1) + '%'
    const td = 0.41 + Math.sin(this.t * 1.1 + 1) * 0.03
    if (r.tidal) r.tidal.textContent = td.toFixed(2)
    if (r.tidalBar) r.tidalBar.style.width = Math.min(100, (td / 0.8) * 100).toFixed(1) + '%'
    if (r.focal) r.focal.textContent = Math.round(85 / this.zoom) + ' mm'
    if (r.azEl) r.azEl.textContent = Math.round(this.az * 57.3) + '\u00B0'
    if (r.elEl) r.elEl.textContent = Math.round(this.el * 57.3) + '\u00B0'
    if (r.tel)
      r.tel.textContent =
        (this.fps > 45 ? 'stable / ' : 'reduced / ') + Math.round(this.fps) + ' fps'
    if (r.reset) r.reset.style.color = this.pinned >= 0 ? '#F2DCB4' : '#71777D'
    if (r.clock) {
      const s = Math.floor(this.t)
      r.clock.textContent =
        '+' +
        String(Math.floor(s / 3600)).padStart(2, '0') +
        ':' +
        String(Math.floor(s / 60) % 60).padStart(2, '0') +
        ':' +
        String(s % 60).padStart(2, '0')
    }
  }
}

export const horizon = new HorizonController()
