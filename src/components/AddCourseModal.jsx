import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, BookOpen, Plus, AlertCircle, Check } from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

export default function AddCourseModal() {
  const { isAddCourseModalOpen, closeAddCourseModal, addCourse, roomId } = useAcademic();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [teacher, setTeacher] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isAddCourseModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a course name (e.g. Data Structures).');
      return;
    }
    if (!code.trim()) {
      setError('Please enter a course code (e.g. CSE214).');
      return;
    }
    if (!teacher.trim()) {
      setError('Please enter the teacher / instructor name.');
      return;
    }

    const created = await addCourse({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      teacher: teacher.trim(),
      description: description.trim()
    });

    setName('');
    setCode('');
    setTeacher('');
    setDescription('');
    setError('');
    setSuccess(false);
    closeAddCourseModal();
    if (created && created.id) {
      navigate(`/courses/${created.id}`);
        navigate(roomId ? `/rooms/${roomId}/courses/${created.id}` : `/courses/${created.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add New Course</h3>
              <p className="text-xs text-slate-400">Create a separate workspace for your course materials</p>
            </div>
          </div>
          <button
            onClick={closeAddCourseModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Course created successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="e.g. Data Structures"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => { setCode(e.target.value); setError(''); }}
                placeholder="e.g. CSE214"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Teacher / Instructor Name *
            </label>
            <input
              type="text"
              required
              value={teacher}
              onChange={e => { setTeacher(e.target.value); setError(''); }}
              placeholder="e.g. ABC Sir / Dr. Robert Vance"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Course Description (Optional)
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Fundamental algorithms, tree traversals, graphs, and Big-O notation..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeAddCourseModal}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
