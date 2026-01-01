
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Conversation, Message, BrainStats } from '../types';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabaseClient = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

export const supabase = {
  auth: {
    signInWithPassword: async (email: string, password?: string) => {
      if (!supabaseClient) throw new Error("Supabase client not initialized.");
      return await supabaseClient.auth.signInWithPassword({ email, password: password || '' });
    },
    signUp: async (email: string, password?: string) => {
      if (!supabaseClient) throw new Error("Supabase client not initialized.");
      return await supabaseClient.auth.signUp({ email, password: password || '' });
    },
    signInWithGoogle: async () => {
      if (!supabaseClient) throw new Error("Supabase client not initialized.");
      return await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
    },
    signOut: async () => {
      if (!supabaseClient) return;
      return await supabaseClient.auth.signOut();
    }
  },

  getProfile: async (userId: string) => {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        const { data: newProfile } = await supabaseClient
          .from('profiles')
          .insert([{ id: userId, sparks: 8, is_pro: false }])
          .select()
          .single();
        return newProfile;
      }
      
      return data;
    } catch (e) {
      console.error("Profile fetch error:", e);
      return null;
    }
  },

  syncProfile: async (userId: string, sparks: number, stats: Partial<BrainStats>) => {
    if (!supabaseClient) return;
    try {
      // We store the heavy stats (history, lessons, categories) in the brain_stats JSON column
      const { totalCorrections, categories, history, archivedLessons } = stats;
      const brainPayload = { totalCorrections, categories, history, archivedLessons };
      
      await supabaseClient
        .from('profiles')
        .update({ 
          sparks, 
          brain_stats: brainPayload,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);
    } catch (e) {
      console.error("Sync profile error:", e);
    }
  },

  syncConversations: async (userId: string, conversations: Conversation[]) => {
    if (!supabaseClient) return;
    try {
      // Simple strategy: delete existing and insert new for the user
      await supabaseClient.from('conversations').delete().eq('user_id', userId);
      if (conversations.length > 0) {
        const payload = conversations.map(c => ({
          user_id: userId,
          id: c.id,
          title: c.title,
          messages: c.messages,
          timestamp: c.timestamp
        }));
        await supabaseClient.from('conversations').insert(payload);
      }
    } catch (e) {
      console.error("Sync conversations error:", e);
    }
  },

  fetchConversations: async (userId: string): Promise<Conversation[]> => {
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(d => ({
        id: d.id,
        title: d.title,
        messages: (d.messages as Message[]) || [],
        timestamp: d.timestamp
      }));
    } catch (e) {
      return [];
    }
  }
};
