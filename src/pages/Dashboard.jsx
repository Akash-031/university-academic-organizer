import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Presentation,
  FileText,
  PlusCircle,
  ArrowRight,
  Layers,
  GraduationCap,
  FolderPlus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import DashboardCard from '../components/DashboardCard';
import CourseCard from '../components/CourseCard';
import TaskCard from '../components/TaskCard';
import { formatReadableDate } from '../utils/taskUtils';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    isLoading,
    error,
    courses,
    materials,
    tasks,
    pendingTasks,
    upcomingTasks,
    overdueTasks,
    completedTasks,
    nextDeadlineTask,
    openAddCourseModal,
    openAddMaterialModal,
    openAddTaskModal,
    setViewingMaterial
  } = useAcademic();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Loading your academic organizer...</p>
      </div>
    );
  }

  const totalCourses = courses.length;
  const slideMaterials = materials.filter(m => m.type === 'slide');
  const totalSlides = slideMaterials.length;
  const totalMaterials = materials.length;

  // If user hasn't added any courses yet -> Friendly Empty State
  if (totalCourses === 0) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-4">
        {/* Empty State Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto text-white shadow-md border border-white/20">
              <GraduationCap className="w-9 h-9" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome to your Academic Organizer
            </h1>

            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              You haven't added any courses yet. Create your first course to begin organizing lecture slides, class notes, assignments, and past question papers in one place.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={openAddCourseModal}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100 rounded-xl text-sm font-bold shadow-lg transition-all group"
              >
                <PlusCircle className="w-5 h-5 text-blue-600 transition-transform group-hover:scale-110" />
                <span>+ Add Your First Course</span>
              </button>
            </div>
          </div>
        </div>

        {/* How It Works Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base mb-3">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-800">Create Courses</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Add your current semester courses with course code, name, and instructor.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base mb-3">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-800">Organize Materials</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Upload lecture slides by number, notes, homework assignments, and past exam papers per course.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base mb-3">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-800">Track Deadlines & Tasks</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Stay ahead of upcoming quizzes, assignments, presentations, and midterm exam dates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active Dashboard when courses exist
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 border border-white/20">
                <GraduationCap className="w-3.5 h-3.5" />
                Academic Organizer
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Academic Dashboard
            </h1>
            <p className="text-blue-100/90 text-xs sm:text-sm mt-1.5 max-w-2xl font-normal leading-relaxed">
              Track upcoming deadlines across all courses and access your study files in one organized workspace.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => openAddTaskModal()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>+ Add Task</span>
            </button>

            <button
              onClick={openAddCourseModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white rounded-xl text-xs font-bold border border-white/20 backdrop-blur-xs transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Course</span>
            </button>

            <button
              onClick={() => openAddMaterialModal()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100 rounded-xl text-xs font-bold shadow-md transition-all group"
            >
              <PlusCircle className="w-4 h-4 text-blue-600 transition-transform group-hover:scale-110" />
              <span>Add Material</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <DashboardCard
          title="Courses"
          value={totalCourses}
          subtitle="Enrolled folders"
          icon={BookOpen}
          color="blue"
          onClick={() => navigate('/courses')}
        />

        <DashboardCard
          title="Pending"
          value={pendingTasks.length}
          subtitle="Active tasks"
          icon={Clock}
          color="amber"
          onClick={() => navigate('/calendar')}
        />

        <DashboardCard
          title="Upcoming"
          value={upcomingTasks.length}
          subtitle="Future deadlines"
          icon={CalendarDays}
          color="blue"
          onClick={() => navigate('/calendar')}
        />

        <DashboardCard
          title="Overdue"
          value={overdueTasks.length}
          subtitle="Past due"
          icon={AlertTriangle}
          color="rose"
          onClick={() => navigate('/calendar')}
        />

        <DashboardCard
          title="Completed"
          value={completedTasks.length}
          subtitle="Finished tasks"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/calendar')}
        />

        <DashboardCard
          title="Slides"
          value={totalSlides}
          subtitle="Lecture decks"
          icon={Presentation}
          color="purple"
          onClick={() => navigate('/slides')}
        />
      </div>

      {/* NEXT DEADLINE PROMINENT PREVIEW */}
      {nextDeadlineTask && (
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  NEXT DEADLINE
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/20 text-xs font-bold backdrop-blur-xs">
                  {nextDeadlineTask.courseCode}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
                  {nextDeadlineTask.type}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {nextDeadlineTask.title}
              </h2>

              <p className="text-amber-100 text-xs sm:text-sm flex items-center gap-3 flex-wrap">
                <span>Course: <strong>{nextDeadlineTask.courseName}</strong></span>
                <span>•</span>
                <span>Due: <strong>{formatReadableDate(nextDeadlineTask.dueDate)} {nextDeadlineTask.dueTime ? `at ${nextDeadlineTask.dueTime}` : ''}</strong></span>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/30 text-center">
                <p className="text-xs font-semibold uppercase text-amber-100">Time Status</p>
                <p className="text-base font-extrabold text-white">{nextDeadlineTask.deadlineInfo.label}</p>
              </div>

              <button
                onClick={() => navigate(`/courses/${nextDeadlineTask.courseId}`)}
                className="px-4 py-3 bg-white text-orange-600 hover:bg-amber-50 rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                View Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERDUE TASKS SECTION (Shown only when overdue tasks exist) */}
      {overdueTasks.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-rose-900 tracking-tight flex items-center gap-2">
                  <span>Overdue Tasks ({overdueTasks.length})</span>
                </h2>
                <p className="text-xs text-rose-600">
                  These tasks have passed their due dates and need your attention
                </p>
              </div>
            </div>

            <Link
              to="/calendar"
              className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdueTasks.map(task => (
              <TaskCard key={task.id} task={task} showCourse={true} />
            ))}
          </div>
        </div>
      )}

      {/* UPCOMING TASKS (Cross-course, sorted by nearest deadline) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <span>Upcoming Tasks & Deadlines ({upcomingTasks.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Collected from all your courses, sorted with the nearest deadline first
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openAddTaskModal()}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>+ Add Task</span>
            </button>
            <Link
              to="/calendar"
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <span>View All ({tasks.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {upcomingTasks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-2 shadow-2xs">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Upcoming Tasks</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add a task from any course to start tracking your homework, quizzes, and exams.
            </p>
            <button
              onClick={() => openAddTaskModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Task</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingTasks.slice(0, 6).map(task => (
              <TaskCard key={task.id} task={task} showCourse={true} />
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED TASKS (Collapsed or preview) */}
      {completedTasks.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-800">
                Completed Tasks ({completedTasks.length})
              </h2>
            </div>
            <Link to="/calendar" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
              View All Completed →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTasks.slice(0, 3).map(task => (
              <TaskCard key={task.id} task={task} showCourse={true} />
            ))}
          </div>
        </div>
      )}

      {/* Courses Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Your Courses ({totalCourses})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any course card to access its lecture slides, notes, assignments, and exam questions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAddCourseModal}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              <span>+ Add Course</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}


