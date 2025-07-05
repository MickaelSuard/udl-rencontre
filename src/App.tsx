import { useState } from 'react';
import AuditoriumScene from './components/Auditorium';

function App() {
  const [pseudo, setPseudo] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [avatarUrl] = useState('/woman.glb');

  if (!submitted) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Entrez votre pseudo</h1>
        <input
          type="text"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={() => setSubmitted(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Entrer dans l'amphithéâtre
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <AuditoriumScene avatarUrl={avatarUrl} pseudo={pseudo} />
    </div>
  );
}

export default App;
