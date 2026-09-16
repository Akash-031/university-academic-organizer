import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users, Copy, Check, Loader2, AlertCircle, ArrowLeft,
  BookOpen, FileText, CalendarDays, ShieldCheck
} from 'lucide-react';
import { fetchRoomApi, fetchRoomMembersApi } from '../services/roomApi';
import { useAcademic } from '../context/AcademicContext';
import CourseCard from '../components/CourseCard';

export default function RoomDashboard() {
  const { roomId } = useParams();
  const { courses, openAddCourseModal, isLoading: isAcademicLoading } = useAcademic();
  const [room, setRoom] = useState(null);
  const [role, setRole] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const loadRoom = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const [{ room: fetchedRoom, role: fetchedRole }, { members: fetchedMembers }] = await Promise.all([
        fetchRoomApi(roomId),
        fetchRoomMembersApi(roomId),
      ]);
      setRoom(fetchedRoom);
      setRole(fetchedRole);
      setMembers(fetchedMembers || []);
    } catch (err) {
      setError(err.message || 'Failed to load room');
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Loading room...</span>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link to="/rooms" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Rooms
        </Link>
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || 'Room not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/rooms" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to My Rooms
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{room.name}</h1>
            {room.description && <p className="text-xs sm:text-sm text-slate-500 mt-1">{room.description}</p>}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-xs font-mono font-bold text-slate-700 tracking-wider">
              {room.roomCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {role === 'owner' && (
          <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-700">
            <ShieldCheck className="w-3.5 h-3.5" /> You are the Owner
          </div>
        )}
      </div>

      {/* Members */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Members ({members.length})</h2>
        </div>

        <div className="space-y-2">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{member.name}</p>
                <p className="text-xs text-slate-500 truncate">{member.email}</p>
              </div>
              <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                member.role === 'owner' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {member.role === 'owner' ? 'Owner' : 'Member'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder sections for future phase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Room Courses</h2>
          </div>
          <button
            onClick={openAddCourseModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>+ Add Course</span>
          </button>
        </div>
        {isAcademicLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-8 text-center text-xs text-slate-500">
            Loading shared courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-8 text-center">
            <p className="text-xs text-slate-500">No shared courses have been added to this Room yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map(course => <CourseCard key={course.id} course={course} roomId={roomId} />)}
          </div>
        )}
      </div>
    </div>
  );
}
