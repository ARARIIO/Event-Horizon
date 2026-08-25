import { OrthographicCamera } from '@react-three/drei'
import { RaymarchBlackHole } from './RaymarchBlackHole'

export function Scene() {
  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 1]} near={0.1} far={10} />
      <color attach="background" args={['#07080A']} />
      <RaymarchBlackHole />
    </>
  )
}
