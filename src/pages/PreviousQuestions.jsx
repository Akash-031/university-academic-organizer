import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  Plus
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import MaterialCard from '../components/MaterialCard';

export default function PreviousQuestions() {
  const { courses, materials, openAddMaterialModal } = useAcademic();
  const [selectedCourseId, setSelectedCourseId] = useState('ALL');
  const [search, setSearch] = useState('');

  const questionMaterials = materials.filter(m => m.type === 'question');

  const filteredQuestions = questionMaterials.filter(pq => {
    const matchesCourse = selectedCourseId === 'ALL' || pq.courseId === selectedCourseId;
    const matchesSearch =
      pq.title.toLowerCase().includes(search.toLowerCase()) ||
      (pq.term && pq.term.toLowerCase().includes(search.toLowerCase())) ||
      (pq.description && pq.description.toLowerCase().includes(search.toLowerCase())) ||
      pq.fileName.toLowerCase().includes(search.toLowerCase()) ||
      pq.courseCode.toLowerCase().includes(search.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <HelpCircle className="w-7 h-7 text-purple-600" />
            <span>Previous Question Papers</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Archive of past midterm, final, and quiz question papers with solutions for exam preparation
          </p>
        </div>

        <button
          onClick={() => openAddMaterialModal(selectedCourseId !== 'ALL' ? selectedCourseId : null, 'question')}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Past Paper</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      {questionMaterials.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search past papers by year, midterm, final..."
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
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Courses ({questionMaterials.length})
              </button>
              {courses.map(course => {
                const count = questionMaterials.filter(q => q.courseId === course.id).length;
                return (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCourseId === course.id
                        ? 'bg-purple-600 text-white shadow-2xs'
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

      {/* Questions Grid */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-xl mx-auto space-y-3 shadow-2xs">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Previous Exam Papers Yet</h3>
          <p className="text-xs text-slate-500">
            {courses.length === 0
              ? 'Create a course first to start archiving past question papers.'
              : 'Upload past exam papers and solution sets for your courses.'}
          </p>
          <button
            onClick={() => openAddMaterialModal(null, 'question')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Past Paper</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuestions.map(pq => (
            <MaterialCard key={pq.id} material={pq} showCourseBadge={true} />
          ))}
        </div>
      )}
    </div>
  );
}

