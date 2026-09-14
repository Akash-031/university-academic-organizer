import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Presentation,
  FileText,
  HelpCircle,
  X,
  Sparkles,
  ArrowRight,
  FileCode
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { courses, materials, setViewingMaterial } = useAcademic();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Ctrl+K or / to focus
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === '/' && document.activeElement !== inputRef.current && !['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cleanQuery = query.trim().toLowerCase();

  const matchingCourses = cleanQuery
    ? courses.filter(c =>
        c.name.toLowerCase().includes(cleanQuery) ||
        c.code.toLowerCase().includes(cleanQuery) ||
        c.teacher.toLowerCase().includes(cleanQuery) ||
        (c.description && c.description.toLowerCase().includes(cleanQuery))
      )
    : [];

  const matchingMaterials = cleanQuery
    ? materials.filter(m =>
        m.title.toLowerCase().includes(cleanQuery) ||
        (m.topic && m.topic.toLowerCase().includes(cleanQuery)) ||
        m.fileName.toLowerCase().includes(cleanQuery) ||
        m.courseName.toLowerCase().includes(cleanQuery) ||
        m.courseCode.toLowerCase().includes(cleanQuery) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(cleanQuery))) ||
        (m.summary && m.summary.toLowerCase().includes(cleanQuery))
      )
    : [];

  const totalResults = matchingCourses.length + matchingMaterials.length;

  const handleSelectCourse = (courseId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/courses/${courseId}`);
  };

  const handleSelectMaterial = (material) => {
    setIsOpen(false);
    setViewingMaterial(material);
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'slide':
        return <Presentation className="w-4 h-4 text-blue-600" />;
      case 'assignment':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'question':
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <FileCode className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search courses, lecture slides, notes, assignments... (e.g. 'Tree', 'CSE214')"
          className="w-full pl-10 pr-16 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
        />

        {query ? (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-2.5 hidden sm:flex items-center gap-1">
            <kbd className="text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
              Ctrl K
            </kbd>
          </div>
        )}
      </div>

      {/* Instant Search Results Dropdown */}
      {isOpen && cleanQuery.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {/* Header Summary */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Found <strong className="text-slate-800">{totalResults}</strong> result{totalResults === 1 ? '' : 's'} for "{query}"
            </span>
            <span className="text-[11px] text-slate-400">Esc to close</span>
          </div>

          <div className="overflow-y-auto p-2 divide-y divide-slate-100">
            {totalResults === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm font-semibold text-slate-700">No matching materials or courses</p>
                <p className="text-xs text-slate-400 mt-1">Try searching with a course code, title, or file name.</p>
              </div>
            ) : (
              <>
                {/* Courses section */}
                {matchingCourses.length > 0 && (
                  <div className="py-2">
                    <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-blue-500" />
                      Courses ({matchingCourses.length})
                    </div>
                    {matchingCourses.map(course => (
                      <button
                        key={course.id}
                        onClick={() => handleSelectCourse(course.id)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50/80 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {course.code.split('-')[0]}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                              {course.code} — {course.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Instructor: {course.teacher}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Materials & Slides section */}
                {matchingMaterials.length > 0 && (
                  <div className="py-2">
                    <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Presentation className="w-3 h-3 text-indigo-500" />
                      Materials & Lecture Slides ({matchingMaterials.length})
                    </div>
                    {matchingMaterials.map(mat => (
                      <button
                        key={mat.id}
                        onClick={() => handleSelectMaterial(mat)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-white text-slate-600 shrink-0 mt-0.5">
                            {getMaterialIcon(mat.type)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                                {mat.courseCode} — {mat.title}
                              </span>
                              {mat.type === 'slide' && (
                                <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded">
                                  Slide
                                </span>
                              )}
                              {mat.type === 'assignment' && (
                                <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                                  Assignment
                                </span>
                              )}
                              {mat.type === 'question' && (
                                <span className="text-[10px] font-medium bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded">
                                  Exam Paper
                                </span>
                              )}
                            </div>
                            {mat.topic && (
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {mat.topic}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                              <span>{mat.fileName}</span>
                              <span>•</span>
                              <span>{mat.fileSize}</span>
                              <span>•</span>
                              <span>{mat.uploadDate}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                          View
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
