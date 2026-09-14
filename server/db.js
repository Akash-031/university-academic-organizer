import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Enable WAL mode for performance
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    teacher TEXT,
    description TEXT,
    color TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    courseId TEXT NOT NULL,
    courseCode TEXT,
    courseName TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    lectureNumber INTEGER,
    fileName TEXT,
    fileSize TEXT,
    description TEXT,
    dueDate TEXT,
    term TEXT,
    uploadDate TEXT,
    isRecent INTEGER DEFAULT 1,
    downloadUrl TEXT,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    courseId TEXT NOT NULL,
    courseCode TEXT,
    courseName TEXT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    dueDate TEXT,
    dueTime TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TEXT,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS uni_info (
    id TEXT PRIMARY KEY DEFAULT 'main',
    name TEXT,
    currentSemester TEXT,
    studentName TEXT
  );
`);

// Ensure default uni_info row exists
const existingUniInfo = db.prepare(`SELECT * FROM uni_info WHERE id = 'main'`).get();
if (!existingUniInfo) {
  db.prepare(`
    INSERT INTO uni_info (id, name, currentSemester, studentName)
    VALUES ('main', 'Academic Organizer', 'Semester', 'Student')
  `).run();
}

export default db;
