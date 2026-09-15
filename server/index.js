import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createAcademicRepository } from './repositories/academicRepository.js';
import { createAuthRepository } from './repositories/authRepository.js';
import { createRoomRepository } from './repositories/roomRepository.js';
import { signAuthToken, setAuthCookie, clearAuthCookie, requireAuth } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
// 0.0.0.0 can be silently torn down by Windows Firewall/VPN/AV on some machines; localhost-only is what dev actually needs.
const HOST = process.env.HOST || '127.0.0.1';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

function repository() {
  return createAcademicRepository();
}

function authRepository() {
  return createAuthRepository();
}

function roomRepository() {
  return createRoomRepository();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sendDatabaseError(res, error, operation) {
  console.error(`${operation}:`, error);
  const isConfigurationError = error.message.startsWith('Supabase is not configured');
  res.status(isConfigurationError ? 503 : 500).json({
    error: isConfigurationError ? error.message : `Failed to ${operation.toLowerCase()}`,
  });
}

app.get('/api/academic/all', async (req, res) => {
  try {
    res.json(await repository().getAll());
  } catch (error) {
    sendDatabaseError(res, error, 'fetch academic data');
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    res.json(await repository().getCourses());
  } catch (error) {
    sendDatabaseError(res, error, 'fetch courses');
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    res.status(201).json(await repository().createCourse(req.body));
  } catch (error) {
    sendDatabaseError(res, error, 'create course');
  }
});

app.put('/api/courses/:id', async (req, res) => {
  try {
    const updated = await repository().updateCourse(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    sendDatabaseError(res, error, 'update course');
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    await repository().deleteCourse(req.params.id);
    res.json({ success: true, deletedCourseId: req.params.id });
  } catch (error) {
    sendDatabaseError(res, error, 'delete course');
  }
});

app.get('/api/materials', async (req, res) => {
  try {
    res.json(await repository().getMaterials());
  } catch (error) {
    sendDatabaseError(res, error, 'fetch materials');
  }
});

app.post('/api/materials', async (req, res) => {
  try {
    res.status(201).json(await repository().createMaterial(req.body));
  } catch (error) {
    sendDatabaseError(res, error, 'create material');
  }
});

app.delete('/api/materials/:id', async (req, res) => {
  try {
    await repository().deleteMaterial(req.params.id);
    res.json({ success: true, deletedMaterialId: req.params.id });
  } catch (error) {
    sendDatabaseError(res, error, 'delete material');
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    res.json(await repository().getTasks());
  } catch (error) {
    sendDatabaseError(res, error, 'fetch tasks');
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    res.status(201).json(await repository().createTask(req.body));
  } catch (error) {
    sendDatabaseError(res, error, 'create task');
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updated = await repository().updateTask(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(updated);
  } catch (error) {
    sendDatabaseError(res, error, 'update task');
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await repository().deleteTask(req.params.id);
    res.json({ success: true, deletedTaskId: req.params.id });
  } catch (error) {
    sendDatabaseError(res, error, 'delete task');
  }
});

app.get('/api/uni-info', async (req, res) => {
  try {
    res.json(await repository().getUniInfo());
  } catch (error) {
    sendDatabaseError(res, error, 'fetch university information');
  }
});

app.put('/api/uni-info', async (req, res) => {
  try {
    res.json(await repository().updateUniInfo(req.body));
  } catch (error) {
    sendDatabaseError(res, error, 'update university information');
  }
});

app.post('/api/migrate', async (req, res) => {
  try {
    await repository().migrate(req.body);
    res.json({ success: true, message: 'Data migrated successfully' });
  } catch (error) {
    sendDatabaseError(res, error, 'migrate data');
  }
});

app.post('/api/reset', async (req, res) => {
  try {
    await repository().reset();
    res.json({ success: true, message: 'All backend data reset' });
  } catch (error) {
    sendDatabaseError(res, error, 'reset data');
  }
});

// ==============================================
// Authentication routes
// ==============================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'A valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await authRepository().register({ name, email, password });
    const token = signAuthToken(user.id);
    setAuthCookie(res, token);
    res.status(201).json({ user });
  } catch (error) {
    if (error.code === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: error.message });
    }
    sendDatabaseError(res, error, 'register user');
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await authRepository().verifyCredentials(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signAuthToken(user.id);
    setAuthCookie(res, token);
    res.json({ user });
  } catch (error) {
    sendDatabaseError(res, error, 'log in');
  }
});

app.post('/api/auth/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await authRepository().getPublicUser(req.userId);
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Session is no longer valid' });
    }
    res.json({ user });
  } catch (error) {
    sendDatabaseError(res, error, 'fetch current user');
  }
});

// ==============================================
// Room routes (all require authentication)
// ==============================================

app.post('/api/rooms', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const room = await roomRepository().createRoom({ name, description, ownerId: req.userId });
    res.status(201).json({ room });
  } catch (error) {
    sendDatabaseError(res, error, 'create room');
  }
});

app.get('/api/rooms', requireAuth, async (req, res) => {
  try {
    const rooms = await roomRepository().getRoomsForUser(req.userId);
    res.json({ rooms });
  } catch (error) {
    sendDatabaseError(res, error, 'fetch rooms');
  }
});

app.post('/api/rooms/join', requireAuth, async (req, res) => {
  try {
    const { roomCode } = req.body || {};
    const room = await roomRepository().joinRoomByCode(roomCode, req.userId);
    res.json({ room });
  } catch (error) {
    if (error.code === 'ROOM_NOT_FOUND' || error.code === 'INVALID_CODE') {
      return res.status(404).json({ error: error.message });
    }
    sendDatabaseError(res, error, 'join room');
  }
});

app.get('/api/rooms/:roomId', requireAuth, async (req, res) => {
  try {
    const role = await roomRepository().isMember(req.params.roomId, req.userId);
    if (!role) {
      return res.status(403).json({ error: 'You are not a member of this room' });
    }
    const room = await roomRepository().getRoomById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ room, role });
  } catch (error) {
    sendDatabaseError(res, error, 'fetch room');
  }
});

app.get('/api/rooms/:roomId/members', requireAuth, async (req, res) => {
  try {
    const role = await roomRepository().isMember(req.params.roomId, req.userId);
    if (!role) {
      return res.status(403).json({ error: 'You are not a member of this room' });
    }
    const members = await roomRepository().getMembers(req.params.roomId);
    res.json({ members });
  } catch (error) {
    sendDatabaseError(res, error, 'fetch room members');
  }
});

app.get('/{*splat}', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), error => {
    if (error) next();
  });
});

// Surface fatal errors loudly instead of letting the process exit silently.
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exitCode = 1;
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  process.exitCode = 1;
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Backend API Server running on port ${PORT}`);
});

// Without this, a failed bind (e.g. EADDRINUSE) throws unnoticed and the process exits silently.
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the process using it or set PORT to a free port.`);
  } else {
    console.error('Backend server failed to start:', error);
  }
  process.exit(1);
});
