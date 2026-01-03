
import { supabase } from '../lib/supabase';
import { Conversation, Message, MistakeRecord, CoachLesson, SystemLanguage, SupportLanguage } from '../types';

export const dbService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase.from('profiles').insert([{ id: userId }]).select().single();
      return newProfile;
    }
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    await supabase.from('profiles').update(updates).eq('id', userId);
  },

  async getConversations(userId: string) {
    const { data } = await supabase.from('conversations').select('*, messages(*)').eq('user_id', userId).order('created_at', { ascending: true });
    return data?.map(conv => ({
      id: conv.id,
      title: conv.title,
      timestamp: new Date(conv.created_at).getTime(),
      messages: conv.messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at).getTime()
      }))
    })) || [];
  },

  async saveConversation(userId: string, conv: Conversation) {
    const { data } = await supabase.from('conversations').upsert({
      id: conv.id.length > 30 ? conv.id : undefined, // Check if it's already a UUID
      user_id: userId,
      title: conv.title,
      created_at: new Date(conv.timestamp).toISOString()
    }).select().single();
    return data;
  },

  async saveMessage(conversationId: string, message: Message) {
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      created_at: new Date(message.timestamp).toISOString()
    });
  },

  async deleteConversation(id: string) {
    await supabase.from('conversations').delete().eq('id', id);
  },

  async deleteAllConversations(userId: string) {
    await supabase.from('conversations').delete().eq('user_id', userId);
  },

  async getMistakes(userId: string) {
    const { data } = await supabase.from('mistake_records').select('*').eq('user_id', userId);
    return data?.map(m => ({
      original: m.original,
      corrected: m.corrected,
      category: m.category,
      timestamp: new Date(m.created_at).getTime()
    })) || [];
  },

  async saveMistake(userId: string, mistake: any) {
    await supabase.from('mistake_records').insert({
      user_id: userId,
      original: mistake.original,
      corrected: mistake.corrected,
      category: mistake.category,
      created_at: new Date(mistake.timestamp).toISOString()
    });
  },

  async getLessons(userId: string) {
    const { data } = await supabase.from('lessons').select('*').eq('user_id', userId);
    return data?.map(l => ({ ...l.data, id: l.id })) || [];
  },

  async saveLesson(userId: string, lesson: CoachLesson) {
    await supabase.from('lessons').insert({
      user_id: userId,
      category: lesson.category,
      data: lesson,
      created_at: new Date(lesson.timestamp).toISOString()
    });
  },

  async resetLinguisticHistory(userId: string) {
    // Delete all mistakes and lessons for the user
    // Fixed: Removed spark reset to protect user's subscription/balance
    await Promise.all([
      supabase.from('mistake_records').delete().eq('user_id', userId),
      supabase.from('lessons').delete().eq('user_id', userId)
    ]);
  }
};
