import React from 'react';
import {
  FileText,
  Presentation,
  HelpCircle,
  Folder,
  Eye,
  Download,
  Calendar,
  Trash2,
  FileCode,
  Clock
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

export default function MaterialCard({ material, showCourseBadge = false }) {
  const { setViewingMaterial, deleteMaterial } = useAcademic();

  const handleDownload = (e) => {
    e.stopPropagation();
    const element = document.createElement('a');
    const dummyContent = `=== University Academic Organizer ===\n\nTitle: ${material.title}\nCourse: ${material.courseName || ''} (${material.courseCode || ''})\nType: ${(material.type || 'Material').toUpperCase()}\nFile Name: ${material.fileName}\nUploaded: ${material.uploadDate}\n\nDescription:\n${material.description || 'No description provided.'}\n\n---\nAcademic organizer document file.`;
    const file = new Blob([dummyContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = material.fileName ? material.fileName.replace(/\.pdf$/, '.txt') : `${material.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getIcon = () => {
    switch (material.type) {
      case 'slide':
        return <Presentation className="w-5 h-5 text-blue-600" />;
      case 'assignment':
        return <FileText className="w-5 h-5 text-amber-600" />;
      case 'question':
        return <HelpCircle className="w-5 h-5 text-purple-600" />;
      case 'note':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      default:
        return <Folder className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTypeBadge = () => {
    switch (material.type) {
      case 'slide':
        return (
          <span className="text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-lg">
            {material.lectureNumber !== undefined
              ? `Lecture ${String(material.lectureNumber).padStart(2, '0')}`
              : 'Lecture Slide'}
          </span>
        );
      case 'assignment':
        return (
          <span className="text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-lg">
            Assignment
          </span>
        );
      case 'question':
        return (
          <span className="text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-lg">
            {material.term || 'Previous Question'}
          </span>
        );
      case 'note':
        return (
          <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
            Note
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-lg">
            Material
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between group">
      <div>
        {/* Header Row: Type badge, Course tag, Delete button */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {getTypeBadge()}
            {showCourseBadge && material.courseCode && (
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                {material.courseCode}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to delete "${material.title}"?`)) {
                deleteMaterial(material.id);
              }
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
            title="Delete material"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {material.type === 'slide' && material.lectureNumber !== undefined
            ? `Lecture ${String(material.lectureNumber).padStart(2, '0')} — ${material.title}`
            : material.title}
        </h4>

        {/* Description if available */}
        {material.description && (
          <p className="text-xs text-slate-500 font-normal mt-1.5 line-clamp-2">
            {material.description}
          </p>
        )}

        {/* File meta info */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 flex-wrap">
          <span className="font-medium text-slate-600 truncate max-w-[150px]">
            {material.fileName}
          </span>
          <span>•</span>
          <span>{material.fileSize || '1.5 MB'}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {material.uploadDate}
          </span>
        </div>

        {/* Due date if assignment */}
        {material.dueDate && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Due: {material.dueDate}</span>
          </div>
        )}
      </div>

      {/* Actions: View / Download */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={() => setViewingMaterial(material)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Open</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}

