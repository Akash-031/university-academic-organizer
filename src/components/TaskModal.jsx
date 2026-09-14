import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  BookOpen,
  Tag
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

export default function TaskModal() {
  const {
    isAddTaskModalOpen,
    editingTask,
    closeAddTaskModal,
    courses,
    addTask,
    updateTask,
    openAddCourseModal,
    preselectedCourseId
  } = useAcademic();

  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Assignment');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');

  const TASK_TYPES = [
    'Assignment',
    'Quiz',
    'Presentation',
    'Midterm',
    'Final',
    'Project',
    'Other'
  ];

  useEffect(() => {
    if (isAddTaskModalOpen) {
      if (editingTask) {
        setCourseId(editingTask.courseId);
        setTitle(editingTask.title);
        setType(editingTask.type || 'Assignment');
        setDueDate(editingTask.dueDate || '');
        setDueTime(editingTask.dueTime || '');
        setDescription(editingTask.description || '');
        setStatus(editingTask.status || 'pending');
      } else {
        setCourseId(preselectedCourseId || (courses.length > 0 ? courses[0].id : ''));
        setTitle('');
        setType('Assignment');
        // Default due date to today or empty
        const todayStr = new Date().toISOString().split('T')[0];
        setDueDate(todayStr);
        setDueTime('11:59 PM');
        setDescription('');
        setStatus('pending');
      }
      setError('');
    }
  }, [isAddTaskModalOpen, editingTask, preselectedCourseId, courses]);

  if (!isAddTaskModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId) {
      setError('Please select a course for this task.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }
    if (!dueDate) {
      setError('Please choose a due date.');
      return;
    }

    if (editingTask) {
      await updateTask(editingTask.id, {
        courseId,
        title: title.trim(),
        type,
        dueDate,
        dueTime: dueTime.trim(),
        description: description.trim(),
        status,
      });
    } else {
      await addTask({
        courseId,
        title: title.trim(),
        type,
        dueDate,
        dueTime: dueTime.trim(),
        description: description.trim(),
        status,
      });
    }

    closeAddTaskModal();
  };

  // If user has no courses
  if (courses.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Courses Added Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            You need to create a course before adding tasks and deadlines.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={closeAddTaskModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                closeAddTaskModal();
                openAddCourseModal();
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course First</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedCourse = courses.find(c => c.id === courseId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {editingTask ? 'Edit Task / Deadline' : `Add Task to ${selectedCourse ? selectedCourse.code : 'Course'}`}
              </h3>
              <p className="text-xs text-slate-400">
                Track assignments, quizzes, presentations, and exams
              </p>
            </div>
          </div>
          <button
            onClick={closeAddTaskModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Course Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Course *
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              required
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              placeholder="e.g. Data Structures Assignment 2 / Midterm Exam"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              autoFocus
            />
          </div>

          {/* Task Type Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {TASK_TYPES.map(t => {
                const isSelected = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Due Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Due Time (Optional)
              </label>
              <input
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                placeholder="e.g. 11:59 PM or 02:00 PM"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Instructions (Optional)
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Complete questions 1-5 from textbook chapter 4..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
            />
          </div>

          {/* Status radio (Pending vs Completed) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100">
                <input
                  type="radio"
                  name="task-status"
                  value="pending"
                  checked={status === 'pending'}
                  onChange={() => setStatus('pending')}
                  className="text-blue-600"
                />
                <span>Pending</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100">
                <input
                  type="radio"
                  name="task-status"
                  value="completed"
                  checked={status === 'completed'}
                  onChange={() => setStatus('completed')}
                  className="text-emerald-600"
                />
                <span>Completed</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeAddTaskModal}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              {editingTask ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingTask ? 'Save Changes' : 'Add Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
