import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { horizon } from '../claude/HorizonController'
import vert from './shaders/blackhole.vert.glsl'
import frag from './shaders/blackhole.frag.glsl'

const _buf = new THREE.Vector2()

/** Claude Design raymarcher as an R3F fullscreen ShaderMaterial. */
export function RaymarchBlackHole() {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const { gl } = useThree()

  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(999, 999) },
      uHot: { value: new THREE.Vector2(999, 999) },
      uT: { value: 0 },
      uAz: { value: 0.55 },
      uEl: { value: 0.47 },
      uZoom: { value: 1 },
      uGlow: { value: 1.8 },
      uGrain: { value: 0.3 },
      uDense: { value: 1 },
      uFlash: { value: 0 },
      uSteps: { value: 118 },
      uFlare: { value: 0 },
      uFlareA: { value: 0 },
      uHotI: { value: 0.25 },
      uStars: { value: 1.6 },
    }),
    [],
  )

  useFrame(() => {
    horizon.tick(performance.now())

    const m = mat.current
    if (!m) return
    const s = horizon.shader
    gl.getDrawingBufferSize(_buf)
    m.uniforms.uRes.value.copy(_buf)
    m.uniforms.uMouse.value.set(s.mouseX, s.mouseY)
    m.uniforms.uHot.value.set(s.hotX, s.hotY)
    m.uniforms.uT.value = s.t
    m.uniforms.uAz.value = s.az
    m.uniforms.uEl.value = s.el
    m.uniforms.uZoom.value = s.zoom
    m.uniforms.uGlow.value = s.glow
    m.uniforms.uGrain.value = s.grain
    m.uniforms.uDense.value = s.dense
    m.uniforms.uFlash.value = s.flash
    m.uniforms.uSteps.value = s.steps
    m.uniforms.uFlare.value = s.flare
    m.uniforms.uFlareA.value = s.flareA
    m.uniforms.uHotI.value = s.hotI
    m.uniforms.uStars.value = s.stars
  })

  return (
    <mesh frustumCulled={false} renderOrder={0}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
