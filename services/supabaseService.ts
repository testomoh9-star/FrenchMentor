
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Conversation, Message } from '../types';

/* 
  REQUIRED SUPABASE TABLES:
  
  1. profiles
     - id: uuid (primary key, references auth.users.id)
     - sparks: integer (default: 8)
     - is_pro: boolean (default: false)
     - full_name: text

  2. conversations
     - id: text (primary key)
     - user_id: uuid (references auth.users.id)
     - title: text
     - messages: jsonb
     - timestamp: bigint
*/

const supabaseUrl = 'https://rrbptxpezgxpnuximgzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyYnB0eHBlemd4cG51eGltZ3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMTM0NTYsImV4cCI6MjA4MjY4OTQ1Nn0.SdnSRr0lrwSrbwPnMN7l-gfVPctMQeQb60YgVD6fM38';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const supabase = {
  auth: {
    signInWithPassword: async (email: string, password?: string) => {
      return await supabaseClient.auth.signInWithPassword({ email, password: password || '' });
    },
    signUp: async (email: string, password?: string) => {
      return await supabaseClient.auth.signUp({ email, password: password || '' });
    },
    signOut: async () => {
      return await supabaseClient.auth.signOut();
    }
  },

  /**
   * Safe Profile Fetcher: Never returns null, always returns a valid object or a default.
   */
  getProfile: async (userId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      // If table doesn't exist or other DB error, use fail-safe defaults
      if (error) {
        console.warn("Supabase: Profiles table may be missing or inaccessible. Using local defaults.");
        return { id: userId, sparks: 8, is_pro: false };
      }
      
      // Create profile if missing
      if (!data) {
        const { data: newProfile } = await supabaseClient
          .from('profiles')
          .insert([{ id: userId, sparks: 8, is_pro: false }])
          .select()
          .single();
        return newProfile || { id: userId, sparks: 8, is_pro: false };
      }
      
      return data;
    } catch (e) {
      return { id: userId, sparks: 8, is_pro: false };
    }
  },

  updateSparks: async (userId: string, sparks: number) => {
    try {
      await supabaseClient
        .from('profiles')
        .update({ sparks })
        .eq('id', userId);
    } catch (e) {
      // Silent fail - will retry next session
    }
  },

  syncConversations: async (userId: string, conversations: Conversation[]) => {
    try {
      // Simple Sync: Delete user's current cloud set and replace with the latest state
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
      console.warn("Supabase: Conversations table may be missing. Sync skipped.");
    }
  },

  fetchConversations: async (userId: string): Promise<Conversation[]> => {
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
