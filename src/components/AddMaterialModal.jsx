import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Presentation,
  HelpCircle,
  Folder,
  Check,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

export default function AddMaterialModal() {
  const {
    isAddMaterialModalOpen,
    closeAddMaterialModal,
    courses,
    addMaterial,
    openAddCourseModal,
    preselectedCourseId,
    preselectedMaterialType
  } = useAcademic();

  const [courseId, setCourseId] = useState('');
  const [type, setType] = useState('slide');
  const [title, setTitle] = useState('');
  const [lectureNumber, setLectureNumber] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [term, setTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAddMaterialModalOpen) {
      if (preselectedCourseId) {
        setCourseId(preselectedCourseId);
      } else if (courses.length > 0) {
        setCourseId(courses[0].id);
      } else {
        setCourseId('');
      }
      if (preselectedMaterialType) {
        setType(preselectedMaterialType);
      }
      setError('');
      setSuccess(false);
    }
  }, [isAddMaterialModalOpen, preselectedCourseId, preselectedMaterialType, courses]);

  if (!isAddMaterialModalOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId) {
      setError('Please select a course or create one first.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }

    await addMaterial({
      courseId,
      type,
      title: title.trim(),
      lectureNumber: type === 'slide' && lectureNumber ? lectureNumber : undefined,
      fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
      fileSize: fileSize || '1.5 MB',
      description: description.trim(),
      dueDate: type === 'assignment' && dueDate ? dueDate : undefined,
      term: type === 'question' && term ? term : undefined,
    });

    setTitle('');
    setLectureNumber('');
    setFileName('');
    setDescription('');
    setDueDate('');
    setTerm('');
    setError('');
    setSuccess(false);
    closeAddMaterialModal();
  };

  // If user has no courses yet
  if (courses.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Presentation className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Courses Added Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            You need to create a course before adding lecture slides or materials.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={closeAddMaterialModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                closeAddMaterialModal();
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
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">
              Add Material {selectedCourse ? `to ${selectedCourse.code}` : ''}
            </h3>
            <p className="text-xs text-slate-400">
              Upload lecture slides, notes, assignments, or previous questions
            </p>
          </div>
          <button
            onClick={closeAddMaterialModal}
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

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Material added successfully!</span>
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

          {/* Material Type Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Material Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: 'slide', label: 'Lecture Slide', icon: Presentation },
                { key: 'note', label: 'Note', icon: FileText },
                { key: 'assignment', label: 'Assignment', icon: FileText },
                { key: 'question', label: 'Previous Question', icon: HelpCircle },
                { key: 'other', label: 'Other Material', icon: Folder },
              ].map(item => {
                const Icon = item.icon;
                const isSelected = type === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setType(item.key)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Lecture Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {type === 'slide' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Lecture Number
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={lectureNumber}
                  onChange={(e) => setLectureNumber(e.target.value)}
                  placeholder="e.g. 05"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            )}

            <div className={type === 'slide' ? 'sm:col-span-2' : 'sm:col-span-3'}>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {type === 'slide' ? 'Lecture Title *' : 'Material Title *'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === 'slide'
                    ? 'e.g. Tree / Introduction to Arrays'
                    : type === 'note'
                    ? 'e.g. Class Summary Note'
                    : type === 'assignment'
                    ? 'e.g. Assignment 01'
                    : type === 'question'
                    ? 'e.g. Midterm Exam 2025'
                    : 'e.g. Course Guidelines'
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                required
              />
            </div>
          </div>

          {/* Specific fields depending on type */}
          {type === 'assignment' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          )}

          {type === 'question' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Exam Term / Year (Optional)
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="e.g. Spring 2025 Midterm / Fall 2024 Final"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          )}

          {/* File Upload Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              File (PDF, PPTX, DOCX, etc.)
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  setFileName(file.name);
                  setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                  if (!title) setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.zip"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                {fileName ? (
                  <div>
                    <p className="text-xs font-bold text-slate-800">{fileName}</p>
                    <p className="text-[11px] text-slate-500">{fileSize} • Click or drop another to replace</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Click to choose file or drag and drop
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PDF, PPTX, DOCX, ZIP (or placeholder file)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Optional Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes or topic summary..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeAddMaterialModal}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              Add Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

