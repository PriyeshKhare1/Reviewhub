import { useState } from "react";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageUpload({ images, setImages, maxImages = 5 }) {
  const [previews, setPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const processFiles = (files) => {
    if (files.length + images.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validFiles = files.filter((file) => {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024;
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a valid image type`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    setImages([...images, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setPreviews((prev) => [...prev, e.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500"
        } ${images.length >= maxImages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          disabled={images.length >= maxImages}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            dragActive 
              ? "bg-blue-100 dark:bg-blue-900/40" 
              : "bg-slate-100 dark:bg-slate-800"
          }`}>
            <Upload className={`w-6 h-6 ${dragActive ? "text-blue-600" : "text-slate-500 dark:text-slate-400"}`} />
          </div>
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-200">
              {dragActive ? "Drop images here" : "Drag & drop images or click to browse"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {images.length}/{maxImages} images • JPG, PNG, WEBP (Max 5MB each)
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      <AnimatePresence mode="popLayout">
        {previews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
          >
            {previews.map((preview, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square rounded-xl overflow-hidden ring-2 ring-slate-200 dark:ring-slate-700 shadow-lg"
              >
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
                  {index + 1}
                </span>
              </motion.div>
            ))}

            {/* Add More Button */}
            {images.length < maxImages && (
              <motion.label
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Plus className="w-6 h-6 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">Add more</span>
              </motion.label>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
