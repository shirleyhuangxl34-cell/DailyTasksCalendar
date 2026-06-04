import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          nickname: string;
          avatar_url: string;
          streak_days: number;
          total_checkins: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          icon: string;
          color: string;
          frequency: string;
          target_days: number;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['habits']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['habits']['Insert']>;
      };
      checkins: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          check_date: string;
          note: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['checkins']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['checkins']['Insert']>;
      };
    };
  };
};

export type Habit = Database['public']['Tables']['habits']['Row'];
export type Checkin = Database['public']['Tables']['checkins']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
