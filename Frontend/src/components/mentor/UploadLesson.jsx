import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button, message } from "antd";
import {
  Plus,
  Upload,
  FileVideo,
  ArrowLeft,
  BookOpen,
  X,
  LinkIcon,
  File as FileIcon,
} from "lucide-react";
import { uploadLesson } from "../../apis/LessonServices";
import {
  getEnrollmentsByCourse,
  patchEnrollmentProgress,
  patchEnrollmentStatus,
} from "../../apis/EnrollmentServices";
import { getLessonProgressByEnrollment } from "../../apis/LessonProgressServices";
import { getCourseById } from "../../apis/CourseServices";
import { useNavigate } from "react-router";
import { useUserStore } from "../../store/useUserStore";

export const UploadLesson = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [images, setImages] = useState([]);
  const [courseId, setCourseId] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState("document");
  const [files, setFiles] = useState([]);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [materials, setMaterials] = useState([]);
  const navigate = useNavigate();
  const token = useUserStore((s) => s.token);
  const { sectionId } = useParams();
  const docInputRef = useRef(null);

  const handleUpload = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  // 🗑️ Xóa file
  const handleRemove = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMaterial = (e) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newMaterials = files.map((file) => ({
      id: Date.now() + Math.random(),
      file, // phải là File object
      name: file.name,
      type: file.type.includes("image") ? "image" : "document",
    }));
    setMaterials((prev) => [...prev, ...newMaterials]);
  };

  const handleRemoveMaterial = (id) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // 🚀 Gửi API upload
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!lessonTitle || !lessonDescription) {
      return message.warning("Vui lòng nhập đầy đủ tiêu đề và mô tả.");
    }

    const isVideo = contentType === "video";
    const filesToUpload = isVideo
      ? [...files]
      : [...materials.map((m) => m.file), ...files];

    if (filesToUpload.length === 0) {
      return message.warning(
        isVideo
          ? "Vui lòng chọn ít nhất một video."
          : "Vui lòng chọn ít nhất một tài liệu hoặc hình ảnh."
      );
    }

    const formData = new FormData();
    formData.append("section.id", sectionId); // id section tương ứng
    formData.append("title", lessonTitle);
    formData.append("description", lessonDescription);
    formData.append("contentType", isVideo ? "video" : "document");

    // Thêm tất cả file đã chọn (video hoặc document)
    filesToUpload.forEach((file) => formData.append("file", file));

    try {
      setIsUploading(true);
      const res = await uploadLesson(formData, token, {
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      }); // gọi API
      console.log("Upload thành công:", res.data);
      message.success("Upload bài học thành công!");
      // Optionally reset state or navigate
      setFiles([]);
      setMaterials([]);
      // Recompute enrollments progress for this course so learners' progress/status are up-to-date
      try {
        const payload = res?.data || res;
        const courseId =
          payload?.section?.course?.id ||
          payload?.section?.courseId ||
          payload?.course?.id ||
          payload?.courseId ||
          null;

        if (courseId) {
          // fetch enrollments for this course
          const enrollData = await getEnrollmentsByCourse(courseId, token);
          const enrollments = Array.isArray(enrollData)
            ? enrollData
            : enrollData?.content || enrollData?.data || [];

          // optionally get course info for fallback totalLessons
          let courseInfo = null;
          try {
            courseInfo = await getCourseById(courseId, token);
          } catch (e) {
            console.warn("Could not fetch course info for totalLessons", e);
          }

          for (const enroll of enrollments) {
            try {
              const enrollmentId = enroll.id;
              const totalLessons =
                enroll?.course?.totalLessons || courseInfo?.totalLessons || 0;

              // count completed lesson-progress entries for this enrollment
              let completedCount = 0;
              try {
                const lp = await getLessonProgressByEnrollment(
                  enrollmentId,
                  token
                );
                const list = Array.isArray(lp)
                  ? lp
                  : lp?.content || lp?.data || [];
                completedCount = list.filter(
                  (p) => p.completed === true
                ).length;
              } catch (e) {
                console.warn(
                  "Failed to get lesson progress for enrollment",
                  enrollmentId,
                  e
                );
              }

              // compute percentage
              let progressPercentage = 0;
              if (totalLessons === 0) {
                progressPercentage = 100;
              } else {
                progressPercentage = Math.round(
                  (completedCount / totalLessons) * 100
                );
              }

              const prevStatus = String(enroll.status || "").toLowerCase();
              // If previously completed and now there's a new lesson not completed -> set active
              if (prevStatus === "completed" && completedCount < totalLessons) {
                await patchEnrollmentStatus(enrollmentId, "active", token);
              }

              // update progress
              await patchEnrollmentProgress(
                enrollmentId,
                progressPercentage,
                token
              );

              // if now 100% ensure completed
              if (progressPercentage >= 100) {
                await patchEnrollmentStatus(enrollmentId, "completed", token);
              }
            } catch (e) {
              console.error(
                "Failed to update enrollment after lesson upload",
                e
              );
            }
          }

          // notify frontend to refresh enrolled views
          window.dispatchEvent(
            new CustomEvent("enrollment:updated", { detail: { courseId } })
          );
        } else {
          console.warn(
            "CourseId not found in upload response; skipping enrollment recompute."
          );
        }
      } catch (e) {
        console.error("Enrollment recompute after upload failed", e);
      }
    } catch (err) {
      console.error(err);
      message.error("Upload thất bại!");
    } finally {
      setIsUploading(false);
    }
  };

  // const handleUpload = (e) => {
  //   const newFiles = Array.from(e.target.files);
  //   setFiles((prev) => [...prev, ...newFiles]);
  // };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const handleFileChange = ({ file }) => {
    if (file && file.originFileObj) {
      setFiles((prev) => [...prev, file.originFileObj]); // lưu file thật từ antd Upload
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Upload Lesson
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Add video, reading materials, and resources to your lesson
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Lesson Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Lesson Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Lesson Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Introduction to React Components"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe what students will learn in this lesson"
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Content Type
            </h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setContentType("video")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  contentType === "video"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <FileVideo className="w-5 h-5" />
                Upload Video
              </button>
              <button
                type="button"
                onClick={() => setContentType("reading")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  contentType === "reading"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Upload Reading
              </button>
            </div>
          </div>

          {contentType === "video" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Upload Video
              </h2>
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <FileVideo className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Upload Your Video
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Drag and drop your video file here, or click to browse
                    </p>
                    <input
                      type="file"
                      accept={
                        contentType === "video"
                          ? "video/*"
                          : ".pdf,.doc,.docx,.ppt,.pptx,.txt,image/*"
                      }
                      multiple
                      className="hidden"
                      id="video-upload"
                      onChange={(e) => handleUpload(e)}
                    />
                    <label
                      htmlFor="video-upload"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors font-medium"
                    >
                      <Upload className="w-5 h-5" />
                      Choose Video
                    </label>
                  </div>
                  <p className="text-sm text-slate-500">
                    Supported: MP4, MOV, AVI, WMV (Max 2GB)
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
                    <span className="text-sm text-blue-700">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold text-slate-900">
                    Uploaded Videos
                  </h3>
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <FileVideo className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-slate-900">
                            {file.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {file.size} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(file.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {contentType === "reading" && (
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Reading Materials
                </h2>
              </div>

              {/* Reading Materials Tabs */}
              <div className="space-y-6">
                {/* Documents & PDFs */}
                <div className="border-b border-slate-200 pb-6">
                  <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FileIcon className="w-5 h-5 text-blue-600" />
                    Documents & PDFs
                  </h3>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                    <p className="text-sm text-slate-600 mb-4">
                      Upload lesson notes, slides, handouts, and PDF documents
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.txt,image/*"
                      multiple
                      className="hidden"
                      id="doc-upload"
                      ref={docInputRef}
                      onChange={handleAddMaterial}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        docInputRef.current && docInputRef.current.click()
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Documents
                    </button>
                    <p className="text-xs text-slate-500 mt-2">
                      PDF, DOC, PPT, TXT, Images (Max 50MB each)
                    </p>
                  </div>

                  {/* Documents List */}
                  {materials.filter((m) => m.type === "document").length >
                    0 && (
                    <div className="mt-4 space-y-2">
                      {materials
                        .filter((m) => m.type === "document")
                        .map((material) => (
                          <div
                            key={material.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                          >
                            <div className="flex items-center gap-3">
                              <FileIcon className="w-5 h-5 text-blue-600" />
                              <p className="font-medium text-slate-900">
                                {material.name}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(material.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => navigate(`/mentor/course/${courseId}/builder`)}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium text-center"
            >
              Cancel
            </Button>
            <button
              type="button"
              className="flex-1 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadLesson;
