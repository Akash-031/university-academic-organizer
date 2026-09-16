import { getSupabaseClient } from '../supabase.js';

function throwIfError(error, operation) {
  if (error) {
    throw new Error(`Supabase ${operation} failed: ${error.message}`);
  }
}

function toCourse(row) {
  return row && {
    id: row.id,
    roomId: row.room_id || null,
    name: row.name,
    code: row.code,
    teacher: row.teacher,
    description: row.description,
    color: row.color,
    createdAt: row.created_at,
  };
}

function toMaterial(row) {
  return row && {
    id: row.id,
    courseId: row.course_id,
    courseCode: row.course_code,
    courseName: row.course_name,
    type: row.type,
    title: row.title,
    lectureNumber: row.lecture_number ?? undefined,
    fileName: row.file_name,
    fileSize: row.file_size,
    description: row.description,
    dueDate: row.due_date,
    term: row.term,
    uploadDate: row.upload_date,
    isRecent: Boolean(row.is_recent),
    downloadUrl: row.download_url,
  };
}

function toTask(row) {
  return row && {
    id: row.id,
    courseId: row.course_id,
    courseCode: row.course_code,
    courseName: row.course_name,
    title: row.title,
    type: row.type,
    dueDate: row.due_date,
    dueTime: row.due_time,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
  };
}

function toUniInfo(row) {
  return row && {
    name: row.name,
    currentSemester: row.current_semester,
    studentName: row.student_name,
  };
}

function courseRecord(course) {
  return {
    id: course.id,
    name: course.name,
    code: course.code,
    teacher: course.teacher || '',
    description: course.description || '',
    color: course.color,
    created_at: course.createdAt || new Date().toISOString(),
  };
}

function materialRecord(material) {
  return {
    id: material.id,
    course_id: material.courseId,
    course_code: material.courseCode || '',
    course_name: material.courseName || '',
    type: material.type,
    title: material.title,
    lecture_number: material.lectureNumber !== undefined && material.lectureNumber !== '' ? Number(material.lectureNumber) : null,
    file_name: material.fileName || '',
    file_size: material.fileSize || '',
    description: material.description || '',
    due_date: material.dueDate || null,
    term: material.term || null,
    upload_date: material.uploadDate || new Date().toISOString().split('T')[0],
    is_recent: material.isRecent !== false,
    download_url: material.downloadUrl || '#',
  };
}

function taskRecord(task) {
  return {
    id: task.id,
    course_id: task.courseId,
    course_code: task.courseCode || '',
    course_name: task.courseName || '',
    title: task.title,
    type: task.type || 'Assignment',
    due_date: task.dueDate || '',
    due_time: task.dueTime || '',
    description: task.description || '',
    status: task.status || 'pending',
    created_at: task.createdAt || new Date().toISOString(),
  };
}

