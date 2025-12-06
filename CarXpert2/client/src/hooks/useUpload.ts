import { useState } from 'react';

interface UploadResult {
  url?: string;
  urls?: string[];
  message: string;
}

interface UseUploadOptions {
  category: 'car' | 'avatar' | 'dealership' | 'service-center';
  multiple?: boolean;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

export function useUpload({ category, multiple = false, onSuccess, onError }: UseUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | File[]) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      
      if (multiple) {
        Array.from(files).forEach((file) => {
          formData.append('images', file);
        });
      } else {
        const file = files instanceof FileList ? files[0] : files[0];
        formData.append(category === 'avatar' ? 'avatar' : 'image', file);
      }

      const endpoint = multiple 
        ? `/api/upload/${category}/multiple`
        : `/api/upload/${category}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في رفع الصورة');
      }

      const result: UploadResult = await response.json();
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'حدث خطأ أثناء رفع الصورة';
      setError(errorMessage);
      onError?.(err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (imagePath: string) => {
    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: imagePath }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في حذف الصورة');
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    upload,
    deleteImage,
    isUploading,
    progress,
    error,
  };
}
