'use client';
import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { supabase } from '@/lib/supabase';
import { UploadCloud } from 'lucide-react';

export default function VideoProcessor() {
  const [loaded, setLoaded] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('En attente...');
  const [isProcessing, setIsProcessing] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    try {
      setStatus('Chargement de FFmpeg...');
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
      const ffmpeg = ffmpegRef.current;
      
      ffmpeg.on('log', ({ message }) => {
        if (messageRef.current) {
          messageRef.current.innerHTML = message;
        }
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setLoaded(true);
      setStatus('Prêt !');
    } catch (e) {
      console.error(e);
      setStatus('Erreur lors du chargement de FFmpeg. Assurez-vous d\'avoir une connexion internet.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
      setFrameUrl(null);
      setStatus('Fichier sélectionné.');
    }
  };

  const extractFrame = async (position: 'first' | 'last') => {
    if (!videoFile || !loaded) return;
    setIsProcessing(true);
    setStatus(`Extraction de la ${position === 'first' ? 'première' : 'dernière'} frame...`);
    
    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      if (position === 'first') {
        // vframes 1 prend la première image
        await ffmpeg.exec(['-i', 'input.mp4', '-vframes', '1', '-q:v', '2', 'output.jpg']);
      } else {
        // sseof cherche à partir de la fin de la vidéo (ici on recule de 1 seconde pour être sûr d'avoir une image, selon la vidéo)
        await ffmpeg.exec(['-sseof', '-1', '-i', 'input.mp4', '-update', '1', '-q:v', '2', 'output.jpg']);
      }

      const fileData = await ffmpeg.readFile('output.jpg');
      const data = fileData as Uint8Array;
      const url = URL.createObjectURL(new Blob([data as any], { type: 'image/jpeg' }));
      setFrameUrl(url);
      setStatus('Extraction réussie !');
    } catch (error) {
      console.error(error);
      setStatus('Erreur lors de l\'extraction. Réessayez avec une autre vidéo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadToSupabase = async () => {
    if (!frameUrl) return;
    setIsProcessing(true);
    setStatus('Sauvegarde sur Supabase en cours...');
    
    // Si les identifiants Supabase ne sont pas fournis, on avertit l'utilisateur
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setStatus('Erreur: Identifiants Supabase manquants dans les variables d\'environnement (.env.local)');
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch(frameUrl);
      const blob = await response.blob();
      const filename = `frame_${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from('frames')
        .upload(filename, blob, { contentType: 'image/jpeg' });

      if (error) throw error;
      
      setStatus('Image sauvegardée avec succès dans le bucket "frames" !');
    } catch (error: any) {
      console.error(error);
      setStatus(`Erreur Supabase: ${error.message || 'Vérifiez la configuration RLS de votre bucket.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-card">
      {!loaded ? (
        <div className="status-container">
          <div className="loader"></div>
          <p>{status}</p>
        </div>
      ) : (
        <>
          <div className="dropzone" onClick={() => document.getElementById('videoUpload')?.click()}>
            <UploadCloud className="dropzone-icon" />
            <h3>{videoFile ? videoFile.name : "Cliquez ou glissez une vidéo ici"}</h3>
            <p className="subtitle" style={{ fontSize: '0.9rem' }}>MP4, WEBM, MOV (Traitement 100% local)</p>
            <input 
              type="file" 
              id="videoUpload" 
              className="hidden" 
              accept="video/*" 
              onChange={handleFileChange} 
            />
          </div>

          <div className="status-container">
            <p style={{ fontWeight: 500, color: status.includes('Erreur') ? '#ef4444' : status.includes('succès') ? '#10b981' : 'inherit' }}>
              {status}
            </p>
            {isProcessing && <div className="loader"></div>}
            <p ref={messageRef} className="subtitle" style={{ fontSize: '0.75rem', opacity: 0.5, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}></p>
          </div>

          {videoFile && !frameUrl && (
            <div className="actions-row" style={{ marginTop: '1.5rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => extractFrame('first')}
                disabled={isProcessing}
              >
                Première Frame
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => extractFrame('last')}
                disabled={isProcessing}
              >
                Dernière Frame
              </button>
            </div>
          )}

          {frameUrl && (
            <div className="preview-container">
              <img src={frameUrl} alt="Frame extraite" className="preview-image" />
              <div className="actions-row">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setFrameUrl(null)}
                  disabled={isProcessing}
                >
                  Recommencer
                </button>
                <button 
                  className="btn btn-accent" 
                  onClick={uploadToSupabase}
                  disabled={isProcessing}
                >
                  Sauvegarder dans Supabase
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
