import React, { useState, useEffect } from "react";
import { Plus, Upload, FileVideo } from "lucide-react";

export const UploadCourse = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [images, setImages] = useState([]);

  const handleUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemove = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (files) => {
    if (files && files.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);

      // giả lập upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return newProgress;
        });
      }, 200);
    }
  };

  // Khi chọn ảnh
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  // Khi xóa ảnh
  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
      handleFileUpload(e.dataTransfer.files);
    }
  };
  return (
    <div className="space-y-6 m-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Upload Course Videos
        </h2>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            dragActive
              ? "border-purple-400 bg-purple-50"
              : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Upload Course Video
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your video files here, or click to browse
              </p>
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                id="video-upload"
                onChange={(e) => this.handleFileUpload(e.target.files)}
              />
              <label
                htmlFor="video-upload"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 cursor-pointer transition-all"
              >
                <FileVideo className="w-5 h-5 mr-2" />
                Choose Videos
              </label>
            </div>
            <p className="text-sm text-gray-500">
              Supported formats: MP4, MOV, AVI, WMV (Max size: 2GB per file)
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                Uploading video...
              </span>
              <span className="text-sm text-blue-700">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Materials Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Upload Course Materials
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Documents Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileVideo className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Documents & PDFs
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Upload course materials, slides, and documents
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              multiple
              className="hidden"
              id="document-upload"
              onChange={handleUpload}
            />
            <label
              htmlFor="document-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </label>
            <p className="text-xs text-gray-500 mt-2">
              PDF, DOC, PPT (Max 50MB each)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="relative border rounded-lg overflow-hidden"
                >
                  {file.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="p-4 text-sm text-gray-600">{file.name}</div>
                  )}

                  <button
                    onClick={() => handleRemove(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            {/* File List */}
            {documents.length > 0 && (
              <ul className="mt-4 text-left space-y-1 text-sm text-gray-700">
                {documents.map((doc, i) => (
                  <li key={i} className="truncate">
                    📄 {doc.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Images Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-all">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Images & Graphics
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Upload course images, diagrams, and graphics
            </p>

            {/* Hidden input */}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.svg"
              multiple
              className="hidden"
              id="image-upload"
              onChange={handleImagesChange}
            />

            {/* Custom button */}
            <label
              htmlFor="image-upload"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Images
            </label>

            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG, GIF, SVG (Max 10MB each)
            </p>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-full h-24 rounded-lg overflow-hidden border group"
                  >
                    <img
                      src={img.preview}
                      alt={`preview-${i}`}
                      className="object-cover w-full h-full"
                    />
                    {/* nút xóa */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Course Information Form */}
        <div className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title
              </label>
              <input
                type="text"
                placeholder="Enter course title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">Select category</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="business">Business</option>
                <option value="data-science">Data Science</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe your course content, objectives, and what students will learn"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (hours)
              </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">Select level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium">
            Cancel
          </button>
          <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-medium">
            Save as Draft
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium">
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadCourse;
