-- Run this script in the Supabase SQL Editor before enabling the new backend.
-- Data remains unauthenticated in this phase; the server uses the service-role key.

CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  teacher TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.materials (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL DEFAULT '',
  course_name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  lecture_number INTEGER,
  file_name TEXT NOT NULL DEFAULT '',
  file_size TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  due_date TEXT,
  term TEXT,
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recent BOOLEAN NOT NULL DEFAULT TRUE,
  download_url TEXT NOT NULL DEFAULT '#'
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL DEFAULT '',
  course_name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Assignment',
  due_date TEXT NOT NULL DEFAULT '',
  due_time TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.uni_info (
  id TEXT PRIMARY KEY DEFAULT 'main',
  name TEXT NOT NULL DEFAULT 'Academic Organizer',
  current_semester TEXT NOT NULL DEFAULT 'Semester',
  student_name TEXT NOT NULL DEFAULT 'Student'
);

CREATE INDEX IF NOT EXISTS materials_course_id_idx ON public.materials(course_id);
CREATE INDEX IF NOT EXISTS tasks_course_id_idx ON public.tasks(course_id);
CREATE INDEX IF NOT EXISTS courses_created_at_idx ON public.courses(created_at DESC);
CREATE INDEX IF NOT EXISTS materials_upload_date_idx ON public.materials(upload_date DESC);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON public.tasks(created_at DESC);

INSERT INTO public.uni_info (id, name, current_semester, student_name)
VALUES ('main', 'Academic Organizer', 'Semester', 'Student')
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- Authentication + Room collaboration (Phase 2)
-- ==============================================

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  room_code TEXT UNIQUE NOT NULL,
  owner_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.room_members (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS rooms_owner_id_idx ON public.rooms(owner_id);
CREATE INDEX IF NOT EXISTS rooms_room_code_idx ON public.rooms(room_code);
CREATE INDEX IF NOT EXISTS room_members_room_id_idx ON public.room_members(room_id);
CREATE INDEX IF NOT EXISTS room_members_user_id_idx ON public.room_members(user_id);