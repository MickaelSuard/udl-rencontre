import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

function AvatarModel({ url }: { url: string }) {
  const { scene, animations } = useGLTF(url);
  const avatar = useMemo(() => clone(scene), [scene]);
  const mixer = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (animations.length > 0 && avatar) {
      console.log("Animations disponibles :", animations.map(a => a.name));

      mixer.current = new THREE.AnimationMixer(avatar);

      const clip = animations.find(a => a.name === 'Debout');

      if (clip) {
        const action = mixer.current.clipAction(clip);
        action.reset().fadeIn(0.5).play();
      } else {
        console.warn('❌ Animation "Debout" introuvable');
      }
    }
  }, [animations, avatar]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
  });

  return <primitive object={avatar} position={[0, -1.4, 0]} scale={1.5} />;
}

export default function AvatarPreview({ url }: { url: string }) {
  return (
    <Canvas  camera={{ position: [0, 1.5, 3], fov: 50 }}>
      <ambientLight intensity={3} />
      <directionalLight position={[2, 3, 2]} intensity={1.5} />
      <AvatarModel url={url} />
    </Canvas>
  );
}
