'use client';
import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { RefreshCw, Upload, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReverseVideo() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

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
    <div className="w-full max-w-lg flex flex-col gap-4">
      {!videoFile ? (
        <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-2xl cursor-pointer hover:border-slate-600 transition-all bg-[#0a0c10]">
          <Upload className="w-8 h-8 text-slate-500 mb-2" />
          <span className="text-sm text-slate-400">Choisir une vidéo</span>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files && setVideoFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="text-sm text-slate-300">Vidéo chargée : {videoFile.name}</div>
          
          {isProcessing && (
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}

          {!resultUrl ? (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReverse}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium flex items-center justify-center gap-2"
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
