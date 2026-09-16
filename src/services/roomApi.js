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

export async function fetchRoomAcademicApi(roomId) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/academic`, { credentials: 'include' });
  return handle(res, 'Failed to fetch room academic data');
}

export async function createRoomCourseApi(roomId, course) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/courses`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(course),
  });
  return handle(res, 'Failed to create room course');
}

export async function deleteRoomCourseApi(roomId, courseId) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/courses/${courseId}`, { method: 'DELETE', credentials: 'include' });
  return handle(res, 'Failed to delete room course');
}

export async function createRoomMaterialApi(roomId, material) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/materials`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(material),
  });
  return handle(res, 'Failed to create room material');
}

export async function deleteRoomMaterialApi(roomId, materialId) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/materials/${materialId}`, { method: 'DELETE', credentials: 'include' });
  return handle(res, 'Failed to delete room material');
}

export async function createRoomTaskApi(roomId, task) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/tasks`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return handle(res, 'Failed to create room task');
}

export async function updateRoomTaskApi(roomId, taskId, task) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/tasks/${taskId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return handle(res, 'Failed to update room task');
}

export async function deleteRoomTaskApi(roomId, taskId) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/tasks/${taskId}`, { method: 'DELETE', credentials: 'include' });
  return handle(res, 'Failed to delete room task');
}
