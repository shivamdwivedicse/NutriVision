import React, { useCallback, useState } from 'react';
import { Camera, UploadCloud } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  }, [onImageSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  }, [onImageSelect]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`relative group flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-[2rem] transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
        ${dragActive 
            ? 'border-green-500 bg-green-50/50 scale-[1.02] shadow-xl shadow-green-100' 
            : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-green-300 hover:shadow-lg hover:shadow-gray-100'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          accept="image/jpeg, image/jpg, image/png, image/webp, image/heic, image/heif"
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 pointer-events-none">
          <div className={`mb-6 p-5 rounded-2xl transition-all duration-300 ${dragActive ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-400 group-hover:text-green-500 group-hover:bg-green-50 group-hover:scale-110'}`}>
            <Camera size={40} strokeWidth={1.5} />
          </div>
          
          <h3 className="mb-2 text-xl font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
            Tap to Analyze Meal
          </h3>
          <p className="mb-1 text-sm text-gray-500 font-medium">
            or drag and drop photo here
          </p>
          <p className="text-xs text-gray-400 mt-4 px-3 py-1 bg-gray-50 rounded-full group-hover:bg-white transition-colors">
            JPG, PNG, WEBP supported
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;