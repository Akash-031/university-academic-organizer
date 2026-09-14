import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import MaterialCard from '../components/MaterialCard';

export default function Assignments() {
  const { courses, materials, openAddMaterialModal } = useAcademic();
  const [selectedCourseId, setSelectedCourseId] = useState('ALL');
  const [search, setSearch] = useState('');

  const assignmentMaterials = materials.filter(m => m.type === 'assignment');

  const filteredAssignments = assignmentMaterials.filter(asg => {
    const matchesCourse = selectedCourseId === 'ALL' || asg.courseId === selectedCourseId;
    const matchesSearch =
      asg.title.toLowerCase().includes(search.toLowerCase()) ||
      (asg.description && asg.description.toLowerCase().includes(search.toLowerCase())) ||
      asg.fileName.toLowerCase().includes(search.toLowerCase()) ||
      asg.courseCode.toLowerCase().includes(search.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="w-7 h-7 text-amber-600" />
            <span>Assignments</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track homework submissions, problem specifications, and project deadlines across your courses
          </p>
        </div>

        <button
          onClick={() => openAddMaterialModal(selectedCourseId !== 'ALL' ? selectedCourseId : null, 'assignment')}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assignment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      {assignmentMaterials.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assignments by title or course..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          {/* Course Filter Pills */}
          {courses.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
              <button
                onClick={() => setSelectedCourseId('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCourseId === 'ALL'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Courses ({assignmentMaterials.length})
              </button>
              {courses.map(course => {
                const count = assignmentMaterials.filter(a => a.courseId === course.id).length;
                return (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCourseId === course.id
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {course.code} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Assignment Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-xl mx-auto space-y-3 shadow-2xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Assignments Uploaded Yet</h3>
          <p className="text-xs text-slate-500">
            {courses.length === 0
              ? 'Create a course first to start organizing assignments.'
              : 'Upload assignment problem sets and instructions for your courses.'}
          </p>
          <button
            onClick={() => openAddMaterialModal(null, 'assignment')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Assignment</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssignments.map(asg => (
            <MaterialCard key={asg.id} material={asg} showCourseBadge={true} />
          ))}
        </div>
      )}
    </div>
  );
}

