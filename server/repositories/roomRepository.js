import crypto from 'crypto';
import { getSupabaseClient } from '../supabase.js';

function throwIfError(error, operation) {
  if (error) {
    throw new Error(`Supabase ${operation} failed: ${error.message}`);
  }
}

function toRoom(row) {
  return row && {
    id: row.id,
    name: row.name,
    description: row.description,
    roomCode: row.room_code,
    ownerId: row.owner_id,
    createdAt: row.created_at,
  };
}

function toMember(row) {
  return row && {
    id: row.id,
    roomId: row.room_id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
    name: row.users?.name,
    email: row.users?.email,
  };
}

function randomCodeSegment(length) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // avoid ambiguous chars
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  return out;
}

export function createRoomRepository() {
  const supabase = getSupabaseClient();

  async function generateUniqueRoomCode(name) {
    const prefix = (name || 'ROOM')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 4) || 'ROOM';

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = `${prefix}-${randomCodeSegment(4)}`;
      const existing = await supabase.from('rooms').select('id').eq('room_code', candidate).maybeSingle();
      throwIfError(existing.error, 'checking room code availability');
      if (!existing.data) return candidate;
    }
    throw new Error('Failed to generate a unique room code, please try again');
  }

  return {
    async createRoom({ name, description, ownerId }) {
      const roomCode = await generateUniqueRoomCode(name);
      const record = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description ? description.trim() : '',
        room_code: roomCode,
        owner_id: ownerId,
        created_at: new Date().toISOString(),
      };

      const result = await supabase.from('rooms').insert(record).select().single();
      throwIfError(result.error, 'creating room');

      const memberResult = await supabase.from('room_members').insert({
        id: crypto.randomUUID(),
        room_id: record.id,
        user_id: ownerId,
        role: 'owner',
        joined_at: new Date().toISOString(),
      });
      throwIfError(memberResult.error, 'adding room owner as member');

      return { ...toRoom(result.data), memberCount: 1 };
    },

    async joinRoomByCode(roomCode, userId) {
      const normalizedCode = (roomCode || '').trim().toUpperCase();
      if (!normalizedCode) {
        const error = new Error('Room code is required');
        error.code = 'INVALID_CODE';
        throw error;
      }

      const roomResult = await supabase.from('rooms').select('*').eq('room_code', normalizedCode).maybeSingle();
      throwIfError(roomResult.error, 'finding room by code');
      if (!roomResult.data) {
        const error = new Error('No room found with that code');
        error.code = 'ROOM_NOT_FOUND';
        throw error;
      }

      const room = toRoom(roomResult.data);
      const existingMember = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', room.id)
        .eq('user_id', userId)
        .maybeSingle();
      throwIfError(existingMember.error, 'checking existing room membership');

      if (!existingMember.data) {
        const insertResult = await supabase.from('room_members').insert({
          id: crypto.randomUUID(),
          room_id: room.id,
          user_id: userId,
          role: 'member',
          joined_at: new Date().toISOString(),
        });
        throwIfError(insertResult.error, 'joining room');
      }

      const memberCounts = await this.getMemberCounts([room.id]);
      return { ...room, memberCount: memberCounts[room.id] || 0 };
    },

    async getRoomsForUser(userId) {
      const membershipResult = await supabase
        .from('room_members')
        .select('room_id')
        .eq('user_id', userId);
      throwIfError(membershipResult.error, 'fetching user room memberships');

      const roomIds = (membershipResult.data || []).map(row => row.room_id);
      if (roomIds.length === 0) return [];

      const [roomsResult, memberCounts] = await Promise.all([
        supabase.from('rooms').select('*').in('id', roomIds).order('created_at', { ascending: false }),
        this.getMemberCounts(roomIds),
      ]);
      throwIfError(roomsResult.error, 'fetching rooms');
      return roomsResult.data.map(row => ({ ...toRoom(row), memberCount: memberCounts[row.id] || 0 }));
    },

    async getMemberCounts(roomIds) {
      if (roomIds.length === 0) return {};
      const result = await supabase.from('room_members').select('room_id').in('room_id', roomIds);
      throwIfError(result.error, 'counting room members');
      const counts = {};
      for (const row of result.data || []) {
        counts[row.room_id] = (counts[row.room_id] || 0) + 1;
      }
      return counts;
    },

    async isMember(roomId, userId) {
      const result = await supabase
        .from('room_members')
        .select('role')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .maybeSingle();
      throwIfError(result.error, 'checking room membership');
      return result.data ? result.data.role : null;
    },

    async getRoomById(roomId) {
      const result = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();
      throwIfError(result.error, 'fetching room');
      return toRoom(result.data);
    },

    async getMembers(roomId) {
      const result = await supabase
        .from('room_members')
        .select('*, users(name, email)')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });
      throwIfError(result.error, 'fetching room members');
      return result.data.map(toMember);
    },
  };
}
