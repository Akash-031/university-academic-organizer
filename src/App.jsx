import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AcademicProvider } from './context/AcademicContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AddCourseModal from './components/AddCourseModal';
import AddMaterialModal from './components/AddMaterialModal';
import TaskModal from './components/TaskModal';
import MaterialViewerModal from './components/MaterialViewerModal';

// Pages
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import LectureSlides from './pages/LectureSlides';
import Assignments from './pages/Assignments';
import PreviousQuestions from './pages/PreviousQuestions';
import CalendarTasks from './pages/CalendarTasks';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyRooms from './pages/MyRooms';
import RoomDashboard from './pages/RoomDashboard';

function AppShell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AcademicProvider>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Main Sidebar */}
        <Sidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
          {/* Top Navigation */}
          <Navbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

          {/* Main Page Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:courseId" element={<CourseDetails />} />
              <Route path="/slides" element={<LectureSlides />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/previous-questions" element={<PreviousQuestions />} />
              <Route path="/calendar" element={<CalendarTasks />} />
              <Route path="/rooms" element={<MyRooms />} />
              <Route path="/rooms/:roomId" element={<RoomDashboard />} />
                            <Route path="/rooms/:roomId/courses/:courseId" element={<CourseDetails />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-400 bg-white/50">
            <p>University Academic Organizer • Student Workspace</p>
          </footer>
        </div>

        {/* Global Modals */}
        <AddCourseModal />
        <AddMaterialModal />
        <TaskModal />
        <MaterialViewerModal />
      </div>
    </AcademicProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

