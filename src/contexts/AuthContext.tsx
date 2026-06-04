import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  nickname: string;
  signIn: (nickname: string, password: string) => Promise<{ error: string | null }>;
  signUp: (nickname: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const toEmail = (nickname: string) => `${nickname.trim().toLowerCase()}@checkin.local`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadNickname(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadNickname(session.user.id);
      else setNickname('');
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadNickname = async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('nickname')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) setNickname(data.nickname);
  };

  const signIn = async (nick: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: toEmail(nick),
      password,
    });
    if (error) {
      if (error.message.includes('Invalid login credentials')) return { error: '昵称或密码错误' };
      return { error: '登录失败，请重试' };
    }
    setNickname(nick.trim());
    return { error: null };
  };

  const signUp = async (nick: string, password: string) => {
    const trimmed = nick.trim();
    const { data, error } = await supabase.auth.signUp({
      email: toEmail(trimmed),
      password,
    });
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return { error: '该昵称已被注册，请换一个' };
      }
      return { error: '注册失败，请重试' };
    }
    if (data.user) {
      await supabase.from('user_profiles').insert({
        user_id: data.user.id,
        nickname: trimmed,
        avatar_url: '',
        streak_days: 0,
        total_checkins: 0,
      });
      setNickname(trimmed);
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setNickname('');
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, nickname, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
