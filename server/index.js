import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration based on environment variable or permissive fallback
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : '*';

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins === '*' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive CORS for cross-device web clients
    }
  },
  credentials: true
}));

app.use(express.json());

// Serve static frontend build files when deployed as unified app
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Helper function to format material boolean/number fields correctly
function formatMaterial(row) {
  if (!row) return null;
  return {
    ...row,
    isRecent: Boolean(row.isRecent),
    lectureNumber: row.lectureNumber !== null && row.lectureNumber !== undefined ? Number(row.lectureNumber) : undefined
  };
}

// -------------------------------------------------------------
// GET ALL ACADEMIC DATA (Initial Load)
// -------------------------------------------------------------
app.get('/api/academic/all', (req, res) => {
  try {
    const courses = db.prepare('SELECT * FROM courses ORDER BY createdAt DESC').all();
    const materialsRaw = db.prepare('SELECT * FROM materials ORDER BY uploadDate DESC').all();
    const materials = materialsRaw.map(formatMaterial);
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
    const uniInfo = db.prepare("SELECT * FROM uni_info WHERE id = 'main'").get();

    res.json({
      courses,
      materials,
      tasks,
      uniInfo: uniInfo ? { name: uniInfo.name, currentSemester: uniInfo.currentSemester, studentName: uniInfo.studentName } : null
    });
  } catch (err) {
    console.error('Error fetching academic data:', err);
    res.status(500).json({ error: 'Failed to fetch academic data' });
  }
});

