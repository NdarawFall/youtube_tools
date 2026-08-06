'use client';
import { useEffect, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { RefreshCw, Upload, Download, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';

const FFMPEG_BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';

/** Le filtre `reverse` charge la vidéo entière en mémoire : on borne la taille. */
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export default function ReverseVideo() {
  const toast = useToast();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Génère l'aperçu à partir du fichier choisi.
  useEffect(() => {
    if (!videoFile) return;

    const url = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    video.muted = true;

    const onLoadedMetadata = () => {
      video.currentTime = Math.min(1, video.duration / 2 || 0);
    };

    const onSeeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      setThumbnailUrl(canvas.toDataURL('image/jpeg'));
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('seeked', onSeeked);
    video.src = url;

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('seeked', onSeeked);
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  // Libère l'URL du résultat quand il est remplacé ou au démontage.
  useEffect(() => {
    if (!resultUrl) return;
    return () => URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const handleSelect = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Fichier trop volumineux (100 Mo maximum).');
      return;
    }
    setResultUrl(null);
    setThumbnailUrl(null);
    setVideoFile(file);
  };

  const initFFmpeg = async () => {
    if (ffmpegRef.current?.loaded) return ffmpegRef.current;

    const ffmpeg = new FFmpeg();
    ffmpeg.on('progress', ({ progress }) => {
      setProgress(Math.min(100, Math.round(progress * 100)));
    });
    await ffmpeg.load({
      coreURL: await toBlobURL(`${FFMPEG_BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${FFMPEG_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  /**
   * `-af areverse` fait échouer ffmpeg sur une vidéo sans piste audio.
   * On tente donc avec l'audio, puis on retombe sur la vidéo seule.
   */
  const runReverse = async (ffmpeg: FFmpeg) => {
    try {
      await ffmpeg.exec(['-i', 'input.mp4', '-vf', 'reverse', '-af', 'areverse', 'output.mp4']);
      return await ffmpeg.readFile('output.mp4');
    } catch {
      await ffmpeg.exec(['-i', 'input.mp4', '-vf', 'reverse', '-an', 'output.mp4']);
      return await ffmpeg.readFile('output.mp4');
    }
  };

  const handleReverse = async () => {
    if (!videoFile) return;

    setIsProcessing(true);
    setProgress(0);
    try {
      const ffmpeg = await initFFmpeg();
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      const data = await runReverse(ffmpeg);
      const blob = new Blob([data as BlobPart], { type: 'video/mp4' });
      setResultUrl(URL.createObjectURL(blob));
      toast.success('Vidéo inversée avec succès.');
    } catch (error) {
      console.error('Reverse failed', error);
      toast.error("L'inversion a échoué. Essayez un fichier MP4 plus court.");
    } finally {
      setIsProcessing(false);
    }
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
        <label className="relative z-10 flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-2xl cursor-pointer hover:border-red-500/50 transition-all bg-[#0a0c10]">
          <Upload className="w-8 h-8 text-slate-500 mb-2" />
          <span className="text-sm text-slate-300 font-medium">Choisir une vidéo</span>
          <span className="text-xs text-slate-600 mt-1">MP4 recommandé, 100 Mo maximum</span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleSelect(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="relative z-10 flex flex-col gap-6">
          <div className="relative w-full aspect-video bg-[#050608] rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
            {resultUrl ? (
              <video src={resultUrl} controls className="w-full h-full object-contain" />
            ) : thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnailUrl} alt="Aperçu" className="w-full h-full object-cover" />
            ) : (
              <div className="animate-pulse w-full h-full bg-slate-900" />
            )}

            {isProcessing && (
              <motion.div
                aria-hidden
                className="absolute inset-y-0 w-1/2 bg-linear-to-r from-transparent via-red-500/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
              />
            )}
          </div>

          {isProcessing && (
            <div className="flex flex-col gap-2">
              <div className="w-full bg-[#0a0c10] rounded-full h-1.5 border border-slate-800 overflow-hidden">
                <div
                  className="bg-red-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 text-center">
                Traitement dans le navigateur, cela peut prendre un moment.
              </p>
            </div>
          )}

          {resultUrl ? (
            <a
              href={resultUrl}
              download={`${videoFile.name.replace(/\.[^.]+$/, '')}-inverse.mp4`}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4" /> Télécharger
            </a>
          ) : (
            <motion.button
              whileHover={{ scale: isProcessing ? 1 : 1.01 }}
              whileTap={{ scale: isProcessing ? 1 : 0.99 }}
              onClick={handleReverse}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? `Inversion... ${progress}%` : 'Inverser la vidéo'}
            </motion.button>
          )}

          {!isProcessing && !resultUrl && (
            <p className="flex items-start gap-2 text-xs text-slate-600">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Le traitement se fait entièrement dans votre navigateur : rien n&apos;est
              envoyé sur un serveur.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
