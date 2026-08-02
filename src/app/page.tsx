import VideoProcessor from '@/components/VideoProcessor';

export default function Home() {
  return (
    <main className="main-container">
      <div className="header">
        <h1 className="title">Frame Extractor</h1>
        <p className="subtitle">
          Uploadez une vidéo, extrayez la première ou dernière frame grâce à FFmpeg WebAssembly, 
          et sauvegardez-la directement dans Supabase.
        </p>
      </div>

      <VideoProcessor />
      
      <div style={{ marginTop: '4rem', textAlign: 'center', opacity: 0.6, fontSize: '0.9rem' }}>
        <p>Traitement vidéo entièrement local, vos fichiers ne sont pas envoyés sur un serveur pour l&apos;extraction.</p>
      </div>
    </main>
  );
}
