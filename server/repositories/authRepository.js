import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '../supabase.js';
import { sendPasswordResetEmail } from '../email.js';

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
export const PASSWORD_MIN_LENGTH = 6;

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

    async requestPasswordReset(email) {
      const normalizedEmail = email.toLowerCase().trim();
      const user = await this.findByEmail(normalizedEmail);
      if (!user) return;

      const invalidateResult = await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('user_id', user.id)
        .eq('used', false);
      throwIfError(invalidateResult.error, 'invalidating previous password reset tokens');

      const token = crypto.randomBytes(32).toString('base64url');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + RESET_TOKEN_TTL_MS);

      const insertResult = await supabase.from('password_reset_tokens').insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        used: false,
        created_at: createdAt.toISOString(),
      });
      throwIfError(insertResult.error, 'creating password reset token');

      await sendPasswordResetEmail({ email: user.email, token });
    },

    async resetPassword(token, password) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const tokenResult = await supabase
        .from('password_reset_tokens')
        .select('id, user_id, expires_at, used')
        .eq('token_hash', tokenHash)
        .maybeSingle();
      throwIfError(tokenResult.error, 'verifying password reset token');

      const resetToken = tokenResult.data;
      if (!resetToken || resetToken.used || new Date(resetToken.expires_at).getTime() <= Date.now()) {
        const error = new Error('Invalid or expired password reset token');
        error.code = 'INVALID_RESET_TOKEN';
        throw error;
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const consumeResult = await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', resetToken.id)
        .eq('used', false)
        .select('id')
        .maybeSingle();
      throwIfError(consumeResult.error, 'consuming password reset token');
      if (!consumeResult.data) {
        const error = new Error('Invalid or expired password reset token');
        error.code = 'INVALID_RESET_TOKEN';
        throw error;
      }

      const userResult = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('id', resetToken.user_id)
        .select('id')
        .single();
      throwIfError(userResult.error, 'updating password');
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
