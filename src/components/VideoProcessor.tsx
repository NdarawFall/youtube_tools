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

    loadFFmpeg();
  }, []);

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
      const extension = videoFile.name.split('.').pop() || 'mp4';
      const inputName = `input.${extension}`;
      
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

      let ret;
      if (position === 'first') {
        ret = await ffmpeg.exec(['-i', inputName, '-vframes', '1', '-q:v', '2', 'output.jpg']);
      } else {
        // Try getting last frame by seeking to end. If it fails (e.g. video < 1s), we could try something else, but let's stick to -0.5 to be safer for shorts
        ret = await ffmpeg.exec(['-sseof', '-0.5', '-i', inputName, '-update', '1', '-q:v', '2', 'output.jpg']);
        
        // If the first attempt for the last frame fails, it might be a very short video, so we try from the beginning
        if (ret !== 0) {
          ret = await ffmpeg.exec(['-i', inputName, '-vframes', '1', '-q:v', '2', 'output.jpg']);
        }
      }

      if (ret !== 0) {
        throw new Error(`FFmpeg exited with code ${ret}`);
      }

      const fileData = await ffmpeg.readFile('output.jpg');
      const data = fileData as Uint8Array;
      const url = URL.createObjectURL(new Blob([data as BlobPart], { type: 'image/jpeg' }));
      setFrameUrl(url);
      setStatus('Extraction réussie !');
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      setStatus(`Erreur lors de l'extraction: ${msg}`);
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
    } catch (error) {
      console.error(error);
      const err = error as Error;
      setStatus(`Erreur Supabase: ${err.message || 'Vérifiez la configuration RLS de votre bucket.'}`);
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
