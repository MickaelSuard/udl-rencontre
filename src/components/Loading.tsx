import { motion } from 'framer-motion';
import { Html } from '@react-three/drei';

function LoadingOverlay() {
  return (
    <Html center>
      <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2"
        >
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xl w-72 font-semibold mt-2">En cours d'inspiration de phrase pendant le chargement...</p>
        </motion.div>
      </div>
    </Html>
  );
}
export default LoadingOverlay;