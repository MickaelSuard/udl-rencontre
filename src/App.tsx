import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AuditoriumScene from './components/Auditorium';
import AvatarPreview from './components/AvatarPreview';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGLTF } from '@react-three/drei';

const avatars = [
  { name: 'Femme', url: import.meta.env.BASE_URL + 'woman.glb' },
  { name: 'Homme', url: import.meta.env.BASE_URL + 'manTest.glb' },
];

function App() {
  const [pseudo, setPseudo] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNext = () =>
    setAvatarIndex((prev) => (prev + 1) % avatars.length);
  const handlePrev = () =>
    setAvatarIndex((prev) => (prev - 1 + avatars.length) % avatars.length);

  const handleEnter = () => {
    if (!pseudo) return;
    setLoading(true);
    // Simule un chargement, ici tu peux remplacer par chargement réel si besoin
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 2000);
  };

   useEffect(() => {
    // Précharge les avatars et le décor avant rendu
    avatars.forEach(a => useGLTF.preload(a.url));
    useGLTF.preload('/scene/auditorium.glb');
  }, []);

  if (submitted) {
    return (
      <AuditoriumScene
        avatarUrl={avatars[avatarIndex].url}
        pseudo={pseudo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col items-center justify-center p-6 space-y-8 relative">
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2"
          >
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-xl font-semibold mt-2">Chargement de la scène...</p>
          </motion.div>
        </div>
      )}

      <h1 className="text-2xl font-bold tracking-tight">🎭 Choisissez votre avatar</h1>

      <div className="relative w-full max-w-xl aspect-[3/4] bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700">
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-gray-700 hover:bg-gray-600 p-2 rounded-full shadow"
          disabled={loading}
        >
          <ChevronLeft size={24} />
        </button>

        <div className="w-full h-full pointer-events-none">
          <AvatarPreview url={avatars[avatarIndex].url} />
        </div>

        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-gray-700 hover:bg-gray-600 p-2 rounded-full shadow"
          disabled={loading}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <input
          type="text"
          placeholder="Entrez votre pseudo..."
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          disabled={loading}
        />

        <button
          onClick={handleEnter}
          disabled={!pseudo || loading}
          className={`w-full py-2 rounded-lg font-semibold text-white transition duration-200 ${pseudo
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-600 cursor-not-allowed'
            }`}
        >
          {!loading ? 'Entrer dans l’amphithéâtre' : 'Chargement...'}
        </button>
      </div>
    </div>
  );
}

export default App;
