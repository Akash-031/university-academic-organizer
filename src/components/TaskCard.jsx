import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { formatReadableDate, getTaskDeadlineInfo } from '../utils/taskUtils';

export default function TaskCard({ task, showCourse = false }) {
  const { toggleTaskStatus, openEditTaskModal, deleteTask } = useAcademic();
  const deadline = task.deadlineInfo || getTaskDeadlineInfo(task);
  const isCompleted = task.status === 'completed';

  const getTypeColor = (type) => {
    switch (type) {
      case 'Assignment':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Quiz':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Midterm':
      case 'Final':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      case 'Presentation':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Project':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between group shadow-2xs hover:shadow-md ${
        isCompleted
          ? 'border-slate-200 bg-slate-50/50 opacity-75'
          : deadline.isOverdue
          ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
          : deadline.isToday
          ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400'
          : 'border-slate-200 hover:border-blue-300'
      }`}
    >
      <div>
        {/* Header: Status Pill, Course Badge, Type Tag */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${getTypeColor(task.type)}`}>
              {task.type}
            </span>

            {showCourse && task.courseCode && (
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                {task.courseCode}
              </span>
            )}

            <span className={`text-[11px] px-2.5 py-0.5 rounded-lg border font-semibold ${deadline.badgeClass}`}>
              {deadline.label}
            </span>
          </div>

          {/* Edit / Delete actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => openEditTaskModal(task)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Task"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete task "${task.title}"?`)) {
                  deleteTask(task.id);
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Task Title */}
        <h4 className={`text-sm sm:text-base font-bold transition-colors ${
          isCompleted ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-blue-600'
        }`}>
          {task.title}
        </h4>

        {/* Course Name if showing course */}
        {showCourse && task.courseName && (
          <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-slate-400" />
            <span>{task.courseName}</span>
          </p>
        )}

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-600 mt-2 font-normal line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Date and Time Details */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Due: <strong>{formatReadableDate(task.dueDate)}</strong></span>
          </span>

          {task.dueTime && (
            <span className="flex items-center gap-1 font-medium text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{task.dueTime}</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Mark Complete Action */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={() => toggleTaskStatus(task.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isCompleted
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Completed</span>
            </>
          ) : (
            <>
              <Circle className="w-4 h-4" />
              <span>Mark Complete</span>
            </>
          )}
        </button>

        <span className="text-[11px] text-slate-400">
          {isCompleted ? 'Finished' : deadline.label}
        </span>
      </div>
    </div>
  );
}
