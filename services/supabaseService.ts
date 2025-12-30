
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Provided by the user
const supabaseUrl = 'https://rrbptxpezgxpnuximgzw.supabase.co';
const supabaseAnonKey = 'sb_publishable_0SvYDWcn5GtjAZdtaWGwuA_xBNlXlrS';

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
      return await supabaseClient.auth.signInWithPassword({
        email,
        password: password || '',
      });
    },
    signUp: async (email: string, password?: string) => {
      return await supabaseClient.auth.signUp({
        email,
        password: password || '',
      });
    },
    signOut: async () => {
      return await supabaseClient.auth.signOut();
    },
    onAuthStateChange: (callback: any) => {
      return supabaseClient.auth.onAuthStateChange(callback);
    }
  },
  
  // Real Database logic for Guest tracking using the guest_tracking table
  getGuestSparks: async (fingerprint: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('guest_tracking')
        .select('sparks')
        .eq('device_id', fingerprint)
        .maybeSingle();

      if (!data && !error) {
        // Not found, create it
        const { data: newData } = await supabaseClient
          .from('guest_tracking')
          .insert([{ device_id: fingerprint, sparks: 8 }])
          .select()
          .single();
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

  getProfile: async (userId: string) => {
    const { data } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data;
  }
};
