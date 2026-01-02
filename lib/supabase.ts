
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.45.0';

const supabaseUrl = 'https://sqkdzfjryboalzuhbaby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxa2R6ZmpyeWJvYWx6dWhiYWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzAwMDMsImV4cCI6MjA4Mjk0NjAwM30.CqqHaMgkvbqOzYqBPO8MpEqN9dYb2NwDraxgLDdElqc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
