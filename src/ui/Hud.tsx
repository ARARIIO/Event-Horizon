import { useEffect, useRef } from 'react'
import { CALLOUTS } from '../claude/designData'
import { horizon } from '../claude/HorizonController'

/** Claude Design HUD — exact markup from Event Horizon.dc.html */
export function Hud() {
  const hud = useRef<HTMLDivElement>(null)
  const markers = useRef<HTMLDivElement>(null)
  const callout = useRef<HTMLDivElement>(null)
  const coTerm = useRef<HTMLSpanElement>(null)
  const coNum = useRef<HTMLSpanElement>(null)
  const coPin = useRef<HTMLDivElement>(null)
  const lead = useRef<SVGSVGElement>(null)
  const leadLine = useRef<SVGLineElement>(null)
  const cur = useRef<HTMLDivElement>(null)
  const curV = useRef<HTMLDivElement>(null)
  const curH = useRef<HTMLDivElement>(null)
  const curDot = useRef<HTMLDivElement>(null)
  const curTxt = useRef<HTMLDivElement>(null)
  const trail = useRef<HTMLDivElement>(null)
  const grav = useRef<HTMLSpanElement>(null)
  const gravBar = useRef<HTMLDivElement>(null)
  const tidal = useRef<HTMLSpanElement>(null)
  const tidalBar = useRef<HTMLDivElement>(null)
  const focal = useRef<HTMLSpanElement>(null)
  const azEl = useRef<HTMLSpanElement>(null)
  const elEl = useRef<HTMLSpanElement>(null)
  const tel = useRef<HTMLSpanElement>(null)
  const clock = useRef<HTMLSpanElement>(null)
  const reset = useRef<HTMLDivElement>(null)
  const sensL = useRef<HTMLDivElement>(null)
  const optR = useRef<HTMLDivElement>(null)
  const pre = useRef<HTMLDivElement>(null)
  const preBar = useRef<HTMLDivElement>(null)
  const prePct = useRef<HTMLSpanElement>(null)
  const pl1 = useRef<HTMLSpanElement>(null)
  const pl2 = useRef<HTMLSpanElement>(null)
  const pl3 = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    horizon.bind({
      hud: hud.current,
      markers: markers.current,
      callout: callout.current,
      coTerm: coTerm.current,
      coNum: coNum.current,
      coPin: coPin.current,
      lead: lead.current,
      leadLine: leadLine.current,
      cur: cur.current,
      curV: curV.current,
      curH: curH.current,
      curDot: curDot.current,
      curTxt: curTxt.current,
      trail: trail.current,
      grav: grav.current,
      gravBar: gravBar.current,
      tidal: tidal.current,
      tidalBar: tidalBar.current,
      focal: focal.current,
      azEl: azEl.current,
      elEl: elEl.current,
      tel: tel.current,
      clock: clock.current,
      reset: reset.current,
      sensL: sensL.current,
      optR: optR.current,
      pre: pre.current,
      preBar: preBar.current,
      prePct: prePct.current,
      pl1: pl1.current,
      pl2: pl2.current,
      pl3: pl3.current,
    })
    horizon.start()
    return () => horizon.stop()
  }, [])

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,.14) 3px)',
          opacity: 0.5,
          zIndex: 5,
        }}
      />

      <div
        className="eh-scanbeam"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '8vh',
          pointerEvents: 'none',
          zIndex: 5,
          background:
            'linear-gradient(to bottom, transparent, rgba(232,234,236,.035), transparent)',
        }}
      />

      <svg
        ref={lead}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 7,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity .3s ease',
        }}
      >
        <line
          ref={leadLine}
          x1={0}
          y1={0}
          x2={0}
          y2={0}
          stroke="rgba(242,220,180,.55)"
          strokeWidth={1}
          strokeDasharray="3 4"
        />
      </svg>

      <div ref={markers} style={{ position: 'absolute', inset: 0, zIndex: 7, pointerEvents: 'none' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            data-part={i}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 44,
              height: 44,
              margin: '-22px 0 0 -22px',
              pointerEvents: 'auto',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              touchAction: 'none',
            }}
          >
            {i === 0 && (
              <span
                className="eh-pulse"
                style={{
                  position: 'absolute',
                  width: 22,
                  height: 22,
                  border: '1px solid rgba(242,220,180,.28)',
                  borderRadius: '50%',
                }}
              />
            )}
            <span
              style={{
                width: 5,
                height: 5,
                background: i === 0 ? '#F2DCB4' : 'transparent',
                border: i === 0 ? 'none' : '1px solid rgba(232,234,236,.7)',
                borderRadius: '50%',
                boxShadow: i === 0 ? '0 0 8px rgba(242,220,180,.8)' : undefined,
              }}
            />
          </div>
        ))}
      </div>

      <div
        ref={callout}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: 8,
          width: 330,
          padding: '18px 20px 20px',
          background: 'rgba(7,8,10,.95)',
          border: '1px solid rgba(232,234,236,.16)',
          backdropFilter: 'blur(8px)',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity .28s ease',
          fontFamily: 'Archivo, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingBottom: 12,
            marginBottom: 14,
            borderBottom: '1px solid rgba(232,234,236,.14)',
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 9,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color: '#71777D',
          }}
        >
          <span ref={coTerm} style={{ color: '#F2DCB4' }}>
            event horizon
          </span>
          <span ref={coNum}>01 / 08</span>
        </div>
        {CALLOUTS.map((c, i) => (
          <div key={i} data-info={i} style={{ display: 'none' }}>
            <div
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 24,
                lineHeight: 1.15,
                color: '#E8EAEC',
                marginBottom: 12,
              }}
            >
              {c.title}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.75,
                fontWeight: 300,
                color: '#8B9197',
              }}
            >
              {c.body}
            </p>
          </div>
        ))}
        <div
          ref={coPin}
          style={{
            marginTop: 16,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 9,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: '#4E5459',
          }}
        >
          клик — закрепить
        </div>
      </div>

      <div ref={cur} style={{ position: 'absolute', inset: 0, zIndex: 9, pointerEvents: 'none', opacity: 0 }}>
        <div
          ref={curV}
          style={{ position: 'absolute', top: 0, bottom: 0, width: 1, background: 'rgba(232,234,236,.14)' }}
        />
        <div
          ref={curH}
          style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'rgba(232,234,236,.14)' }}
        />
        <div
          ref={curDot}
          style={{
            position: 'absolute',
            width: 16,
            height: 16,
            margin: '-8px 0 0 -8px',
            border: '1px solid rgba(242,220,180,.5)',
          }}
        />
        <div
          ref={curTxt}
          style={{
            position: 'absolute',
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 9,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: '#71777D',
            whiteSpace: 'nowrap',
          }}
        >
          r 0.0 rₛ
        </div>
      </div>

      <div ref={trail} style={{ position: 'absolute', inset: 0, zIndex: 9, pointerEvents: 'none' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 3,
              height: 3,
              margin: '-1.5px 0 0 -1.5px',
              borderRadius: '50%',
              background: '#F2DCB4',
              opacity: 0,
            }}
          />
        ))}
      </div>

      <div
        ref={hud}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          color: '#71777D',
          fontSize: 10,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
          fontWeight: 400,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              'linear-gradient(90deg,transparent,rgba(232,234,236,.16) 20%,rgba(232,234,236,.16) 80%,transparent)',
          }}
        />

        <div style={{ position: 'absolute', top: 26, left: 32, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 19,
                letterSpacing: '.24em',
                color: '#E8EAEC',
                textTransform: 'uppercase',
              }}
            >
              Event Horizon
            </span>
            <span style={{ color: '#4E5459' }}>v3.0</span>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span
              className="eh-blink"
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#F2DCB4',
                boxShadow: '0 0 10px 2px rgba(242,220,180,.55)',
              }}
            />
            <span>obs. station kipp–9</span>
            <span style={{ color: '#3E4348' }}>|</span>
            <span>sys online</span>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 26,
            right: 32,
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            gap: 9,
            alignItems: 'flex-end',
          }}
        >
          <div style={{ color: '#E8EAEC', fontSize: 11, letterSpacing: '.2em' }}>
            t <span ref={clock}>+00:00:00</span>
          </div>
          <div
            ref={reset}
            onClick={() => horizon.resetView()}
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
              padding: '5px 12px',
              border: '1px solid rgba(232,234,236,.14)',
              color: '#71777D',
              transition: 'border-color .3s ease, color .3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#F2DCB4'
              e.currentTarget.style.color = '#F2DCB4'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(232,234,236,.14)'
              e.currentTarget.style.color = horizon.pinned >= 0 ? '#F2DCB4' : '#71777D'
            }}
          >
            reset view
          </div>
        </div>

        <div
          ref={sensL}
          style={{
            position: 'absolute',
            left: 32,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            width: 186,
            padding: '14px 14px 16px',
            marginLeft: -14,
            background:
              'linear-gradient(to right, rgba(7,8,10,.72), rgba(7,8,10,.28) 70%, transparent)',
          }}
        >
          <div
            style={{
              color: '#4E5459',
              letterSpacing: '.24em',
              paddingBottom: 8,
              borderBottom: '1px solid rgba(232,234,236,.1)',
            }}
          >
            sensors
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>gravity</span>
              <span ref={grav} style={{ color: '#E8EAEC' }}>
                0.86 g
              </span>
            </div>
            <div style={{ height: 1, background: 'rgba(232,234,236,.1)' }}>
              <div
                ref={gravBar}
                style={{
                  height: 1,
                  width: '32%',
                  background: '#F2DCB4',
                  boxShadow: '0 0 8px rgba(242,220,180,.6)',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>tidal Δ</span>
              <span ref={tidal} style={{ color: '#E8EAEC' }}>
                0.41
              </span>
            </div>
            <div style={{ height: 1, background: 'rgba(232,234,236,.1)' }}>
              <div
                ref={tidalBar}
                style={{ height: 1, width: '41%', background: 'rgba(232,234,236,.55)' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>photon ring</span>
            <span style={{ color: '#E8EAEC' }}>locked</span>
          </div>
        </div>

        <div
          ref={optR}
          style={{
            position: 'absolute',
            right: 32,
            top: '50%',
            transform: 'translateY(-50%)',
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            width: 186,
            padding: '14px 14px 16px',
            marginRight: -14,
            background:
              'linear-gradient(to left, rgba(7,8,10,.72), rgba(7,8,10,.28) 70%, transparent)',
          }}
        >
          <div
            style={{
              color: '#4E5459',
              letterSpacing: '.24em',
              paddingBottom: 8,
              borderBottom: '1px solid rgba(232,234,236,.1)',
            }}
          >
            optics
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>focal</span>
            <span ref={focal} style={{ color: '#E8EAEC' }}>
              85 mm
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>azimuth</span>
            <span ref={azEl} style={{ color: '#E8EAEC' }}>
              31°
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>elevation</span>
            <span ref={elEl} style={{ color: '#E8EAEC' }}>
              27°
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>exposure</span>
            <span style={{ color: '#E8EAEC' }}>−1.3 ev</span>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 26, left: 32, display: 'flex', gap: 34 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span style={{ color: '#4E5459' }}>right asc.</span>
            <span style={{ color: '#E8EAEC' }}>17h 45m 40.0s</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span style={{ color: '#4E5459' }}>declination</span>
            <span style={{ color: '#E8EAEC' }}>−29° 00′ 28″</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span style={{ color: '#4E5459' }}>rₛ</span>
            <span style={{ color: '#E8EAEC' }}>12.1×10⁶ km</span>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 26,
            right: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 7,
          }}
        >
          <span style={{ color: '#4E5459' }}>telemetry</span>
          <span ref={tel} style={{ color: '#E8EAEC' }}>
            stable / 60 fps
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 26,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#4E5459',
            letterSpacing: '.26em',
          }}
        >
          наведите на маркер
        </div>
      </div>

      <div
        ref={pre}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          background: '#07080A',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 10,
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          color: '#71777D',
          transition: 'opacity .7s ease',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 'min(78vw, 420px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>optics calibration</span>
            <span ref={pl1} style={{ color: '#4E5459' }}>
              wait
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>disk telemetry</span>
            <span ref={pl2} style={{ color: '#4E5459' }}>
              wait
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>horizon telemetry</span>
            <span ref={pl3} style={{ color: '#4E5459' }}>
              wait
            </span>
          </div>
        </div>
        <div style={{ width: 'min(78vw, 420px)', height: 1, background: 'rgba(232,234,236,.12)' }}>
          <div
            ref={preBar}
            style={{
              height: 1,
              width: '0%',
              background: '#F2DCB4',
              boxShadow: '0 0 10px rgba(242,220,180,.7)',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            width: 'min(78vw, 420px)',
          }}
        >
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 15,
              letterSpacing: '.22em',
              color: '#E8EAEC',
              textTransform: 'uppercase',
            }}
          >
            Event Horizon
          </span>
          <span ref={prePct} style={{ color: '#F2DCB4' }}>
            000 %
          </span>
        </div>
      </div>
    </>
  )
}
