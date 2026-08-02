'use client';
import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { RefreshCw, Upload, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReverseVideo({ theme }: { theme: 'dark' | 'light' }) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  useEffect(() => {
    if (!videoFile) return;
    const url = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    const handleLoadedMetadata = () => { video.currentTime = 1; };
    const handleSeeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      setThumbnailUrl(canvas.toDataURL('image/jpeg'));
      URL.revokeObjectURL(url);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', handleSeeked);
    };
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', handleSeeked);
    video.src = url;
    video.load();
  }, [videoFile]);

  const initFFmpeg = async () => {
    if (ffmpegRef.current?.loaded) return ffmpegRef.current;
    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    ffmpeg.on('progress', ({ progress }) => { setProgress(Math.round(progress * 100)); });
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

  const bgClass = theme === 'dark' ? 'bg-[#0a0c10]' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';
  const textClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
  const accentClass = 'bg-red-600 hover:bg-red-700';

  return (
    <div className="w-full max-w-lg flex flex-col gap-6 relative">
      <motion.div 
          className="absolute inset-0 -z-0 opacity-10 rounded-2xl overflow-hidden"
          style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #ef4444 1px, transparent 0)',
              backgroundSize: '24px 24px'
          }}
          animate={{ backgroundPosition: ['0px 0px', '24px 24px'] }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-red-500/10 via-orange-500/10 to-transparent blur-2xl rounded-2xl" />

      {!videoFile ? (
        <label className={`relative z-10 flex flex-col items-center justify-center h-48 border border-dashed rounded-2xl cursor-pointer hover:border-red-400 transition-all ${bgClass} ${borderClass}`}>
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <span className={`text-sm ${textClass} font-medium`}>Choisir une vidéo</span>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files && setVideoFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="relative z-10 flex flex-col gap-6">
          <div className={`w-full aspect-video ${theme === 'dark' ? 'bg-[#050608]' : 'bg-slate-100'} rounded-2xl border ${borderClass} overflow-hidden flex items-center justify-center shadow-inner`}>
            {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
                <div className="animate-pulse w-full h-full bg-slate-200"></div>
            )}
            {isProcessing && (
                <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent w-[200%] -left-[50%]"
                    animate={{ x: ['-25%', '25%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
            )}
          </div>
          
          {isProcessing && (
            <div className={`w-full ${bgClass} rounded-full h-1.5 border ${borderClass}`}>
              <div className="bg-red-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}

          {!resultUrl ? (
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleReverse}
              disabled={isProcessing}
              className={`w-full py-3 rounded-xl ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'} text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all`}
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {isProcessing ? `Inversion... ${progress}%` : 'Inverser la vidéo'}
            </motion.button>
          ) : (
            <a href={resultUrl} download="reversed.mp4" className={`w-full py-3 rounded-xl ${accentClass} text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all`}>
              <Download className="w-4 h-4" /> Télécharger
            </a>
          )}
        </div>
      )}
    </div>
  );
}