// -------------------------------------------------------------
// COURSES ENDPOINTS
// -------------------------------------------------------------
app.get('/api/courses', (req, res) => {
  try {
    const courses = db.prepare('SELECT * FROM courses ORDER BY createdAt DESC').all();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.post('/api/courses', (req, res) => {
  try {
    const { id, name, code, teacher, description, color, createdAt } = req.body;
    const stmt = db.prepare(`
      INSERT INTO courses (id, name, code, teacher, description, color, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, code, teacher || '', description || '', color, createdAt || new Date().toISOString());
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
    res.status(201).json(course);
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

app.put('/api/courses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, teacher, description, color } = req.body;
    const stmt = db.prepare(`
      UPDATE courses
      SET name = ?, code = ?, teacher = ?, description = ?, color = ?
      WHERE id = ?
    `);
    stmt.run(name, code, teacher || '', description || '', color, id);
    const updated = db.prepare('SELECT * FROM courses WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

app.delete('/api/courses/:id', (req, res) => {
  try {
    const { id } = req.params;
    // Delete associated materials and tasks
    db.prepare('DELETE FROM materials WHERE courseId = ?').run(id);
    db.prepare('DELETE FROM tasks WHERE courseId = ?').run(id);
    db.prepare('DELETE FROM courses WHERE id = ?').run(id);
    res.json({ success: true, deletedCourseId: id });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// -------------------------------------------------------------
// MATERIALS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/materials', (req, res) => {
  try {
    const materialsRaw = db.prepare('SELECT * FROM materials ORDER BY uploadDate DESC').all();
    res.json(materialsRaw.map(formatMaterial));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

app.post('/api/materials', (req, res) => {
  try {
    const m = req.body;
    const stmt = db.prepare(`
      INSERT INTO materials (
        id, courseId, courseCode, courseName, type, title, lectureNumber,
        fileName, fileSize, description, dueDate, term, uploadDate, isRecent, downloadUrl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      m.id,
      m.courseId,
      m.courseCode || '',
      m.courseName || '',
      m.type,
      m.title,
      m.lectureNumber !== undefined && m.lectureNumber !== '' ? Number(m.lectureNumber) : null,
      m.fileName || '',
      m.fileSize || '',
      m.description || '',
      m.dueDate || null,
      m.term || null,
      m.uploadDate || new Date().toISOString().split('T')[0],
      m.isRecent ? 1 : 0,
      m.downloadUrl || '#'
    );
    const created = db.prepare('SELECT * FROM materials WHERE id = ?').get(m.id);
    res.status(201).json(formatMaterial(created));
  } catch (err) {
    console.error('Error creating material:', err);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

app.delete('/api/materials/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM materials WHERE id = ?').run(id);
    res.json({ success: true, deletedMaterialId: id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

// -------------------------------------------------------------
// TASKS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const t = req.body;
    const stmt = db.prepare(`
      INSERT INTO tasks (
        id, courseId, courseCode, courseName, title, type, dueDate, dueTime, description, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      t.id,
      t.courseId,
      t.courseCode || '',
      t.courseName || '',
      t.title,
      t.type || 'Assignment',
      t.dueDate || '',
      t.dueTime || '',
      t.description || '',
      t.status || 'pending',
      t.createdAt || new Date().toISOString()
    );
    const created = db.prepare('SELECT * FROM tasks WHERE id = ?').get(t.id);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updated = { ...existing, ...updates };

    const stmt = db.prepare(`
      UPDATE tasks
      SET courseId = ?, courseCode = ?, courseName = ?, title = ?, type = ?, dueDate = ?, dueTime = ?, description = ?, status = ?
      WHERE id = ?
    `);
    stmt.run(
      updated.courseId,
      updated.courseCode,
      updated.courseName,
      updated.title,
      updated.type,
      updated.dueDate,
      updated.dueTime,
      updated.description,
      updated.status,
      id
    );

    const result = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(result);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    res.json({ success: true, deletedTaskId: id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// -------------------------------------------------------------
// UNIVERSITY INFO ENDPOINTS
// -------------------------------------------------------------
app.get('/api/uni-info', (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM uni_info WHERE id = 'main'").get();
    res.json(row ? { name: row.name, currentSemester: row.currentSemester, studentName: row.studentName } : {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch uni info' });
  }
});

app.put('/api/uni-info', (req, res) => {
  try {
    const { name, currentSemester, studentName } = req.body;
    db.prepare(`
      UPDATE uni_info
      SET name = ?, currentSemester = ?, studentName = ?
      WHERE id = 'main'
    `).run(name, currentSemester, studentName);
    res.json({ name, currentSemester, studentName });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update uni info' });
  }
});

// -------------------------------------------------------------
// DATA MIGRATION ENDPOINT (Import localStorage data into SQLite)
// -------------------------------------------------------------
app.post('/api/migrate', (req, res) => {
  try {
    const { courses = [], materials = [], tasks = [], uniInfo = null } = req.body;

    const insertCourse = db.prepare(`
      INSERT OR IGNORE INTO courses (id, name, code, teacher, description, color, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMaterial = db.prepare(`
      INSERT OR IGNORE INTO materials (
        id, courseId, courseCode, courseName, type, title, lectureNumber,
        fileName, fileSize, description, dueDate, term, uploadDate, isRecent, downloadUrl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertTask = db.prepare(`
      INSERT OR IGNORE INTO tasks (
        id, courseId, courseCode, courseName, title, type, dueDate, dueTime, description, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const migrateAll = db.transaction(() => {
      for (const c of courses) {
        insertCourse.run(c.id, c.name, c.code, c.teacher || '', c.description || '', c.color || 'blue', c.createdAt || new Date().toISOString());
      }
      for (const m of materials) {
        insertMaterial.run(
          m.id,
          m.courseId,
          m.courseCode || '',
          m.courseName || '',
          m.type || 'slide',
          m.title,
          m.lectureNumber !== undefined && m.lectureNumber !== '' ? Number(m.lectureNumber) : null,
          m.fileName || '',
          m.fileSize || '',
          m.description || '',
          m.dueDate || null,
          m.term || null,
          m.uploadDate || new Date().toISOString().split('T')[0],
          m.isRecent ? 1 : 0,
          m.downloadUrl || '#'
        );
      }
      for (const t of tasks) {
        insertTask.run(
          t.id,
          t.courseId,
          t.courseCode || '',
          t.courseName || '',
          t.title,
          t.type || 'Assignment',
          t.dueDate || '',
          t.dueTime || '',
          t.description || '',
          t.status || 'pending',
          t.createdAt || new Date().toISOString()
        );
      }
      if (uniInfo) {
        db.prepare(`
          UPDATE uni_info
          SET name = ?, currentSemester = ?, studentName = ?
          WHERE id = 'main'
        `).run(uniInfo.name || 'Academic Organizer', uniInfo.currentSemester || 'Semester', uniInfo.studentName || 'Student');
      }
    });

    migrateAll();

    res.json({ success: true, message: 'Data migrated successfully' });
  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ error: 'Data migration failed' });
  }
});

// -------------------------------------------------------------
// RESET ALL DATA ENDPOINT
// -------------------------------------------------------------
app.post('/api/reset', (req, res) => {
  try {
    db.prepare('DELETE FROM materials').run();
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM courses').run();
    db.prepare(`
      UPDATE uni_info
      SET name = 'Academic Organizer', currentSemester = 'Semester', studentName = 'Student'
      WHERE id = 'main'
    `).run();
    res.json({ success: true, message: 'All backend data reset' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

// Catch-all route to support React Router single-page navigation in production mode
app.get('/{*splat}', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API Server running on port ${PORT}`);
});
