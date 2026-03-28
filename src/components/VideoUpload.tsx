import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface VideoUploadProps {
  onUpload: (url: string) => void;
}

export function VideoUpload({ onUpload }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const uploadVideo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setStatus('uploading');
      setProgress(0);
      setMessage('Uploading...');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a video to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      if (!supabase) return;

      const { error: uploadError } = await supabase.storage
        .from('logo') // Assuming 'logo' bucket is used for all uploads
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setProgress(100);
      setStatus('success');
      setMessage('Upload successful!');

      const { data } = supabase.storage.from('logo').getPublicUrl(filePath);
      onUpload(data.publicUrl);
    } catch (error: any) {
      setStatus('error');
      setMessage(`Error: ${error.message}`);
    } finally {
      setUploading(false);
      setTimeout(() => {
        setStatus('idle');
        setMessage(null);
        setProgress(0);
      }, 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative group">
        <input
          type="file"
          accept="video/*"
          onChange={uploadVideo}
          disabled={uploading}
          className="block w-full text-sm text-white/30 file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:glass-gold file:text-gold-500 hover:file:bg-gold-500 hover:file:text-navy-900 transition-all cursor-pointer file:shadow-lg file:uppercase file:tracking-widest"
        />
      </div>
      
      {uploading && (
        <div className="w-full glass-dark rounded-full h-3 overflow-hidden border border-white/5">
          <div 
            className="bg-gold-500 h-full rounded-full shadow-[0_0_15px_rgba(251,192,45,0.5)] transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {message && (
        <p className={`text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-1 ${status === 'error' ? 'text-red-400' : status === 'success' ? 'text-green-400' : 'text-gold-500/60'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
