import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Suspense } from 'react';
import LoadingOverlay from './Loading';

export function GLBAuditorium({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

const availableAvatars = [
    'man2.glb',
    'woman.glb',
];

const allAvatarPositions: [number, number, number][] = [
    [-0.86, 0.22, 0.24],
    [-1.5, 0.22, 0.35],
    [0.45, 0.35, -0.45],
    [1.07, 0.22, 0.25],
];

function Avatar({
    avatarUrl,
    position,
    label,
}: {
    avatarUrl: string;
    position: [number, number, number];
    label?: string;
}) {
    const { scene, animations } = useGLTF(avatarUrl);
    const clonedScene = useMemo(() => clone(scene), [scene]);
    const mixer = useRef<THREE.AnimationMixer | null>(null);

    useEffect(() => {
        if (!clonedScene || animations.length === 0) {
            console.warn('❌ Aucune animation trouvée dans le modèle.');
            return;
        }

        // Création du mixer
        mixer.current = new THREE.AnimationMixer(clonedScene);

        // Cherche l'animation "Sit" ou "assise"
        const sitClip = animations.find(clip => clip.name.toLowerCase().includes('sit'));

        if (sitClip) {
            const action = mixer.current.clipAction(sitClip);
            action.reset().fadeIn(0.5).play();
        } else {
            console.warn('❌ Animation "Sit" ou "assise" introuvable, lecture de la première animation.');
            // Fallback à la première animation
            const action = mixer.current.clipAction(animations[0]);
            action.reset().fadeIn(0.5).play();
        }

        return () => {
            mixer.current?.stopAllAction();
        };
    }, [animations, clonedScene]);

    useFrame((_, delta) => {
        mixer.current?.update(delta);
    });

    return (
        <group position={position} scale={[0.4, 0.4, 0.4]}>
            <primitive object={clonedScene} />
            {label && (
                <Html
                    position={[0, 1.5, 0]}
                    center
                    distanceFactor={5}
                    style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        textShadow: '0 0 5px black',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        width: '100px',
                        textAlign: 'center',
                    }}
                >
                    {label}
                </Html>
            )}
        </group>
    );
}

function VideoScreen({ videoUrl }: { videoUrl: string }) {
    // Crée une vidéo HTML dès la première instanciation, configurée pour boucle et auto-play
    const [video] = useState(() =>
        Object.assign(document.createElement('video'), {
            src: videoUrl,
            crossOrigin: 'Anonymous',
            loop: true,
            muted: true,
            autoplay: true,
            playsInline: true,
        })
    );

    useEffect(() => {
        video.play();
    }, [video]);



    return (
        <mesh
            position={[0, 1, 3.5]} scale={[-1, 1, 1]}
        >
            <planeGeometry args={[4, 1.8]} />
            <meshBasicMaterial side={THREE.BackSide}>
                <videoTexture attach="map" args={[video]} />
            </meshBasicMaterial>
        </mesh>
    );
}

export default function AuditoriumScene({
    avatarUrl,
    pseudo,
}: {
    avatarUrl: string;
    pseudo: string;
}) {
    // const [chairs, setChairs] = useState<THREE.Object3D[]>([]);
    const [myIndex] = useState(() => Math.floor(Math.random() * allAvatarPositions.length));

    const myPosition = allAvatarPositions[myIndex];
    const otherPositions = allAvatarPositions.filter((_, i) => i !== myIndex);

    // Générer des avatars aléatoires différents pour les autres positions
    const [randomAvatars] = useState(() => {
        // Exclure l'avatar du joueur de la liste des avatars disponibles
        const filtered = availableAvatars.filter(url => url !== avatarUrl);
        const shuffled = [...filtered].sort(() => 0.5 - Math.random());

        // Prendre autant d'avatars que de positions restantes
        return otherPositions.map((_, i) => shuffled[i % shuffled.length]);
    });

    return (
        <Canvas
            camera={{ position: [0, 2, -4.5], fov: 50 }}
            style={{ width: '100vw', height: '100vh' }}
        >
            <ambientLight intensity={4} />
            <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
            <pointLight position={[0, 5, 0]} intensity={1.5} />
            <OrbitControls />

            <Suspense fallback={<LoadingOverlay />}>
                <GLBAuditorium url={import.meta.env.BASE_URL + "/scene/auditorium.glb"} />

                <Avatar avatarUrl={avatarUrl} position={myPosition} label={pseudo} />

                {otherPositions.map((pos, i) => (
                    <Avatar
                        key={i}
                        avatarUrl={randomAvatars[i]}
                        position={pos}
                        label={`Invité ${i + 1}`}
                    />
                ))}

                <VideoScreen videoUrl={import.meta.env.BASE_URL + "video.mp4"} />
            </Suspense>
        </Canvas>
    );
}


// A venir
// - Ajout mur pour la TV
// - mettre le chat
// - Mettre les personnages selectionnables
// - Mettre plus d'avatars
// Changer les noms des avatars
// Ajouter un compteur avant la vidéo