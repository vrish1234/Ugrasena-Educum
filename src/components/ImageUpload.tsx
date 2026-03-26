import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  onUpload: (url: string) => void;
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setStatus('uploading');
      setProgress(0);
      setMessage('Uploading...');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      if (!supabase) return;

      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from('logo')
        .upload(filePath, file);

      clearInterval(interval);
      if (uploadError) {
        throw uploadError;
      }

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
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={uploadImage}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-navy-900 file:text-gold-500 hover:file:bg-navy-800"
      />
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-gold-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {message && (
        <p className={`text-sm ${status === 'error' ? 'text-red-600' : status === 'success' ? 'text-green-600' : 'text-gray-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
