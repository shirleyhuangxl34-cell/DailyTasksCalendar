import { useEffect, useState, useCallback } from 'react';
import { supabase, Habit, Checkin } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('sort_order');
    setHabits(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const addHabit = async (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('habits')
      .insert({ ...habit, user_id: user.id })
      .select()
      .single();
    if (!error && data) setHabits((prev) => [...prev, data]);
    return error;
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) setHabits((prev) => prev.map((h) => (h.id === id ? data : h)));
    return error;
  };

  const deleteHabit = async (id: string) => {
    await supabase.from('habits').update({ is_active: false }).eq('id', id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return { habits, loading, addHabit, updateHabit, deleteHabit, refetch: fetchHabits };
}

export function useCheckins(date?: string) {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  const today = date ?? new Date().toISOString().split('T')[0];

  const fetchCheckins = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', user.id)
      .eq('check_date', today);
    setCheckins(data ?? []);
    setLoading(false);
  }, [user, today]);

  useEffect(() => { fetchCheckins(); }, [fetchCheckins]);

  const toggleCheckin = async (habitId: string, note?: string) => {
    if (!user) return;
    const existing = checkins.find((c) => c.habit_id === habitId);
    if (existing) {
      await supabase.from('checkins').delete().eq('id', existing.id);
      setCheckins((prev) => prev.filter((c) => c.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from('checkins')
        .insert({ habit_id: habitId, user_id: user.id, check_date: today, note: note ?? '' })
        .select()
        .single();
      if (!error && data) setCheckins((prev) => [...prev, data]);
    }
  };

  const isChecked = (habitId: string) => checkins.some((c) => c.habit_id === habitId);

  return { checkins, loading, toggleCheckin, isChecked, refetch: fetchCheckins };
}

export function useMonthCheckins(year: number, month: number) {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = new Date(year, month, 0).toISOString().split('T')[0];
    supabase
      .from('checkins')
      .select('*')
      .eq('user_id', user.id)
      .gte('check_date', start)
      .lte('check_date', end)
      .then(({ data }) => {
        setCheckins(data ?? []);
        setLoading(false);
      });
  }, [user, year, month]);

  return { checkins, loading };
}

export function useStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCheckins: 0,
    currentStreak: 0,
    longestStreak: 0,
    completionRate: 0,
    weeklyData: [] as { date: string; count: number }[],
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const { data: allCheckins } = await supabase
        .from('checkins')
        .select('check_date, habit_id')
        .eq('user_id', user.id)
        .order('check_date', { ascending: false });

      if (!allCheckins) return;

      const totalCheckins = allCheckins.length;

      // Current streak: consecutive days with at least 1 checkin
      const uniqueDates = [...new Set(allCheckins.map((c) => c.check_date))].sort().reverse();
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      for (let i = 0; i < uniqueDates.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        const expectedStr = expected.toISOString().split('T')[0];
        if (uniqueDates[i] === expectedStr) streak++;
        else break;
      }

      // Weekly data (last 7 days)
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = allCheckins.filter((c) => c.check_date === dateStr).length;
        weeklyData.push({ date: dateStr, count });
      }

      const maxPossible = weeklyData.reduce((s, d) => s + (d.count > 0 ? 1 : 0), 0);
      const completionRate = maxPossible > 0 ? Math.round((maxPossible / 7) * 100) : 0;

      setStats({ totalCheckins, currentStreak: streak, longestStreak: streak, completionRate, weeklyData });
    };

    fetchStats();
  }, [user]);

  return stats;
}
