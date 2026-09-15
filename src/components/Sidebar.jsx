import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Presentation,
  FileText,
  HelpCircle,
  CalendarDays,
  Settings,
  PlusCircle,
  GraduationCap,
  FolderPlus,
  Calendar,
  Users,
  X
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

export default function Sidebar({ isOpen, onClose }) {
  const {
    openAddCourseModal,
    openAddMaterialModal,
    openAddTaskModal,
    courses,
    materials,
    pendingTasks
  } = useAcademic();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/courses', label: 'Courses', icon: BookOpen, badge: courses.length },
    {
      to: '/calendar',
      label: 'Tasks & Deadlines',
      icon: CalendarDays,
      badge: pendingTasks.length,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      to: '/slides',
      label: 'Lecture Slides',
      icon: Presentation,
      badge: materials.filter(m => m.type === 'slide').length
    },
    {
      to: '/assignments',
      label: 'Assignments',
      icon: FileText,
      badge: materials.filter(m => m.type === 'assignment').length
    },
    {
      to: '/previous-questions',
      label: 'Previous Questions',
      icon: HelpCircle,
      badge: materials.filter(m => m.type === 'question').length
    },
    { to: '/rooms', label: 'My Rooms', icon: Users },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];


  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top brand header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm tracking-tight leading-none">
                Academic Organizer
              </h1>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-1 block">
                Student Workspace
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons: Quick Add Course & Add Material */}
        <div className="px-4 pt-4 pb-2 space-y-2">
          <button
            onClick={() => {
              openAddCourseModal();
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition duration-150"
          >
            <FolderPlus className="w-4 h-4 text-slate-600" />
            <span>+ Add Course</span>
          </button>

          <button
            onClick={() => {
              openAddMaterialModal();
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition duration-150 group"
          >
            <PlusCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Add Material</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive: active }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active || isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-blue-200/70 text-blue-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {courses.length > 0 && (
            <>
              <div className="pt-4 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Your Courses</span>
                <span className="text-[10px] text-slate-400 font-normal">({courses.length})</span>
              </div>

              {courses.map((c) => (
                <NavLink
                  key={c.id}
                  to={`/courses/${c.id}`}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium truncate transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="truncate">{c.code} — {c.name}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold">Academic Organizer</span>
          <span className="text-[11px] text-slate-400">v1.0</span>
        </div>
      </aside>
    </>
  );
}

