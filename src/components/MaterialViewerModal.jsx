import React, { useState } from 'react';
import {
  X,
  Download,
  BookOpen,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  Share2,
  CheckCircle2,
  Presentation,
  Folder
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

export default function MaterialViewerModal() {
  const { viewingMaterial, setViewingMaterial } = useAcademic();
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!viewingMaterial) return null;

  const totalPages = viewingMaterial.pageCount || 10;

  const handleDownload = () => {
    const element = document.createElement('a');
    const dummyContent = `=== University Academic Organizer ===\n\nTitle: ${viewingMaterial.title}\nCourse: ${viewingMaterial.courseName || ''} (${viewingMaterial.courseCode || ''})\nType: ${(viewingMaterial.type || 'Material').toUpperCase()}\nFile Name: ${viewingMaterial.fileName}\nUploaded: ${viewingMaterial.uploadDate}\n\nDescription:\n${viewingMaterial.description || 'No description provided.'}\n\n---\nAcademic organizer document file.`;
    const file = new Blob([dummyContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = viewingMaterial.fileName ? viewingMaterial.fileName.replace(/\.pdf$/, '.txt') : `${viewingMaterial.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl h-[90vh] max-h-[800px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-blue-600/30 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">
                {viewingMaterial.title}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {viewingMaterial.courseCode} — {viewingMaterial.courseName} • {viewingMaterial.fileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={() => setViewingMaterial(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
          {/* Main Simulated Document Viewer Viewport */}
          <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto">
            {/* Document Canvas Sheet */}
            <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border border-slate-300 p-8 min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {viewingMaterial.courseCode}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <div className="mt-8 text-center">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-3 capitalize">
                    {viewingMaterial.type === 'slide' && viewingMaterial.lectureNumber !== undefined
                      ? `Lecture ${String(viewingMaterial.lectureNumber).padStart(2, '0')}`
                      : viewingMaterial.type}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                    {viewingMaterial.title}
                  </h2>
                  {viewingMaterial.description && (
                    <p className="text-sm font-normal text-slate-600 mt-2">
                      {viewingMaterial.description}
                    </p>
                  )}
                </div>

                {/* Simulated Content Body */}
                <div className="mt-8 space-y-3">
                  <div className="h-3 bg-slate-100 rounded-full w-full" />
                  <div className="h-3 bg-slate-100 rounded-full w-11/12" />
                  <div className="h-3 bg-slate-100 rounded-full w-4/5" />
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 my-4 text-center">
                    <p className="text-xs font-medium text-slate-600">
                      [ Preview for {viewingMaterial.fileName} ]
                    </p>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full w-full" />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{viewingMaterial.courseName}</span>
                <span>Uploaded {viewingMaterial.uploadDate}</span>
              </div>
            </div>

            {/* Document Controls */}
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-md border border-slate-200 mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-700 min-w-[70px] text-center">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Sidebar: Material Metadata */}
          <div className="w-full md:w-72 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-5 overflow-y-auto space-y-5">
            {/* File Info */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Document Details
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">File Name</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[140px]">{viewingMaterial.fileName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Size</span>
                  <span className="font-semibold text-slate-800">{viewingMaterial.fileSize || '1.5 MB'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Type</span>
                  <span className="font-semibold text-slate-800 capitalize">{viewingMaterial.type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Course</span>
                  <span className="font-semibold text-slate-800">{viewingMaterial.courseCode}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Upload Date</span>
                  <span className="font-semibold text-slate-800">{viewingMaterial.uploadDate}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Document</span>
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Copy Reference'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

