import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ArrowRight,
  Plus,
  Layers,
  Presentation,
  FileText
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

export default function CourseCard({ course, roomId = null }) {
  const navigate = useNavigate();
  const { openAddMaterialModal, materials } = useAcademic();

  // Dynamic counts derived from materials matching courseId
  const courseMaterials = materials.filter(m => m.courseId === course.id);
  const slideCount = courseMaterials.filter(m => m.type === 'slide').length;
  const assignmentCount = courseMaterials.filter(m => m.type === 'assignment').length;
  const totalCount = courseMaterials.length;

  const colorVariants = {
    blue: {
      borderTop: 'border-t-blue-600',
      tag: 'bg-blue-50 text-blue-700 border-blue-200',
      hoverBorder: 'hover:border-blue-400',
    },
    purple: {
      borderTop: 'border-t-purple-600',
      tag: 'bg-purple-50 text-purple-700 border-purple-200',
      hoverBorder: 'hover:border-purple-400',
    },
    emerald: {
      borderTop: 'border-t-emerald-600',
      tag: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      hoverBorder: 'hover:border-emerald-400',
    },
    amber: {
      borderTop: 'border-t-amber-600',
      tag: 'bg-amber-50 text-amber-700 border-amber-200',
      hoverBorder: 'hover:border-amber-400',
    },
    cyan: {
      borderTop: 'border-t-cyan-600',
      tag: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      hoverBorder: 'hover:border-cyan-400',
    },
    rose: {
      borderTop: 'border-t-rose-600',
      tag: 'bg-rose-50 text-rose-700 border-rose-200',
      hoverBorder: 'hover:border-rose-400',
    },
    indigo: {
      borderTop: 'border-t-indigo-600',
      tag: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      hoverBorder: 'hover:border-indigo-400',
    }
  };

  const scheme = colorVariants[course.color] || colorVariants.blue;

  return (
    <div
      onClick={() => navigate(roomId ? `/rooms/${roomId}/courses/${course.id}` : `/courses/${course.id}`)}
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden border-t-4 ${scheme.borderTop} ${scheme.hoverBorder} group`}
    >
      <div className="p-5">
        {/* Top bar: Course Code & Total Materials */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${scheme.tag}`}>
            {course.code}
          </span>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            <span>{totalCount} {totalCount === 1 ? 'material' : 'materials'}</span>
          </span>
        </div>

        {/* Course Name */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {course.name}
        </h3>

        {/* Teacher Info */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium truncate">{course.teacher}</span>
        </div>

        {/* Description if provided */}
        {course.description && (
          <p className="text-xs text-slate-500 font-normal mt-2 line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Material Counts Pill */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-center text-xs">
          <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-center gap-1.5 text-slate-600">
            <Presentation className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-bold">{slideCount}</span>
            <span className="text-[11px] text-slate-500">Slides</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-center gap-1.5 text-slate-600">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-bold">{assignmentCount}</span>
            <span className="text-[11px] text-slate-500">Tasks</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Open Course button */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={(e) => {
            e.stopPropagation();
            openAddMaterialModal(course.id);
          }}
          className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-semibold transition-colors py-1 px-2 rounded-lg hover:bg-white"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Material</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(roomId ? `/rooms/${roomId}/courses/${course.id}` : `/courses/${course.id}`);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-2xs transition-colors"
        >
          <span>Open Course</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

