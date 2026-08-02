'use client';
import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Upload, ImageIcon, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoProcessor({ theme }: { theme: 'dark' | 'light' }) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Glissez-déposez une vidéo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) return;
    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoObjectUrl(url);
    setFrameUrl(null);
    setStatus(`Vidéo : ${file.name}`);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFile(e.dataTransfer.files[0]);
  };

  const extractWithCanvas = (position: 'first' | 'last'): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!videoObjectUrl) return reject(new Error('Aucune vidéo'));
      const video = document.createElement('video');
      video.src = videoObjectUrl;
      video.muted = true;
      video.onloadedmetadata = () => {
        video.currentTime = position === 'first' ? 0.1 : video.duration - 0.1;
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      video.onerror = reject;
    });
  };

  const handleExtract = async (position: 'first' | 'last') => {
    setIsProcessing(true);
    try {
      setFrameUrl(await extractWithCanvas(position));
      setStatus('Extraction réussie');
    } catch (e) {
      setStatus('Erreur lors de l\'extraction');
    } finally {
      setIsProcessing(false);
    }
  };

  const bgClass = theme === 'dark' ? 'bg-[#0a0c10]' : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';
  const textClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-800';

  return (
    <div className="w-full max-w-lg flex flex-col gap-6 relative">
      <motion.div 
          className="absolute inset-0 -z-0 opacity-10 rounded-2xl overflow-hidden"
          style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #6366f1 1px, transparent 0)',
              backgroundSize: '24px 24px'
          }}
          animate={{ backgroundPosition: ['0px 0px', '24px 24px'] }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-transparent blur-2xl rounded-2xl" />

      {!videoFile ? (
        <label 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative z-10 flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${bgClass} ${borderClass} shadow-sm ${
            isDragging ? 'border-indigo-400 bg-indigo-50' : 'hover:border-indigo-300'
          }`}
        >
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <span className={`text-sm ${textClass} font-medium`}>Choisir une vidéo</span>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="relative z-10 flex flex-col gap-6">
          <div className={`w-full aspect-video ${theme === 'dark' ? 'bg-[#050608]' : 'bg-slate-100'} rounded-2xl border ${borderClass} overflow-hidden flex items-center justify-center shadow-inner`}>
            <video src={videoObjectUrl!} controls className="w-full h-full object-contain" />
          </div>

          {!frameUrl ? (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleExtract('first')} className="py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md">
                <ImageIcon className="w-4 h-4" /> Première Frame
              </button>
              <button onClick={() => handleExtract('last')} className="py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md">
                <ImageIcon className="w-4 h-4" /> Dernière Frame
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <img src={frameUrl} alt="Frame" className={`w-full aspect-video object-contain rounded-xl border ${borderClass}`} />
              <button onClick={() => setFrameUrl(null)} className="py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md">
                Autre extraction
              </button>
            </div>
          )}
        </div>
      )}
      <div className={`text-xs ${textClass} font-medium flex items-center gap-2 justify-center z-10`}>
        {status.includes('Erreur') ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        {status}
      </div>
    </div>
  );
}
