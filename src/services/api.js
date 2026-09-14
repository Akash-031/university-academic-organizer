// Base URL resolved dynamically from environment variables or relative fallback
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') + '/api';

export async function fetchAllAcademicData() {
  try {
    const res = await fetch(`${API_BASE}/academic/all`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load academic data from server`);
    return await res.json();
  } catch (err) {
    console.error('fetchAllAcademicData error:', err);
    throw err;
  }
}

export async function createCourseApi(courseData) {
  try {
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to create course`);
    return await res.json();
  } catch (err) {
    console.error('createCourseApi error:', err);
    throw err;
  }
}

export async function updateCourseApi(id, courseData) {
  try {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update course`);
    return await res.json();
  } catch (err) {
    console.error('updateCourseApi error:', err);
    throw err;
  }
}

export async function deleteCourseApi(id) {
  try {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to delete course`);
    return await res.json();
  } catch (err) {
    console.error('deleteCourseApi error:', err);
    throw err;
  }
}

export async function createMaterialApi(materialData) {
  try {
    const res = await fetch(`${API_BASE}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(materialData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to create material`);
    return await res.json();
  } catch (err) {
    console.error('createMaterialApi error:', err);
    throw err;
  }
}

export async function deleteMaterialApi(id) {
  try {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to delete material`);
    return await res.json();
  } catch (err) {
    console.error('deleteMaterialApi error:', err);
    throw err;
  }
}

export async function createTaskApi(taskData) {
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to create task`);
    return await res.json();
  } catch (err) {
    console.error('createTaskApi error:', err);
    throw err;
  }
}

export async function updateTaskApi(id, taskData) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update task`);
    return await res.json();
  } catch (err) {
    console.error('updateTaskApi error:', err);
    throw err;
  }
}

export async function deleteTaskApi(id) {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to delete task`);
    return await res.json();
  } catch (err) {
    console.error('deleteTaskApi error:', err);
    throw err;
  }
}

export async function updateUniInfoApi(uniInfoData) {
  try {
    const res = await fetch(`${API_BASE}/uni-info`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(uniInfoData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update university info`);
    return await res.json();
  } catch (err) {
    console.error('updateUniInfoApi error:', err);
    throw err;
  }
}

export async function migrateLocalDataApi(data) {
  try {
    const res = await fetch(`${API_BASE}/migrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to migrate local data`);
    return await res.json();
  } catch (err) {
    console.error('migrateLocalDataApi error:', err);
    throw err;
  }
}

export async function resetAllDataApi() {
  try {
    const res = await fetch(`${API_BASE}/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to reset backend data`);
    return await res.json();
  } catch (err) {
    console.error('resetAllDataApi error:', err);
    throw err;
  }
}