export function createAcademicRepository() {
  const supabase = getSupabaseClient();

  async function requireRoomMember(roomId, userId) {
    const result = await supabase
      .from('room_members')
      .select('role')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .maybeSingle();
    throwIfError(result.error, 'checking room membership');
    if (!result.data) {
      const error = new Error('You are not a member of this room');
      error.code = 'ROOM_FORBIDDEN';
      throw error;
    }
    return result.data.role;
  }

  async function getRoomCourse(roomId, courseId) {
    const result = await supabase.from('courses').select('*').eq('id', courseId).eq('room_id', roomId).maybeSingle();
    throwIfError(result.error, 'finding room course');
    return result.data;
  }

  async function requireRoomCourse(roomId, courseId, userId) {
    await requireRoomMember(roomId, userId);
    const course = await getRoomCourse(roomId, courseId);
    if (!course) {
      const error = new Error('Room course not found');
      error.code = 'ROOM_COURSE_NOT_FOUND';
      throw error;
    }
    return course;
  }

  async function getGlobalCourseIds() {
    const result = await supabase.from('courses').select('id').is('room_id', null);
    throwIfError(result.error, 'finding global courses');
    return result.data.map(course => course.id);
  }

  async function getRoomCourseIds(roomId) {
    const result = await supabase.from('courses').select('id').eq('room_id', roomId);
    throwIfError(result.error, 'finding room courses');
    return result.data.map(course => course.id);
  }

  async function requireGlobalCourse(courseId) {
    const result = await supabase.from('courses').select('*').eq('id', courseId).is('room_id', null).maybeSingle();
    throwIfError(result.error, 'finding global course');
    if (!result.data) {
      const error = new Error('Course not found');
      error.code = 'COURSE_NOT_FOUND';
      throw error;
    }
    return result.data;
  }

  return {
    async getAll() {
      const [coursesResult, uniInfoResult] = await Promise.all([
        supabase.from('courses').select('*').is('room_id', null).order('created_at', { ascending: false }),
        supabase.from('uni_info').select('*').eq('id', 'main').maybeSingle(),
      ]);
      throwIfError(coursesResult.error, 'fetching courses');
      throwIfError(uniInfoResult.error, 'fetching university information');
      const courseIds = coursesResult.data.map(course => course.id);
      const [materialsResult, tasksResult] = courseIds.length === 0
        ? [{ data: [], error: null }, { data: [], error: null }]
        : await Promise.all([
          supabase.from('materials').select('*').in('course_id', courseIds).order('upload_date', { ascending: false }),
          supabase.from('tasks').select('*').in('course_id', courseIds).order('created_at', { ascending: false }),
        ]);
      throwIfError(materialsResult.error, 'fetching materials');
      throwIfError(tasksResult.error, 'fetching tasks');
      return {
        courses: coursesResult.data.map(toCourse),
        materials: materialsResult.data.map(toMaterial),
        tasks: tasksResult.data.map(toTask),
        uniInfo: toUniInfo(uniInfoResult.data),
      };
    },

    async getCourses() {
      const result = await supabase.from('courses').select('*').is('room_id', null).order('created_at', { ascending: false });
      throwIfError(result.error, 'fetching courses');
      return result.data.map(toCourse);
    },

    async createCourse(course) {
      const result = await supabase.from('courses').insert(courseRecord(course)).select().single();
      throwIfError(result.error, 'creating course');
      return toCourse(result.data);
    },

    async updateCourse(id, course) {
      const existingResult = await supabase.from('courses').select('*').eq('id', id).is('room_id', null).maybeSingle();
      throwIfError(existingResult.error, 'finding course');
      if (!existingResult.data) return null;

      const existing = toCourse(existingResult.data);
      const result = await supabase.from('courses').update(courseRecord({ ...existing, ...course, id })).eq('id', id).select().single();
      throwIfError(result.error, 'updating course');
      return toCourse(result.data);
    },

    async deleteCourse(id) {
      const result = await supabase.from('courses').delete().eq('id', id).is('room_id', null);
      throwIfError(result.error, 'deleting course');
    },

    async getMaterials() {
      const courseIds = await getGlobalCourseIds();
      if (courseIds.length === 0) return [];
      const result = await supabase.from('materials').select('*').in('course_id', courseIds).order('upload_date', { ascending: false });
      throwIfError(result.error, 'fetching materials');
      return result.data.map(toMaterial);
    },

    async createMaterial(material) {
      await requireGlobalCourse(material.courseId);
      const result = await supabase.from('materials').insert(materialRecord(material)).select().single();
      throwIfError(result.error, 'creating material');
      return toMaterial(result.data);
    },

    async deleteMaterial(id) {
      const courseIds = await getGlobalCourseIds();
      if (courseIds.length === 0) return;
      const result = await supabase.from('materials').delete().eq('id', id).in('course_id', courseIds);
      throwIfError(result.error, 'deleting material');
    },

    async getTasks() {
      const courseIds = await getGlobalCourseIds();
      if (courseIds.length === 0) return [];
      const result = await supabase.from('tasks').select('*').in('course_id', courseIds).order('created_at', { ascending: false });
      throwIfError(result.error, 'fetching tasks');
      return result.data.map(toTask);
    },

    async createTask(task) {
      await requireGlobalCourse(task.courseId);
      const result = await supabase.from('tasks').insert(taskRecord(task)).select().single();
      throwIfError(result.error, 'creating task');
      return toTask(result.data);
    },

    async updateTask(id, updates) {
      const courseIds = await getGlobalCourseIds();
      if (courseIds.length === 0) return null;
      const existingResult = await supabase.from('tasks').select('*').eq('id', id).in('course_id', courseIds).maybeSingle();
      throwIfError(existingResult.error, 'finding task');
      if (!existingResult.data) return null;

      const existing = toTask(existingResult.data);
      if (updates.courseId) await requireGlobalCourse(updates.courseId);
      const result = await supabase.from('tasks').update(taskRecord({ ...existing, ...updates, id })).eq('id', id).select().single();
      throwIfError(result.error, 'updating task');
      return toTask(result.data);
    },

    async deleteTask(id) {
      const courseIds = await getGlobalCourseIds();
      if (courseIds.length === 0) return;
      const result = await supabase.from('tasks').delete().eq('id', id).in('course_id', courseIds);
      throwIfError(result.error, 'deleting task');
    },

    async getUniInfo() {
      const result = await supabase.from('uni_info').select('*').eq('id', 'main').maybeSingle();
      throwIfError(result.error, 'fetching university information');
      return toUniInfo(result.data) || {};
    },

    async updateUniInfo(uniInfo) {
      const result = await supabase.from('uni_info').upsert({
        id: 'main',
        name: uniInfo.name,
        current_semester: uniInfo.currentSemester,
        student_name: uniInfo.studentName,
      }, { onConflict: 'id' }).select().single();
      throwIfError(result.error, 'updating university information');
      return toUniInfo(result.data);
    },

    async migrate(data) {
      const courses = (data.courses || []).map(courseRecord);
      const materials = (data.materials || []).map(materialRecord);
      const tasks = (data.tasks || []).map(taskRecord);

      if (courses.length) {
        const result = await supabase.from('courses').upsert(courses, { onConflict: 'id', ignoreDuplicates: true });
        throwIfError(result.error, 'migrating courses');
      }
      if (materials.length) {
        const result = await supabase.from('materials').upsert(materials, { onConflict: 'id', ignoreDuplicates: true });
        throwIfError(result.error, 'migrating materials');
      }
      if (tasks.length) {
        const result = await supabase.from('tasks').upsert(tasks, { onConflict: 'id', ignoreDuplicates: true });
        throwIfError(result.error, 'migrating tasks');
      }
      if (data.uniInfo) {
        await this.updateUniInfo({
          name: data.uniInfo.name || 'Academic Organizer',
          currentSemester: data.uniInfo.currentSemester || 'Semester',
          studentName: data.uniInfo.studentName || 'Student',
        });
      }
    },

    async reset() {
      const courseIds = await getGlobalCourseIds();
      if (courseIds.length > 0) {
        for (const table of ['materials', 'tasks']) {
          const result = await supabase.from(table).delete().in('course_id', courseIds);
          throwIfError(result.error, `resetting ${table}`);
        }
      }
      const coursesResult = await supabase.from('courses').delete().is('room_id', null);
      throwIfError(coursesResult.error, 'resetting courses');

      if (courseIds.length === 0) {
        return this.updateUniInfo({
          name: 'Academic Organizer',
          currentSemester: 'Semester',
          studentName: 'Student',
        });
      }
      await this.updateUniInfo({
        name: 'Academic Organizer',
        currentSemester: 'Semester',
        studentName: 'Student',
      });
    },

    async getRoomAcademic(roomId, userId) {
      await requireRoomMember(roomId, userId);
      const coursesResult = await supabase.from('courses').select('*').eq('room_id', roomId).order('created_at', { ascending: false });
      throwIfError(coursesResult.error, 'fetching room courses');
      const courseIds = coursesResult.data.map(course => course.id);
      if (courseIds.length === 0) return { courses: [], materials: [], tasks: [] };

      const [materialsResult, tasksResult] = await Promise.all([
        supabase.from('materials').select('*').in('course_id', courseIds).order('upload_date', { ascending: false }),
        supabase.from('tasks').select('*').in('course_id', courseIds).order('created_at', { ascending: false }),
      ]);
      throwIfError(materialsResult.error, 'fetching room materials');
      throwIfError(tasksResult.error, 'fetching room tasks');
      return {
        courses: coursesResult.data.map(toCourse),
        materials: materialsResult.data.map(toMaterial),
        tasks: tasksResult.data.map(toTask),
      };
    },

    async createRoomCourse(roomId, userId, course) {
      await requireRoomMember(roomId, userId);
      const result = await supabase.from('courses').insert({ ...courseRecord(course), room_id: roomId }).select().single();
      throwIfError(result.error, 'creating room course');
      return toCourse(result.data);
    },

    async deleteRoomCourse(roomId, courseId, userId) {
      await requireRoomCourse(roomId, courseId, userId);
      const result = await supabase.from('courses').delete().eq('id', courseId).eq('room_id', roomId);
      throwIfError(result.error, 'deleting room course');
    },

    async createRoomMaterial(roomId, userId, material) {
      await requireRoomCourse(roomId, material.courseId, userId);
      const result = await supabase.from('materials').insert(materialRecord(material)).select().single();
      throwIfError(result.error, 'creating room material');
      return toMaterial(result.data);
    },

    async deleteRoomMaterial(roomId, userId, materialId) {
      await requireRoomMember(roomId, userId);
      const courseIds = await getRoomCourseIds(roomId);
      if (courseIds.length === 0) return;
      const result = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId)
        .in('course_id', courseIds);
      throwIfError(result.error, 'deleting room material');
    },

    async createRoomTask(roomId, userId, task) {
      await requireRoomCourse(roomId, task.courseId, userId);
      const result = await supabase.from('tasks').insert(taskRecord(task)).select().single();
      throwIfError(result.error, 'creating room task');
      return toTask(result.data);
    },

    async updateRoomTask(roomId, userId, taskId, updates) {
      await requireRoomMember(roomId, userId);
      const roomCourses = await supabase.from('courses').select('id').eq('room_id', roomId);
      throwIfError(roomCourses.error, 'finding room courses');
      const courseIds = roomCourses.data.map(course => course.id);
      const existingResult = await supabase.from('tasks').select('*').eq('id', taskId).in('course_id', courseIds).maybeSingle();
      throwIfError(existingResult.error, 'finding room task');
      if (!existingResult.data) return null;
      const existing = toTask(existingResult.data);
      await requireRoomCourse(roomId, updates.courseId || existing.courseId, userId);
      const result = await supabase.from('tasks').update(taskRecord({ ...existing, ...updates, id: taskId })).eq('id', taskId).select().single();
      throwIfError(result.error, 'updating room task');
      return toTask(result.data);
    },

    async deleteRoomTask(roomId, userId, taskId) {
      await requireRoomMember(roomId, userId);
      const courseIds = await getRoomCourseIds(roomId);
      if (courseIds.length === 0) return;
      const result = await supabase.from('tasks').delete().eq('id', taskId).in('course_id', courseIds);
      throwIfError(result.error, 'deleting room task');
    },
  };
}