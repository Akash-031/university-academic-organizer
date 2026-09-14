import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialCourses, initialUniversityInfo } from '../data/courses';
import { initialMaterials } from '../data/materials';
import { initialTasks } from '../data/tasks';
import { parseTaskDateTime, getTaskDeadlineInfo } from '../utils/taskUtils';
import {
  fetchAllAcademicData,
  createCourseApi,
  deleteCourseApi,
  createMaterialApi,
  deleteMaterialApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  updateUniInfoApi,
  migrateLocalDataApi,
  resetAllDataApi
} from '../services/api';

const AcademicContext = createContext();

const STORAGE_KEYS = {
  COURSES: 'uao_user_courses_v2',
  MATERIALS: 'uao_user_materials_v2',
  TASKS: 'uao_user_tasks_v2',
  UNI_INFO: 'uao_user_uni_info_v2',
  MIGRATED: 'uao_data_migrated_v1'
};

const COURSE_COLORS = ['blue', 'purple', 'emerald', 'amber', 'cyan', 'rose', 'indigo'];

export function AcademicProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial local state from localStorage cache
  const [courses, setCourses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
      return saved ? JSON.parse(saved) : initialCourses;
    } catch {
      return initialCourses;
    }
  });

  const [materials, setMaterials] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      return saved ? JSON.parse(saved) : initialMaterials;
    } catch {
      return initialMaterials;
    }
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [uniInfo, setUniInfoState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UNI_INFO);
      return saved ? JSON.parse(saved) : initialUniversityInfo;
    } catch {
      return initialUniversityInfo;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [preselectedCourseId, setPreselectedCourseId] = useState(null);
  const [preselectedMaterialType, setPreselectedMaterialType] = useState('slide');
  const [viewingMaterial, setViewingMaterial] = useState(null);

  // Keep localStorage updated as secondary cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }, [materials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.UNI_INFO, JSON.stringify(uniInfo));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }, [uniInfo]);

  // Load backend data and migrate local storage if needed
  const loadData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      setError(null);
      const data = await fetchAllAcademicData();

      const dbHasData = (data.courses && data.courses.length > 0) ||
                        (data.materials && data.materials.length > 0) ||
                        (data.tasks && data.tasks.length > 0);

      const localHasData = (courses && courses.length > 0) ||
                           (materials && materials.length > 0) ||
                           (tasks && tasks.length > 0);

      // Migration condition: DB is fresh/empty, but user has existing local data
      const needsMigration = isInitial && !dbHasData && localHasData && !localStorage.getItem(STORAGE_KEYS.MIGRATED);

      if (needsMigration) {
        console.log('Migrating local data to database...');
        await migrateLocalDataApi({ courses, materials, tasks, uniInfo });
        localStorage.setItem(STORAGE_KEYS.MIGRATED, 'true');
        const reFetched = await fetchAllAcademicData();
        setCourses(reFetched.courses || []);
        setMaterials(reFetched.materials || []);
        setTasks(reFetched.tasks || []);
        if (reFetched.uniInfo) setUniInfoState(reFetched.uniInfo);
      } else {
        setCourses(data.courses || []);
        setMaterials(data.materials || []);
        setTasks(data.tasks || []);
        if (data.uniInfo) setUniInfoState(data.uniInfo);
      }
    } catch (err) {
      console.error('Backend connection error:', err);
      setError('Working in offline/cached mode. Backend API is unavailable.');
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  // Fetch data on initial mount
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Re-fetch data on window focus to sync cross-tab / cross-device updates
  useEffect(() => {
    const handleFocus = () => {
      loadData(false);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadData]);

  // Uni Info wrapper
  const setUniInfo = async (infoOrFn) => {
    const updated = typeof infoOrFn === 'function' ? infoOrFn(uniInfo) : infoOrFn;
    setUniInfoState(updated);
    try {
      await updateUniInfoApi(updated);
    } catch (err) {
      console.error('Failed to update uni info on server', err);
    }
  };

  // Course actions
  const addCourse = async ({ name, code, teacher, description, color }) => {
    const assignedColor = color || COURSE_COLORS[courses.length % COURSE_COLORS.length];
    const newCourse = {
      id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      teacher: teacher ? teacher.trim() : '',
      description: description ? description.trim() : '',
      color: assignedColor,
      createdAt: new Date().toISOString()
    };

    setCourses(prev => [newCourse, ...prev]);

    try {
      await createCourseApi(newCourse);
    } catch (err) {
      console.error('Failed to create course on server', err);
    }
    return newCourse;
  };

  const deleteCourse = async (courseId) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    setMaterials(prev => prev.filter(m => m.courseId !== courseId));
    setTasks(prev => prev.filter(t => t.courseId !== courseId));

    try {
      await deleteCourseApi(courseId);
    } catch (err) {
      console.error('Failed to delete course on server', err);
    }
  };

  // Material actions
  const addMaterial = async (materialData) => {
    const course = courses.find(c => c.id === materialData.courseId);
    const newMaterial = {
      id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      courseId: materialData.courseId,
      courseCode: course ? course.code : 'COURSE',
      courseName: course ? course.name : 'Course',
      type: materialData.type || 'slide',
      title: materialData.title.trim(),
      lectureNumber: materialData.lectureNumber !== undefined && materialData.lectureNumber !== '' 
        ? parseInt(materialData.lectureNumber, 10) 
        : undefined,
      fileName: materialData.fileName || `${materialData.title.replace(/\s+/g, '_')}.pdf`,
      fileSize: materialData.fileSize || '1.5 MB',
      description: materialData.description ? materialData.description.trim() : '',
      dueDate: materialData.dueDate || undefined,
      term: materialData.term || undefined,
      uploadDate: new Date().toISOString().split('T')[0],
      isRecent: true,
      downloadUrl: '#'
    };

    setMaterials(prev => [newMaterial, ...prev]);

    try {
      await createMaterialApi(newMaterial);
    } catch (err) {
      console.error('Failed to create material on server', err);
    }
    return newMaterial;
  };

  const deleteMaterial = async (materialId) => {
    setMaterials(prev => prev.filter(m => m.id !== materialId));

    try {
      await deleteMaterialApi(materialId);
    } catch (err) {
      console.error('Failed to delete material on server', err);
    }
  };

  // Task / Deadline actions
  const addTask = async (taskData) => {
    const course = courses.find(c => c.id === taskData.courseId);
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      courseId: taskData.courseId,
      courseCode: course ? course.code : 'COURSE',
      courseName: course ? course.name : 'Course',
      title: taskData.title.trim(),
      type: taskData.type || 'Assignment',
      dueDate: taskData.dueDate,
      dueTime: taskData.dueTime ? taskData.dueTime.trim() : '',
      description: taskData.description ? taskData.description.trim() : '',
      status: taskData.status || 'pending',
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [newTask, ...prev]);

    try {
      await createTaskApi(newTask);
    } catch (err) {
      console.error('Failed to create task on server', err);
    }
    return newTask;
  };

  const updateTask = async (taskId, updatedData) => {
    let finalTaskObj = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const course = courses.find(c => c.id === (updatedData.courseId || t.courseId));
        finalTaskObj = {
          ...t,
          ...updatedData,
          courseCode: course ? course.code : t.courseCode,
          courseName: course ? course.name : t.courseName,
        };
        return finalTaskObj;
      }
      return t;
    }));

    try {
      if (finalTaskObj) {
        await updateTaskApi(taskId, finalTaskObj);
      }
    } catch (err) {
      console.error('Failed to update task on server', err);
    }
  };

  const toggleTaskStatus = async (taskId) => {
    let newStatus = 'pending';
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        newStatus = t.status === 'completed' ? 'pending' : 'completed';
        return { ...t, status: newStatus };
      }
      return t;
    }));

    try {
      await updateTaskApi(taskId, { status: newStatus });
    } catch (err) {
      console.error('Failed to toggle task status on server', err);
    }
  };

  const deleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      await deleteTaskApi(taskId);
    } catch (err) {
      console.error('Failed to delete task on server', err);
    }
  };

  const resetAllData = async () => {
    setCourses([]);
    setMaterials([]);
    setTasks([]);
    setUniInfoState(initialUniversityInfo);
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.MATERIALS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.UNI_INFO);
    localStorage.removeItem(STORAGE_KEYS.MIGRATED);

    try {
      await resetAllDataApi();
    } catch (err) {
      console.error('Failed to reset data on server', err);
    }
  };

  // Modal helpers
  const openAddCourseModal = () => {
    setIsAddCourseModalOpen(true);
  };

  const closeAddCourseModal = () => {
    setIsAddCourseModalOpen(false);
  };

  const openAddMaterialModal = (courseId = null, materialType = 'slide') => {
    setPreselectedCourseId(courseId);
    setPreselectedMaterialType(materialType);
    setIsAddMaterialModalOpen(true);
  };

  const closeAddMaterialModal = () => {
    setIsAddMaterialModalOpen(false);
    setPreselectedCourseId(null);
  };

  const openAddTaskModal = (courseId = null) => {
    setPreselectedCourseId(courseId);
    setEditingTask(null);
    setIsAddTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setPreselectedCourseId(task.courseId);
    setIsAddTaskModalOpen(true);
  };

  const closeAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
    setEditingTask(null);
    setPreselectedCourseId(null);
  };

  const openAddModal = openAddMaterialModal;
  const isAddModalOpen = isAddMaterialModalOpen;
  const closeAddModal = closeAddMaterialModal;

  // Getters
  const getCourseById = (courseId) => courses.find(c => c.id === courseId);
  const getMaterialsByCourse = (courseId) => materials.filter(m => m.courseId === courseId);
  const getMaterialsByCourseAndType = (courseId, type) => {
    const list = materials.filter(m => m.courseId === courseId && m.type === type);
    if (type === 'slide') {
      return list.sort((a, b) => (a.lectureNumber || 999) - (b.lectureNumber || 999));
    }
    return list.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  };

  const getTasksByCourse = (courseId) => {
    return tasks.filter(t => t.courseId === courseId);
  };

  // Global Task Categories & Sorters
  const now = new Date();

  const classifiedTasks = tasks.map(task => ({
    ...task,
    deadlineInfo: getTaskDeadlineInfo(task, now)
  }));

  const overdueTasks = classifiedTasks
    .filter(t => t.status !== 'completed' && t.deadlineInfo.isOverdue)
    .sort((a, b) => {
      const dateA = parseTaskDateTime(a.dueDate, a.dueTime);
      const dateB = parseTaskDateTime(b.dueDate, b.dueTime);
      return dateB - dateA;
    });

  const upcomingTasks = classifiedTasks
    .filter(t => t.status !== 'completed' && !t.deadlineInfo.isOverdue)
    .sort((a, b) => {
      const dateA = parseTaskDateTime(a.dueDate, a.dueTime);
      const dateB = parseTaskDateTime(b.dueDate, b.dueTime);
      return dateA - dateB;
    });

  const completedTasks = classifiedTasks
    .filter(t => t.status === 'completed')
    .sort((a, b) => {
      const dateA = parseTaskDateTime(a.dueDate, a.dueTime);
      const dateB = parseTaskDateTime(b.dueDate, b.dueTime);
      return dateB - dateA;
    });

  const pendingTasks = classifiedTasks.filter(t => t.status !== 'completed');
  const nextDeadlineTask = upcomingTasks.length > 0 ? upcomingTasks[0] : null;

  return (
    <AcademicContext.Provider
      value={{
        isLoading,
        error,
        refreshData: () => loadData(false),
        courses,
        materials,
        tasks,
        uniInfo,
        setUniInfo,
        searchQuery,
        setSearchQuery,
        // Course Modals & CRUD
        isAddCourseModalOpen,
        openAddCourseModal,
        closeAddCourseModal,
        addCourse,
        deleteCourse,
        // Material Modals & CRUD
        isAddMaterialModalOpen,
        isAddModalOpen,
        preselectedCourseId,
        preselectedMaterialType,
        openAddMaterialModal,
        openAddModal,
        closeAddMaterialModal,
        closeAddModal,
        addMaterial,
        deleteMaterial,
        viewingMaterial,
        setViewingMaterial,
        // Task Modals & CRUD
        isAddTaskModalOpen,
        editingTask,
        openAddTaskModal,
        openEditTaskModal,
        closeAddTaskModal,
        addTask,
        updateTask,
        toggleTaskStatus,
        deleteTask,
        // Task Categorized collections & stats
        classifiedTasks,
        upcomingTasks,
        overdueTasks,
        completedTasks,
        pendingTasks,
        nextDeadlineTask,
        // Helpers
        getCourseById,
        getMaterialsByCourse,
        getMaterialsByCourseAndType,
        getTasksByCourse,
        resetAllData,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
}


