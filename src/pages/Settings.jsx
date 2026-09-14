import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Building2,
  RotateCcw,
  Save,
  Check,
  Trash2
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';

export default function Settings() {
  const {
    uniInfo,
    setUniInfo,
    resetAllData
  } = useAcademic();

  const [formUni, setFormUni] = useState({ ...uniInfo });
  const [saved, setSaved] = useState(false);
  const [resetMessage, setResetMessage] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUniInfo(formUni);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Clear all your courses and materials? This action cannot be undone.')) {
      resetAllData();
      setResetMessage(true);
      setTimeout(() => {
        window.location.reload();
      }, 400);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-blue-600" />
          <span>Organizer Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your academic profile details or manage your workspace data
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {resetMessage && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-blue-600 animate-spin" />
          <span>Clearing all data...</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Academic Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Student & University Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student Name
              </label>
              <input
                type="text"
                value={formUni.studentName || ''}
                onChange={e => setFormUni({ ...formUni, studentName: e.target.value })}
                placeholder="e.g. Alex Mercer"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Semester
              </label>
              <input
                type="text"
                value={formUni.currentSemester || ''}
                onChange={e => setFormUni({ ...formUni, currentSemester: e.target.value })}
                placeholder="e.g. Fall 2026 / Semester 4"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                University Name
              </label>
              <input
                type="text"
                value={formUni.name || ''}
                onChange={e => setFormUni({ ...formUni, name: e.target.value })}
                placeholder="e.g. Metropolitan State University"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-50 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Clear All Data</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}

