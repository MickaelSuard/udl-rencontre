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
    'Stanley.glb',
    'Belly.glb',
    'Louise.glb',
    'clea.glb',
    'Lucas.glb',
];

const allAvatarPositions: [number, number, number][] = [
    [-0.86, 0.22, 0.24],
    [-1.5, 0.22, 0.35],
    [0.45, 0.35, -0.45],
    [1.07, 0.22, 0.25],
    [-1.73, 0.25, 0.34],
    [1.5, 0.70, -2],
    [-1.5, 0.68, -1.98],
    [-1.5, 0.4, -0.66],
];

function Avatar({
    avatarUrl,
    position,
    label,
    chatMessage,  // nouvelle prop optionnelle
}: {
    avatarUrl: string;
    position: [number, number, number];
    label?: string;
    chatMessage?: string;
}) {
    const { scene, animations } = useGLTF(avatarUrl);
    const clonedScene = useMemo(() => clone(scene), [scene]);
    const mixer = useRef<THREE.AnimationMixer | null>(null);

    useEffect(() => {
        if (!clonedScene || animations.length === 0) {
            console.warn('❌ Aucune animation trouvée dans le modèle.');
            return;
        }

        mixer.current = new THREE.AnimationMixer(clonedScene);

        const sitClip = animations.find(clip => clip.name.toLowerCase().includes('sit'));

        if (sitClip) {
            const action = mixer.current.clipAction(sitClip);
            action.reset().fadeIn(0.5).play();
        } else {
            console.warn('❌ Animation "Sit" ou "assise" introuvable, lecture de la première animation.');
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
                        textAlign: 'center',
                        width: 'auto',
                        height: 'auto',
                        whiteSpace: 'nowrap', // pour éviter retour à la ligne sur le label
                    }}
                >
                    {label}
                </Html>
            )}

            {chatMessage && (
                <Html
                    position={[0, 2, 0]} // un peu plus haut que le label
                    center
                    distanceFactor={5}
                    className="bg-black bg-opacity-70 text-white px-3 py-1.5 w-auto h-auto overflow-hidden rounded-lg text-base whitespace-normal pointer-events-none select-none max-w-xs break-words"
                >
                    {chatMessage}
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
    const [myIndex] = useState(() => Math.floor(Math.random() * allAvatarPositions.length));
    const myPosition = allAvatarPositions[myIndex];
    const otherPositions = allAvatarPositions.filter((_, i) => i !== myIndex);

    const [randomAvatars] = useState(() => {
        const shuffled = [...availableAvatars].sort(() => 0.5 - Math.random());
        return otherPositions.map((_, i) => shuffled[i % shuffled.length]);
    });

    // --- État chat ---
    const [inputValue, setInputValue] = useState('');
    const [chatMessages, setChatMessages] = useState<{ [key: number]: string }>({});

    // Affiche la bulle de chat pendant 5s après envoi
    const sendMessage = () => {
        if (!inputValue.trim()) return;
        setChatMessages(prev => ({ ...prev, [myIndex]: inputValue.trim() }));
        setInputValue('');

        // Supprimer la bulle après 5 secondes
        setTimeout(() => {
            setChatMessages(prev => {
                const copy = { ...prev };
                delete copy[myIndex];
                return copy;
            });
        }, 5000);
    };

    return (
        <>
            <Canvas
                camera={{ position: [0, 2, -4.5], fov: 50 }}
                style={{ width: '100vw', height: '100vh' }}
            >
                {/* lumières */}
                <ambientLight intensity={4} />
                <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
                <pointLight position={[0, 5, 0]} intensity={1.5} />

                <OrbitControls />

                <Suspense fallback={<LoadingOverlay />}>
                    <GLBAuditorium url={import.meta.env.BASE_URL + "/scene/auditorium.glb"} />

                    <Avatar
                        avatarUrl={avatarUrl}
                        position={myPosition}
                        label={pseudo}
                        chatMessage={chatMessages[myIndex]}
                    />

                    {otherPositions.map((pos, i) => (
                        <Avatar
                            key={i}
                            avatarUrl={randomAvatars[i]}
                            position={pos}
                            label={`Invité ${i + 1}`}
                            chatMessage={chatMessages[i >= myIndex ? i + 1 : i]} // adapté si on veut ajouter messages autres invités
                        />
                    ))}

                    <VideoScreen videoUrl={import.meta.env.BASE_URL + "video.mp4"} />
                </Suspense>
            </Canvas>

            {/* Barre de chat */}
            <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 w-96 flex gap-2 bg-white bg-opacity-70 p-2 rounded-lg">
                <input
                    type="text"
                    placeholder="Écrire un message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') sendMessage();
                    }}
                    maxLength={200}
                    className="flex-grow px-4 py-2 rounded-xl border border-gray-300 text-base outline-none
               focus:border-blue-600 transition-colors duration-300"
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl
               px-5 py-2 ml-2 shadow-md transition-colors duration-300 cursor-pointer"
                >
                    Envoyer
                </button>
            </div>
        </>
    );
}


// A venir
// - Ajout mur pour la TV
// - mettre le chat
// - Mettre les personnages selectionnables
// - Mettre plus d'avatars
// Changer les noms des avatars
// Ajouter un compteur avant la vidéo