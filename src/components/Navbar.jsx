import React from 'react';
import { Menu, Plus, FolderPlus, GraduationCap } from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import SearchBar from './SearchBar';

export default function Navbar({ onOpenMobileSidebar }) {
  const { openAddCourseModal, openAddMaterialModal, courses } = useAcademic();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left side: Hamburger (mobile) + Brand logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              Academic Organizer
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-auto">
          <SearchBar />
        </div>

        {/* Right side: Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openAddCourseModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>+ Course</span>
          </button>

          <button
            onClick={() => openAddMaterialModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Add Material</span>
            <span className="md:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
}

