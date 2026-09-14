import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Presentation,
  FileText,
  HelpCircle,
  Folder,
  Plus,
  ArrowLeft,
  User,
  Search,
  Trash2,
  ChevronRight,
  Calendar,
  Clock
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import MaterialCard from '../components/MaterialCard';
import TaskCard from '../components/TaskCard';
import { parseTaskDateTime, getTaskDeadlineInfo } from '../utils/taskUtils';

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    getCourseById,
    getMaterialsByCourse,
    getTasksByCourse,
    openAddMaterialModal,
    openAddTaskModal,
    deleteCourse
  } = useAcademic();
  const [activeTab, setActiveTab] = useState('slides');
  const [searchFilter, setSearchFilter] = useState('');

  const course = getCourseById(courseId);

  if (!course) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-lg mx-auto my-12 space-y-4 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Course Not Found</h2>
        <p className="text-xs text-slate-500">The course you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/courses')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const allCourseMaterials = getMaterialsByCourse(course.id);
  const allCourseTasks = getTasksByCourse(course.id);

  const lectureSlides = allCourseMaterials
    .filter(m => m.type === 'slide')
    .sort((a, b) => (a.lectureNumber || 999) - (b.lectureNumber || 999));

  const notes = allCourseMaterials
    .filter(m => m.type === 'note')
    .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

  const assignments = allCourseMaterials
    .filter(m => m.type === 'assignment')
    .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

  const previousQuestions = allCourseMaterials
    .filter(m => m.type === 'question')
    .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

  const otherMaterials = allCourseMaterials
    .filter(m => m.type === 'other')
    .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

  // Course tasks sorted by due date
  const courseTasksWithDeadline = allCourseTasks
    .map(t => ({ ...t, deadlineInfo: getTaskDeadlineInfo(t) }))
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      const dateA = parseTaskDateTime(a.dueDate, a.dueTime);
      const dateB = parseTaskDateTime(b.dueDate, b.dueTime);
      return dateA - dateB;
    });

  const tabs = [
    { key: 'slides', label: 'Lecture Slides', icon: Presentation, count: lectureSlides.length, buttonLabel: '+ Add Lecture Slide', type: 'slide' },
    { key: 'notes', label: 'Notes', icon: FileText, count: notes.length, buttonLabel: '+ Add Note', type: 'note' },
    { key: 'assignments', label: 'Assignments', icon: FileText, count: assignments.length, buttonLabel: '+ Add Assignment', type: 'assignment' },
    { key: 'questions', label: 'Previous Questions', icon: HelpCircle, count: previousQuestions.length, buttonLabel: '+ Add Previous Question', type: 'question' },
    { key: 'other', label: 'Other Materials', icon: Folder, count: otherMaterials.length, buttonLabel: '+ Add Material', type: 'other' },
    { key: 'tasks', label: 'Tasks / Deadlines', icon: Calendar, count: allCourseTasks.filter(t => t.status !== 'completed').length, buttonLabel: '+ Add Task', type: 'task' },
  ];

  const currentTabObj = tabs.find(t => t.key === activeTab) || tabs[0];

  const getCurrentTabMaterials = () => {
    let list = [];
    switch (activeTab) {
      case 'slides':
        list = lectureSlides;
        break;
      case 'notes':
        list = notes;
        break;
      case 'assignments':
        list = assignments;
        break;
      case 'questions':
        list = previousQuestions;
        break;
      case 'other':
        list = otherMaterials;
        break;
      default:
        list = [];
    }

    if (!searchFilter.trim()) return list;

    const query = searchFilter.toLowerCase();
    return list.filter(m =>
      m.title.toLowerCase().includes(query) ||
      (m.description && m.description.toLowerCase().includes(query)) ||
      (m.fileName && m.fileName.toLowerCase().includes(query))
    );
  };

  const getFilteredTasks = () => {
    if (!searchFilter.trim()) return courseTasksWithDeadline;
    const query = searchFilter.toLowerCase();
    return courseTasksWithDeadline.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.type.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query))
    );
  };

  const currentMaterials = getCurrentTabMaterials();
  const currentFilteredTasks = getFilteredTasks();

  const handleActionClick = () => {
    if (activeTab === 'tasks') {
      openAddTaskModal(course.id);
    } else {
      openAddMaterialModal(course.id, currentTabObj.type);
    }
  };

  const handleDeleteCourse = () => {
    if (window.confirm(`Are you sure you want to delete "${course.name}" (${course.code}) and all its uploaded materials and tasks?`)) {
      deleteCourse(course.id);
      navigate('/courses');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Visual Breadcrumb navigation (Important UX Requirement: Selected course clearly visible) */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <Link to="/courses" className="hover:text-blue-600 flex items-center gap-1 font-semibold text-slate-600">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>Courses</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
          {course.code} — {course.name}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold">{currentTabObj.label}</span>
      </nav>

      {/* Course Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                {course.code}
              </span>
              <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600">
                {allCourseMaterials.length} {allCourseMaterials.length === 1 ? 'material' : 'materials'}
              </span>
              <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                {allCourseTasks.filter(t => t.status !== 'completed').length} pending {allCourseTasks.filter(t => t.status !== 'completed').length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {course.name}
            </h1>

            {course.description && (
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                {course.description}
              </p>
            )}

            {/* Instructor Info */}
            <div className="flex items-center gap-4 text-xs text-slate-600 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 font-medium">
                <User className="w-4 h-4 text-slate-400" />
                <span>Instructor: <strong>{course.teacher}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleActionClick}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{currentTabObj.buttonLabel}</span>
            </button>

            <button
              onClick={handleDeleteCourse}
              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Delete Course"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Materials / Tasks Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{currentTabObj.label}</span>
              <span className="text-xs text-slate-400 font-normal">
                ({activeTab === 'tasks' ? currentFilteredTasks.length : currentMaterials.length})
              </span>
            </h2>
          </div>

          {/* Search inside this tab */}
          {((activeTab === 'tasks' && allCourseTasks.length > 0) || (activeTab !== 'tasks' && getCurrentTabMaterials().length > 0)) && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={`Search ${currentTabObj.label.toLowerCase()}...`}
                className="w-full pl-8 pr-3 py-1.5 bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
              />
            </div>
          )}
        </div>

        {/* Render for Tasks Tab */}
        {activeTab === 'tasks' ? (
          currentFilteredTasks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                No tasks or deadlines added yet for {course.code}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add assignments, quizzes, presentations, and midterm exam dates to track remaining time dynamically.
              </p>
              <button
                onClick={() => openAddTaskModal(course.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Task</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentFilteredTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )
        ) : (
          /* Render for Material Tabs (Slides, Notes, Assignments, Previous Questions, Other) */
          currentMaterials.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <currentTabObj.icon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                No {currentTabObj.label.toLowerCase()} added yet for {course.code}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your {currentTabObj.label.toLowerCase()} to keep all materials for {course.name} organized.
              </p>
              <button
                onClick={() => openAddMaterialModal(course.id, currentTabObj.type)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{currentTabObj.buttonLabel}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMaterials.map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}


