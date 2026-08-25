import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { useState } from 'react'
import { Scene } from './scene/Scene'
import { Hud } from './ui/Hud'
import { horizon } from './claude/HorizonController'

export default function App() {
  // Keep DPR ≥ 1 — sub-1 + pixelated was staircasing the photon filaments
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5])

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#07080A', cursor: 'none' }}>
      <Canvas
        dpr={dpr}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: false,
          alpha: false,
        }}
        style={{ position: 'absolute', inset: 0, background: '#07080A' }}
      >
        <Scene />
        <AdaptiveDpr />
        <PerformanceMonitor
          onDecline={() => {
            setDpr([1, 1.15])
            horizon.steps = Math.min(horizon.steps, 88)
          }}
          onIncline={() => {
            setDpr([1, 1.5])
            horizon.steps = Math.max(horizon.steps, 110)
          }}
          bounds={(refreshrate) => [refreshrate * 0.4, refreshrate * 0.75]}
        />
      </Canvas>
      <Hud />
    </div>
  )
}
