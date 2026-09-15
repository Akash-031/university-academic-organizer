// Room collaboration API client
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api';

async function handle(res, fallbackMessage) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || fallbackMessage);
  }
  return data;
}

export async function fetchMyRoomsApi() {
  const res = await fetch(`${API_BASE}/rooms`, { credentials: 'include' });
  return handle(res, 'Failed to fetch rooms');
}

export async function createRoomApi({ name, description }) {
  const res = await fetch(`${API_BASE}/rooms`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  return handle(res, 'Failed to create room');
}

export async function joinRoomApi(roomCode) {
  const res = await fetch(`${API_BASE}/rooms/join`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode }),
  });
  return handle(res, 'Failed to join room');
}

export async function fetchRoomApi(roomId) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}`, { credentials: 'include' });
  return handle(res, 'Failed to fetch room');
}

export async function fetchRoomMembersApi(roomId) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/members`, { credentials: 'include' });
  return handle(res, 'Failed to fetch room members');
}
