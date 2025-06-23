import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useMemo, useState, useEffect } from 'react';

function Avatar({ modelUrl, position }: { modelUrl: string; position: [number, number, number] }) {
    const { scene } = useGLTF(modelUrl);

    return (
        <primitive
            object={scene}
            position={position}
            scale={[0.6, 0.6, 0.6]}
            rotation={[0, Math.PI, 0]}
        />
    );
}

function VideoScreen({ videoUrl }: { videoUrl: string }) {
    const [video] = useState(() => Object.assign(document.createElement('video'), {
        src: videoUrl,
        crossOrigin: 'Anonymous',
        loop: true,
        muted: true,
        autoplay: true,
        playsInline: true,
    }));

    useEffect(() => {
        video.play();
    }, [video]);

    const sceneSize = 40;
    const wallWidth = 1;
    const wallHeight = 4;
    const wallY = wallHeight / 0.75 - 0.5;

    return (
        <mesh 
            position={[0, wallY - 0.25, -sceneSize / 2 + wallWidth / 2]} 
            rotation={[0, 0, 0]} // La vidéo face au public, pas inclinée
        >
            <planeGeometry args={[10, 5.5]} />
            <meshBasicMaterial>
                <videoTexture attach="map" args={[video]} />
            </meshBasicMaterial>
        </mesh>
    );
}


function Chair({ position }: { position: [number, number, number] }) {
    return (
        <group position={position} rotation={[0, Math.PI, 0]}>
            {/* Pieds */}
            {[[-0.4, 0.25, 0.4], [0.4, 0.25, 0.4], [-0.4, 0.25, -0.4], [0.4, 0.25, -0.4]].map(([x, y, z], i) => (
                <mesh key={i} position={[x, y, z]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
            ))}

            {/* Assise */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1, 0.2, 1]} />
                <meshStandardMaterial color="#444" />
            </mesh>
            {/* Dossier */}
            <mesh position={[0, 1.1, -0.4]}>
                <boxGeometry args={[1, 1.2, 0.2]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
    );
}

function Steps({ totalRows }: { totalRows: number }) {
    const baseY = -0.25;

    return (
        <>
            {Array.from({ length: totalRows }).map((_, row) => {
                const y = (totalRows - row - 1) * 0.5 + baseY;
                const z = row * -2 + 2;

                return (
                    <mesh
                        key={row}
                        position={[0, y - 0.25, z]} // garder ce -0.25 pour la surface qui touche les pieds
                    >
                        <boxGeometry args={[12, 0.5, 2]} />
                        <meshStandardMaterial color="#666" />
                    </mesh>
                );
            })}
        </>
    );
}

function Walls() {
  const wallWidth = 1;
  const wallHeight = 5;  // Hauteur des murs
  const sceneSize = 40;
  const halfSize = sceneSize / 2;
  const wallOffsetX = halfSize + wallWidth / 2;
  const wallOffsetZ = halfSize + wallWidth / 2;
  const wallY = wallHeight / 2 - 0.5; // <-- Décalage Y pour coller au sol à y = -0.5

  return (
    <>
      {/* Mur gauche */}
      <mesh position={[-wallOffsetX, wallY, 0]}>
        <boxGeometry args={[wallWidth, wallHeight, sceneSize]} />
        <meshStandardMaterial color="#888" />
      </mesh>

      {/* Mur droit */}
      <mesh position={[wallOffsetX, wallY, 0]}>
        <boxGeometry args={[wallWidth, wallHeight, sceneSize]} />
        <meshStandardMaterial color="#888" />
      </mesh>

      {/* Mur avant */}
      <mesh position={[0, wallY, -wallOffsetZ]}>
        <boxGeometry args={[sceneSize, wallHeight, wallWidth]} />
        <meshStandardMaterial color="#888" />
      </mesh>
    </>
  );
}






export default function Scene({ avatarUrls, videoUrl }: { avatarUrls: string[]; videoUrl: string }) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const baseY = -0.25;
    const totalRows = 5;

    const seatPositions = useMemo(() => {
        const positions: [number, number, number][] = [];
        for (let row = 0; row < totalRows; row++) {
            for (let col = 0; col < 8; col++) {
                const y = (totalRows - row - 1) * 0.5 + baseY;
                const z = row * -2 + 2;
                const x = col * 1.5 - 5.25;
                positions.push([x, y, z]);
            }
        }
        return positions;
    }, [totalRows, baseY]);

    const randomSeat = useMemo(() => {
        const index = Math.floor(Math.random() * seatPositions.length);
        return seatPositions[index];
    }, [seatPositions]);

    return (
        <>
            {/* UI simple pour choisir l’avatar */}
            <div style={{
                position: 'absolute',
                top: 20,
                left: 20,
                zIndex: 10,
                background: 'rgba(0,0,0,0.5)',
                padding: 10,
                borderRadius: 5,
            }}>
                {avatarUrls.map((url, i) => (
                    <button
                        key={i}
                        onClick={() => setSelectedIndex(i)}
                        style={{
                            marginRight: 8,
                            padding: '6px 12px',
                            background: selectedIndex === i ? '#4caf50' : '#888',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer'
                        }}
                    >
                        Avatar {i + 1}
                    </button>
                ))}
            </div>

            <Canvas
                camera={{ position: [0, 5, 20], fov: 50 }}
                style={{ width: '100vw', height: '100vh' }}
            >
                {/* ... tous tes autres composants comme Walls, Steps, Chairs ... */}

                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 5, 2]} />

                <Walls />

                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                    <planeGeometry args={[40, 40]} />
                    <meshStandardMaterial color="#222" />
                </mesh>

                <Steps totalRows={totalRows} />

                {seatPositions.map((pos, index) => (
                    <Chair key={index} position={pos} />
                ))}

                {/* Affiche uniquement l’avatar sélectionné */}
                <Avatar
                    modelUrl={avatarUrls[selectedIndex]}
                    position={[
                        randomSeat[0],
                        randomSeat[1] + 2,
                        randomSeat[2],
                    ]}
                />

                <VideoScreen videoUrl={videoUrl} />

                <OrbitControls />
            </Canvas>
        </>
    );
}
