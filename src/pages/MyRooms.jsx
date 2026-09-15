import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, KeyRound, Loader2, AlertCircle, DoorOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { fetchMyRoomsApi } from '../services/roomApi';
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';

export default function MyRooms() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const loadRooms = useCallback(async () => {
    try {
      setError('');
      const { rooms: fetchedRooms } = await fetchMyRoomsApi();
      setRooms(fetchedRooms || []);
    } catch (err) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleRoomCreated = (room) => {
    setRooms(prev => [room, ...prev.filter(r => r.id !== room.id)]);
    setSuccessMessage(`Room "${room.name}" created successfully!`);
  };

  const handleRoomJoined = (room) => {
    setRooms(prev => [room, ...prev.filter(r => r.id !== room.id)]);
    setSuccessMessage(`You joined "${room.name}" successfully!`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-600" />
            <span>My Rooms</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Private shared workspaces to collaborate with classmates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsJoinOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Join Room</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Room</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading your rooms...</span>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-10 text-center">
          <DoorOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No rooms yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Create a room to start a shared workspace, or join one using a room code from a friend.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col"
            >
              <h3 className="text-sm font-bold text-slate-900 truncate">{room.name}</h3>
              {room.description ? (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{room.description}</p>
              ) : (
                <p className="text-xs text-slate-400 mt-1 italic">No description</p>
              )}

              <div className="flex items-center gap-2 mt-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-mono font-bold text-slate-600 tracking-wider">
                  {room.roomCode}
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[11px] font-bold text-blue-700">
                  <Users className="w-3 h-3" />
                  <span>{room.memberCount ?? '—'} {room.memberCount === 1 ? 'member' : 'members'}</span>
                </div>
              </div>

              <Link
                to={`/rooms/${room.id}`}
                className="mt-4 flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                <span>Open Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleRoomCreated}
      />
      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoined={handleRoomJoined}
      />
    </div>
  );
}
