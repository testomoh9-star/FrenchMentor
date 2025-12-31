
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { Conversation } from '../types';

const supabaseUrl = 'https://rrbptxpezgxpnuximgzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyYnB0eHBlemd4cG51eGltZ3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMTM0NTYsImV4cCI6MjA4MjY4OTQ1Nn0.SdnSRr0lrwSrbwPnMN7l-gfVPctMQeQb60YgVD6fM38';

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const getBrowserFingerprint = async (): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'default-guest-id';
  
  const text = "LexiLift-Fingerprint-1.0";
  ctx.textBaseline = "top";
  ctx.font = "14px 'Arial'";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069";
  ctx.fillText(text, 2, 15);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText(text, 4, 17);
  
  const result = canvas.toDataURL();
  
  let hash = 0;
  for (let i = 0; i < result.length; i++) {
    const char = result.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'device_' + Math.abs(hash).toString(16);
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
    },
    onAuthStateChange: (callback: any) => {
      return supabaseClient.auth.onAuthStateChange(callback);
    }
  },
  
  getGuestSparks: async (fingerprint: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('guest_tracking')
        .select('sparks')
        .eq('device_id', fingerprint)
        .maybeSingle();

      if (!data && !error) {
        const { data: newData } = await supabaseClient
          .from('guest_tracking')
          .insert([{ device_id: fingerprint, sparks: 8 }])
          .select()
          .maybeSingle();
        return newData?.sparks || 8;
      }
      return data?.sparks ?? 8;
    } catch (e) {
      console.error("Guest tracking error:", e);
      return 8;
    }
  },

  updateGuestSparks: async (fingerprint: string, sparks: number) => {
    await supabaseClient
      .from('guest_tracking')
      .update({ sparks })
      .eq('device_id', fingerprint);
  },

  getProfile: async (userId: string, initialSparks?: number) => {
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
          .insert([{ id: userId, sparks: initialSparks ?? 8, is_pro: false }])
          .select()
          .maybeSingle();
        
        if (insertError) throw insertError;
        return newProfile;
      }
      return data;
    } catch (e: any) {
      console.error("Profile error:", e);
      return { id: userId, sparks: initialSparks ?? 8, is_pro: false };
    }
  },

  updateProfileSparks: async (userId: string, sparks: number) => {
    await supabaseClient
      .from('profiles')
      .update({ sparks })
      .eq('id', userId);
  },

  // NEW: PERSISTENT CONVERSATIONS
  getConversations: async (userId: string): Promise<Conversation[]> => {
    try {
      const { data, error } = await supabaseClient
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      
      if (error) return [];
      return data.map(item => ({
        id: item.id,
        title: item.title,
        messages: item.messages || [],
        timestamp: item.timestamp
      }));
    } catch (e) {
      return [];
    }
  },

  saveConversations: async (userId: string, conversations: Conversation[]) => {
    try {
      // Upsert pattern: Delete old, insert new for this user
      // In a production app with huge histories, you'd only sync changed ones.
      // For this MVP, we replace the set for simplicity and data integrity.
      await supabaseClient
        .from('conversations')
        .delete()
        .eq('user_id', userId);

      const payload = conversations.map(c => ({
        user_id: userId,
        id: c.id,
        title: c.title,
        messages: c.messages,
        timestamp: c.timestamp
      }));

      if (payload.length > 0) {
        await supabaseClient.from('conversations').insert(payload);
      }
    } catch (e) {
      console.error("Save conversations error:", e);
    }
  }
};
