
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Conversation, Message } from '../types';

const supabaseUrl = 'https://rrbptxpezgxpnuximgzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyYnB0eHBlemd4cG51eGltZ3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMTM0NTYsImV4cCI6MjA4MjY4OTQ1Nn0.SdnSRr0lrwSrbwPnMN7l-gfVPctMQeQb60YgVD6fM38';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const getBrowserFingerprint = async (): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'default-guest-id';
  const text = "LexiLift-V3-Fingerprint";
  ctx.font = "14px 'Arial'";
  ctx.fillText(text, 2, 15);
  const result = canvas.toDataURL();
  let hash = 0;
  for (let i = 0; i < result.length; i++) {
    hash = ((hash << 5) - hash) + result.charCodeAt(i);
    hash |= 0;
  }
  return 'dev_' + Math.abs(hash).toString(16);
};

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
   * Fetches user profile. If it doesn't exist, creates it with default sparks.
   */
  getProfile: async (userId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        const { data: newProfile, error: insertError } = await supabaseClient
          .from('profiles')
          .insert([{ id: userId, sparks: 8, is_pro: false }])
          .select()
          .single();
        if (insertError) throw insertError;
        return newProfile;
      }
      return data;
    } catch (e) {
      console.error("Profile fetch/create failed, using defaults", e);
      return { id: userId, sparks: 8, is_pro: false };
    }
  },

  updateSparks: async (id: string, sparks: number, isUser: boolean) => {
    try {
      const table = isUser ? 'profiles' : 'guest_tracking';
      const idColumn = isUser ? 'id' : 'device_id';
      
      await supabaseClient
        .from(table)
        .update({ sparks })
        .eq(idColumn, id);
    } catch (e) {
      console.error("Sparks sync failed", e);
    }
  },

  /**
   * Fetches guest data. If it doesn't exist, creates it.
   */
  getGuestData: async (deviceId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('guest_tracking')
        .select('sparks')
        .eq('device_id', deviceId)
        .maybeSingle();
      
      if (error) throw error;

      if (!data) {
        const { data: newData, error: insertError } = await supabaseClient
          .from('guest_tracking')
          .insert([{ device_id: deviceId, sparks: 8 }])
          .select()
          .single();
        if (insertError) throw insertError;
        return newData || { sparks: 8 };
      }
      return data;
    } catch (e) {
      console.error("Guest tracking failed, using defaults", e);
      return { sparks: 8 };
    }
  },

  syncConversations: async (userId: string, conversations: Conversation[]) => {
    try {
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
      console.error("Conversation sync failed", e);
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
      return data.map(d => ({
        id: d.id,
        title: d.title,
        messages: d.messages as Message[],
        timestamp: d.timestamp
      }));
    } catch (e) {
      console.error("Fetch conversations failed", e);
      return [];
    }
  }
};
