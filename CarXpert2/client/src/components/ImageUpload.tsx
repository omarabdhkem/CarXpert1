import { useState, useRef } from 'react';
import { Upload, X, Image, Loader2 } from 'lucide-react';
import { useUpload } from '../hooks/useUpload';

interface ImageUploadProps {
  category: 'car' | 'avatar' | 'dealership' | 'service-center';
  multiple?: boolean;
  maxFiles?: number;
  onImagesChange: (urls: string[]) => void;
  existingImages?: string[];
}

export default function ImageUpload({
  category,
  multiple = false,
  maxFiles = 10,
  onImagesChange,
  existingImages = [],
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { upload, deleteImage, isUploading, error } = useUpload({
    category,
    multiple,
    onSuccess: (result) => {
      const newUrls = result.urls || (result.url ? [result.url] : []);
      const updatedImages = [...images, ...newUrls];
      setImages(updatedImages);
      onImagesChange(updatedImages);
      setPreviews([]);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check max files limit
    if (images.length + files.length > maxFiles) {
      alert(`الحد الأقصى هو ${maxFiles} صور`);
      return;
    }

    // Show previews
    const newPreviews: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          if (newPreviews.length === files.length) {
            setPreviews(newPreviews);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    // Upload files
    upload(files);
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];
    try {
      await deleteImage(imageToRemove);
    } catch {
      // Continue removing from local state even if delete fails
    }
    
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (images.length + files.length > maxFiles) {
        alert(`الحد الأقصى هو ${maxFiles} صور`);
        return;
      }
      upload(Array.from(files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isUploading
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-primary-500 animate-spin mb-2" />
            <p className="text-gray-600">جاري رفع الصور...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium">
              اضغط أو اسحب الصور هنا
            </p>
            <p className="text-sm text-gray-400 mt-1">
              PNG, JPG, WebP حتى 5MB
              {multiple && ` (حد أقصى ${maxFiles} صور)`}
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Previews (during upload) */}
      {previews.length > 0 && isUploading && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div
              key={`preview-${index}`}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
            >
              <img
                src={image}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                  الرئيسية
                </span>
              )}
            </div>
          ))}
          
          {/* Add More Button */}
          {multiple && images.length < maxFiles && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <Image className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                <span className="text-sm text-gray-500">إضافة صورة</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Images Count */}
      {multiple && (
        <p className="text-sm text-gray-500 text-center">
          {images.length} / {maxFiles} صور
        </p>
      )}
    </div>
  );
}
