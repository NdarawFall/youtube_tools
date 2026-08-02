'use client';
import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { RefreshCw, Upload, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReverseVideo() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Extract thumbnail
  useEffect(() => {
    if (!videoFile) return;
    const url = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    video.src = url;
    video.currentTime = 0.1;
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      setThumbnailUrl(canvas.toDataURL('image/jpeg'));
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  const initFFmpeg = async () => {
    if (ffmpegRef.current?.loaded) return ffmpegRef.current;
    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    
    ffmpeg.on('progress', ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  const handleReverse = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const ffmpeg = await initFFmpeg();
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      await ffmpeg.exec(['-i', 'input.mp4', '-vf', 'reverse', '-af', 'areverse', 'output.mp4']);
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data as BlobPart], { type: 'video/mp4' });
      setResultUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'inversion.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-lg flex flex-col gap-6">
      {!videoFile ? (
        <label className="flex flex-col items-center justify-center h-48 border border-slate-800 rounded-2xl cursor-pointer hover:border-slate-600 transition-all bg-[#0a0c10]">
          <Upload className="w-8 h-8 text-slate-500 mb-2" />
          <span className="text-sm text-slate-400">Choisir une vidéo</span>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files && setVideoFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="relative w-full aspect-video bg-black rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
            {thumbnailUrl && <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />}
            
            {isProcessing && (
                <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-indigo-500/10 to-transparent w-[200%] -left-[50%]"
                    animate={{ x: ['-25%', '25%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
            )}
          </div>
          
          {isProcessing && (
            <div className="w-full bg-[#0a0c10] rounded-full h-1.5 border border-slate-800">
              <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}

          {!resultUrl ? (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReverse}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-white text-[#050608] text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-white/5"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {isProcessing ? `Inversion... ${progress}%` : 'Inverser la vidéo'}
            </motion.button>
          ) : (
            <a href={resultUrl} download="reversed.mp4" className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Télécharger
            </a>
          )}
        </div>
      )}
    </div>
  );
}
