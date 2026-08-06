'use client';
import { useEffect, useState } from 'react';
import { Upload, ImageIcon, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

type Position = 'first' | 'last';

export default function VideoProcessor() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('Glissez-déposez une vidéo');
  const [isError, setIsError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Libère l'URL du blob quand elle est remplacée ou au démontage.
  useEffect(() => {
    if (!videoObjectUrl) return;
    return () => URL.revokeObjectURL(videoObjectUrl);
  }, [videoObjectUrl]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setIsError(true);
      setStatus("Ce fichier n'est pas une vidéo.");
      return;
    }

    setVideoFile(file);
    setVideoObjectUrl(URL.createObjectURL(file));
    setFrameUrl(null);
    setIsError(false);
    setStatus(`Vidéo : ${file.name}`);
  };

  const extractWithCanvas = (position: Position): Promise<string> =>
    new Promise((resolve, reject) => {
      if (!videoObjectUrl) {
        reject(new Error('Aucune vidéo chargée.'));
        return;
      }

      const video = document.createElement('video');
      video.muted = true;
      video.preload = 'auto';

      const cleanup = () => {
        video.onloadedmetadata = null;
        video.onseeked = null;
        video.onerror = null;
        video.removeAttribute('src');
      };

      video.onloadedmetadata = () => {
        // Une durée non finie signale un conteneur en flux : impossible de
        // viser la dernière image de façon fiable.
        if (position === 'last' && !Number.isFinite(video.duration)) {
          cleanup();
          reject(new Error('Durée de la vidéo indéterminée.'));
          return;
        }
        video.currentTime =
          position === 'first' ? 0 : Math.max(0, video.duration - 0.05);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        if (!context || !canvas.width || !canvas.height) {
          cleanup();
          reject(new Error('Impossible de lire les dimensions de la vidéo.'));
          return;
        }

        context.drawImage(video, 0, 0);
        cleanup();
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };

      video.onerror = () => {
        cleanup();
        reject(new Error('Format vidéo non pris en charge par le navigateur.'));
      };

      video.src = videoObjectUrl;
    });

  const handleExtract = async (position: Position) => {
    setIsProcessing(true);
    setIsError(false);
    try {
      setFrameUrl(await extractWithCanvas(position));
      setStatus('Extraction réussie');
    } catch (error) {
      setIsError(true);
      setStatus(
        error instanceof Error ? error.message : "Erreur lors de l'extraction"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const frameFileName = () => {
    const base = videoFile?.name.replace(/\.[^.]+$/, '') ?? 'frame';
    return `${base}-frame.jpg`;
  };

  return (
    <div className="w-full max-w-lg flex flex-col gap-6 relative">
      <motion.div
        aria-hidden
        className="absolute inset-0 z-0 opacity-10 rounded-2xl overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, #ef4444 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
        animate={{ backgroundPosition: ['0px 0px', '24px 24px'] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-tr from-red-500/10 via-orange-500/10 to-transparent blur-2xl rounded-2xl"
      />

      {!videoFile ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.length) handleFile(e.dataTransfer.files[0]);
          }}
          className={`relative z-10 flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all bg-[#0a0c10] shadow-sm ${
            isDragging ? 'border-red-500 bg-red-500/5' : 'border-slate-800 hover:border-red-500/50'
          }`}
        >
          <Upload className="w-8 h-8 text-slate-500 mb-2" />
          <span className="text-sm text-slate-300 font-medium">Choisir une vidéo</span>
          <span className="text-xs text-slate-600 mt-1">ou glissez-déposez le fichier</span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="relative z-10 flex flex-col gap-6">
          <div className="w-full aspect-video bg-[#050608] rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
            <video src={videoObjectUrl!} controls className="w-full h-full object-contain" />
          </div>

          {!frameUrl ? (
            <div className="grid grid-cols-2 gap-3">
              {(['first', 'last'] as const).map((position) => (
                <button
                  key={position}
                  onClick={() => handleExtract(position)}
                  disabled={isProcessing}
                  className="py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                  {position === 'first' ? 'Première frame' : 'Dernière frame'}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={frameUrl}
                alt="Image extraite de la vidéo"
                className="w-full aspect-video object-contain rounded-xl border border-slate-800 bg-[#050608]"
              />
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={frameUrl}
                  download={frameFileName()}
                  className="py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Télécharger
                </a>
                <button
                  onClick={() => setFrameUrl(null)}
                  className="py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-md"
                >
                  Autre extraction
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-slate-400 font-medium flex items-center gap-2 justify-center z-10">
        {isError ? (
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        )}
        <span className="truncate">{status}</span>
      </div>
    </div>
  );
}
