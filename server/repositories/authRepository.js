import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '../supabase.js';

const SALT_ROUNDS = 10;

function toPublicUser(row) {
  return row && {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
  };
}

function throwIfError(error, operation) {
  if (error) {
    throw new Error(`Supabase ${operation} failed: ${error.message}`);
  }
}

export function createAuthRepository() {
  const supabase = getSupabaseClient();

  return {
    async findByEmail(email) {
      const result = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();
      throwIfError(result.error, 'finding user by email');
      return result.data;
    },

    async findById(id) {
      const result = await supabase.from('users').select('*').eq('id', id).maybeSingle();
      throwIfError(result.error, 'finding user by id');
      return result.data;
    },

    async register({ name, email, password }) {
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await this.findByEmail(normalizedEmail);
      if (existing) {
        const error = new Error('An account with this email already exists');
        error.code = 'EMAIL_TAKEN';
        throw error;
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const record = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        created_at: new Date().toISOString(),
      };

      const result = await supabase.from('users').insert(record).select().single();
      throwIfError(result.error, 'registering user');
      return toPublicUser(result.data);
    },

    async verifyCredentials(email, password) {
      const user = await this.findByEmail(email);
      if (!user) return null;
      const matches = await bcrypt.compare(password, user.password_hash);
      if (!matches) return null;
      return toPublicUser(user);
    },

    async getPublicUser(id) {
      const user = await this.findById(id);
      return toPublicUser(user);
    },
  };
}
