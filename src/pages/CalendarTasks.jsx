import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import TaskCard from '../components/TaskCard';

export default function CalendarTasks() {
  const {
    tasks,
    courses,
    upcomingTasks,
    overdueTasks,
    completedTasks,
    openAddTaskModal
  } = useAcademic();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'upcoming' | 'overdue' | 'completed'
  const [selectedCourseId, setSelectedCourseId] = useState('ALL');
  const [search, setSearch] = useState('');

  const getFilteredList = () => {
    let list = [];
    if (activeFilter === 'upcoming') list = upcomingTasks;
    else if (activeFilter === 'overdue') list = overdueTasks;
    else if (activeFilter === 'completed') list = completedTasks;
    else list = [...overdueTasks, ...upcomingTasks, ...completedTasks];

    return list.filter(task => {
      const matchesCourse = selectedCourseId === 'ALL' || task.courseId === selectedCourseId;
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.type.toLowerCase().includes(search.toLowerCase()) ||
        (task.courseCode && task.courseCode.toLowerCase().includes(search.toLowerCase())) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
      return matchesCourse && matchesSearch;
    });
  };

  const displayTasks = getFilteredList();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <CalendarDays className="w-7 h-7 text-blue-600" />
            <span>Academic Tasks & Deadlines</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track all your assignments, quizzes, presentations, projects, and exams sorted dynamically by deadline
          </p>
        </div>

        <button
          onClick={() => openAddTaskModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Task / Deadline</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Tasks ({tasks.length})
            </button>

            <button
              onClick={() => setActiveFilter('upcoming')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeFilter === 'upcoming'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Upcoming ({upcomingTasks.length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('overdue')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeFilter === 'overdue'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : overdueTasks.length > 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Overdue ({overdueTasks.length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed ({completedTasks.length})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks by title, course, or type..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Course Filter Pills */}
        {courses.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
            <button
              onClick={() => setSelectedCourseId('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCourseId === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Courses
            </button>
            {courses.map(course => {
              const count = tasks.filter(t => t.courseId === course.id && t.status !== 'completed').length;
              return (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCourseId === course.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {course.code} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Grid */}
      {displayTasks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-xl mx-auto space-y-3 shadow-2xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {activeFilter === 'overdue'
              ? 'No overdue tasks — Great job staying on track!'
              : activeFilter === 'completed'
              ? 'No completed tasks yet.'
              : activeFilter === 'upcoming'
              ? 'No upcoming tasks found.'
              : 'No tasks added yet.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {courses.length === 0
              ? 'Create a course first to begin tracking academic deadlines.'
              : 'Add homework, quizzes, presentations, and exam dates to monitor remaining time.'}
          </p>
          <button
            onClick={() => openAddTaskModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Task</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayTasks.map(task => (
            <TaskCard key={task.id} task={task} showCourse={true} />
          ))}
        </div>
      )}
    </div>
  );
}

