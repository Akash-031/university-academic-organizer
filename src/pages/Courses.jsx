import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Layers,
  PlusCircle
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import CourseCard from '../components/CourseCard';

export default function Courses() {
  const { courses, openAddCourseModal, openAddMaterialModal } = useAcademic();
  const [search, setSearch] = useState('');

  const filteredCourses = courses.filter(c => {
    const query = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.teacher.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-blue-600" />
            <span>Courses</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your courses and access their lecture slides, notes, assignments, and exam questions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddCourseModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Course</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      {courses.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by name, code, or teacher..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>
      )}

      {/* Empty State when 0 courses total */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-xl mx-auto space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No Courses Yet</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            You haven't created any courses yet. Add your courses (e.g. Data Structures, Algorithms) to begin organizing materials.
          </p>
          <button
            onClick={openAddCourseModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Your First Course</span>
          </button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No courses match your search "{search}"</h3>
          <p className="text-xs text-slate-500 mt-1">Try searching with a different course code or keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

