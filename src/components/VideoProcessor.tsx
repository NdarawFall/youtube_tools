'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Upload, Film, Image as ImageIcon, Download, RefreshCw, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VideoProcessor() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Glissez-déposez une vidéo ou cliquez ci-dessous');
  const [isProcessing, setIsProcessing] = useState(false);
  const [engineUsed, setEngineUsed] = useState<'canvas' | 'ffmpeg' | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);

  // Pre-load FFmpeg silently in background for fallback
  useEffect(() => {
    let isMounted = true;
    const initFFmpeg = async () => {
      try {
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        if (isMounted) setFfmpegLoaded(true);
      } catch (err) {
        console.warn('FFmpeg background load warning:', err);
      }
    };
    initFFmpeg();
    return () => { isMounted = false; };
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setStatus('Veuillez sélectionner un fichier vidéo valide (MP4, WEBM, MOV).');
      return;
    }
    if (videoObjectUrl) {
      URL.revokeObjectURL(videoObjectUrl);
    }
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoObjectUrl(url);
    setFrameUrl(null);
    setEngineUsed(null);
    setStatus(`Vidéo chargée : ${file.name}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Primary Instant Extraction Engine using HTML5 Canvas
  const extractWithCanvas = (position: 'first' | 'last'): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!videoObjectUrl) return reject(new Error('Aucune vidéo fournie'));

      const video = document.createElement('video');
      video.src = videoObjectUrl;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;

      const onSeeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Impossible d\'initialiser le canvas');
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          
          // Cleanup
          video.removeEventListener('seeked', onSeeked);
          video.pause();
          video.removeAttribute('src');
          video.load();
          
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      video.addEventListener('loadedmetadata', () => {
        if (position === 'first') {
          video.currentTime = 0.01;
        } else {
          // Seek to last frame (duration minus 0.05s)
          const targetTime = Math.max(0, video.duration - 0.05);
          video.currentTime = targetTime;
        }
      });

      video.addEventListener('seeked', onSeeked);
      video.addEventListener('error', (e) => reject(new Error('Erreur de lecture vidéo HTML5')));
    });
  };

  // Fallback Engine using FFmpeg WASM
  const extractWithFFmpeg = async (position: 'first' | 'last'): Promise<string> => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg || !videoFile) throw new Error('FFmpeg non disponible');
    if (!ffmpeg.loaded) {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    }

    const ext = videoFile.name.split('.').pop() || 'mp4';
    const inputName = `input.${ext}`;
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

    let ret;
    if (position === 'first') {
      ret = await ffmpeg.exec(['-ss', '0', '-i', inputName, '-vframes', '1', '-q:v', '2', 'output.jpg']);
    } else {
      ret = await ffmpeg.exec(['-sseof', '-0.5', '-i', inputName, '-update', '1', '-q:v', '2', 'output.jpg']);
      if (ret !== 0) {
        ret = await ffmpeg.exec(['-i', inputName, '-vframes', '1', '-q:v', '2', 'output.jpg']);
      }
    }

    if (ret !== 0) throw new Error(`FFmpeg code de sortie : ${ret}`);

    const fileData = await ffmpeg.readFile('output.jpg');
    const blob = new Blob([fileData as BlobPart], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  };

  const handleExtract = async (position: 'first' | 'last') => {
    if (!videoFile) return;
    setIsProcessing(true);
    setStatus(`Extraction de la ${position === 'first' ? 'première' : 'dernière'} frame en cours...`);

    try {
      // 1. Try Instant Canvas Engine first
      const frameDataUrl = await extractWithCanvas(position);
      setFrameUrl(frameDataUrl);
      setEngineUsed('canvas');
      setStatus('Extraction réussie instantanément !');
    } catch (canvasErr) {
      console.warn('Canvas engine fallback to FFmpeg WASM:', canvasErr);
      try {
        // 2. Fallback to FFmpeg WASM
        setStatus('Calcul avec le moteur FFmpeg WASM...');
        const ffmpegFrameUrl = await extractWithFFmpeg(position);
        setFrameUrl(ffmpegFrameUrl);
        setEngineUsed('ffmpeg');
        setStatus('Extraction réussie via FFmpeg !');
      } catch (ffmpegErr) {
        console.error('All extraction engines failed:', ffmpegErr);
        const msg = ffmpegErr instanceof Error ? ffmpegErr.message : 'Erreur inconnue';
        setStatus(`Échec de l'extraction : ${msg}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setVideoFile(null);
    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    setVideoObjectUrl(null);
    setFrameUrl(null);
    setEngineUsed(null);
    setStatus('Glissez-déposez une vidéo ou cliquez ci-dessous');
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4">
      {/* Main Glass Panel */}
      <div className="w-full glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300">
        
        {/* Step 1: Upload Dropzone when no video selected */}
        {!videoFile && (
          <div
            onClick={() => document.getElementById('videoInput')?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' 
                : 'border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-800/30'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">
              Glissez votre vidéo ici
            </h3>
            <p className="text-sm text-slate-400 mb-4 text-center">
              Ou cliquez pour parcourir vos fichiers (MP4, WEBM, MOV, Shorts)
            </p>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-indigo-300 border border-indigo-500/20 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Traitement 100% local ultra-rapide
            </span>
            <input
              id="videoInput"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Step 2: Workspace when video is loaded */}
        {videoFile && (
          <div className="flex flex-col md:flex-row gap-6 items-center">
            
            {/* Left Column: Video Preview or File Card */}
            <div className="w-full md:w-1/2 flex flex-col items-center gap-3">
              <div className="w-full h-48 sm:h-56 bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden relative flex items-center justify-center group shadow-inner">
                {videoObjectUrl ? (
                  <video 
                    src={videoObjectUrl} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Film className="w-12 h-12 text-slate-600" />
                )}
              </div>
              <div className="flex items-center justify-between w-full px-1 text-xs text-slate-400">
                <span className="truncate max-w-[200px] font-medium text-slate-300">{videoFile.name}</span>
                <span>{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</span>
              </div>
            </div>

            {/* Right Column: Controls & Result */}
            <div className="w-full md:w-1/2 flex flex-col justify-between h-full gap-4">
              
              {/* Extract Buttons */}
              {!frameUrl && (
                <div className="flex flex-col gap-3 my-auto">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Sélectionnez la frame à extraire :
                  </span>
                  <button
                    onClick={() => handleExtract('first')}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    Première Frame (Début)
                  </button>

                  <button
                    onClick={() => handleExtract('last')}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    Dernière Frame (Fin)
                  </button>

                  <button
                    onClick={resetAll}
                    disabled={isProcessing}
                    className="py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors self-center mt-2 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Changer de vidéo
                  </button>
                </div>
              )}

              {/* Extracted Frame Result & Download */}
              {frameUrl && (
                <div className="flex flex-col gap-3 items-center">
                  <div className="w-full h-40 sm:h-44 rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-950/80 relative shadow-lg shadow-emerald-500/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={frameUrl} 
                      alt="Frame extraite" 
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => setFrameUrl(null)}
                      className="w-1/3 py-2.5 px-3 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all text-center"
                    >
                      Recommencer
                    </button>
                    <a
                      href={frameUrl}
                      download={`frame_${Date.now()}.jpg`}
                      className="w-2/3 py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" /> Télécharger (.jpg)
                    </a>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Status Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {status.includes('Erreur') || status.includes('Échec') ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : status.includes('réussie') ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
            <span className={`font-medium ${
              status.includes('Erreur') || status.includes('Échec') 
                ? 'text-red-400' 
                : status.includes('réussie') 
                  ? 'text-emerald-400' 
                  : 'text-slate-300'
            }`}>
              {status}
            </span>
          </div>

          {engineUsed && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {engineUsed === 'canvas' ? '⚡ Moteur Canvas Instantané' : '⚙️ Moteur FFmpeg WASM'}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
