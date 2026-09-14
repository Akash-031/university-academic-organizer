import React, { useState } from 'react';
import {
  Presentation,
  Search,
  Plus,
  ArrowUpDown
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import MaterialCard from '../components/MaterialCard';

export default function LectureSlides() {
  const { courses, materials, openAddMaterialModal } = useAcademic();
  const [selectedCourseId, setSelectedCourseId] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('lecture'); // 'lecture' | 'date'

  const allSlides = materials.filter(m => m.type === 'slide');

  const filteredSlides = allSlides
    .filter(slide => {
      const matchesCourse = selectedCourseId === 'ALL' || slide.courseId === selectedCourseId;
      const matchesSearch =
        slide.title.toLowerCase().includes(search.toLowerCase()) ||
        (slide.description && slide.description.toLowerCase().includes(search.toLowerCase())) ||
        slide.fileName.toLowerCase().includes(search.toLowerCase()) ||
        slide.courseName.toLowerCase().includes(search.toLowerCase()) ||
        slide.courseCode.toLowerCase().includes(search.toLowerCase());
      return matchesCourse && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'lecture') {
        return (a.lectureNumber || 999) - (b.lectureNumber || 999);
      }
      return new Date(b.uploadDate) - new Date(a.uploadDate);
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Presentation className="w-7 h-7 text-blue-600" />
            <span>Lecture Slides</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access and download presentation slides for all your courses in one organized repository
          </p>
        </div>

        <button
          onClick={() => openAddMaterialModal(selectedCourseId !== 'ALL' ? selectedCourseId : null, 'slide')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lecture Slide</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      {allSlides.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search slides by title, course, or file..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            {/* Sort By Toggle */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="lecture">Lecture Number (01, 02...)</option>
                <option value="date">Upload Date (Newest first)</option>
              </select>
            </div>
          </div>

          {/* Course Filter Pills */}
          {courses.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
              <button
                onClick={() => setSelectedCourseId('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCourseId === 'ALL'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Courses ({allSlides.length})
              </button>
              {courses.map(course => {
                const count = allSlides.filter(s => s.courseId === course.id).length;
                return (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCourseId === course.id
                        ? 'bg-blue-600 text-white shadow-2xs'
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

      {/* Slide Cards Grid */}
      {filteredSlides.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-xl mx-auto space-y-3 shadow-2xs">
          <Presentation className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Lecture Slides Yet</h3>
          <p className="text-xs text-slate-500">
            {courses.length === 0
              ? 'Create a course first to start uploading lecture slides.'
              : 'Upload lecture presentations to keep track of your classes.'}
          </p>
          <button
            onClick={() => openAddMaterialModal(null, 'slide')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lecture Slide</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSlides.map(slide => (
            <MaterialCard key={slide.id} material={slide} showCourseBadge={true} />
          ))}
        </div>
      )}
    </div>
  );
}

