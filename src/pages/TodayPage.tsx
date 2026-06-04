import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Target } from 'lucide-react';
import { useHabits, useCheckins } from '../hooks/useData';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import HabitCard from '../components/HabitCard';
import HabitModal from '../components/HabitModal';
import { Habit } from '../lib/supabase';

export default function TodayPage() {
  const { user, nickname } = useAuth();
  const { habits, loading: habitsLoading, addHabit, updateHabit, deleteHabit } = useHabits();
  const { checkins, toggleCheckin, isChecked } = useCheckins();
  const [showModal, setShowModal] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [streaks, setStreaks] = useState<Record<string, number>>({});

  // Fetch streak for each habit
  useEffect(() => {
    if (!user || habits.length === 0) return;
    const fetchStreaks = async () => {
      const today = new Date().toISOString().split('T')[0];
      const result: Record<string, number> = {};
      for (const habit of habits) {
        const { data } = await supabase
          .from('checkins')
          .select('check_date')
          .eq('user_id', user.id)
          .eq('habit_id', habit.id)
          .lte('check_date', today)
          .order('check_date', { ascending: false });
        if (!data) { result[habit.id] = 0; continue; }
        let streak = 0;
        for (let i = 0; i < data.length; i++) {
          const expected = new Date();
          expected.setDate(expected.getDate() - i);
          if (data[i].check_date === expected.toISOString().split('T')[0]) streak++;
          else break;
        }
        result[habit.id] = streak;
      }
      setStreaks(result);
    };
    fetchStreaks();
  }, [user, habits, checkins]);

  const todayStr = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  const completedCount = habits.filter((h) => isChecked(h.id)).length;

  const handleSave = async (habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (editHabit) return updateHabit(editHabit.id, habitData);
    return addHabit(habitData);
  };

  const handleEdit = (habit: Habit) => { setEditHabit(habit); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setEditHabit(null); };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 pb-24">
        {/* Header */}
        <div className="pt-8 pb-6">
          <p className="text-sm text-gray-400">{todayStr}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            {nickname ? `你好，${nickname}` : '今日打卡'}
          </h1>
          {habits.length > 0 && (
            <p className="text-gray-500 text-sm mt-1">
              今日已完成 {completedCount}/{habits.length} 个习惯
            </p>
          )}
        </div>

        {/* Progress bar */}
        {habits.length > 0 && (
          <div className="mb-6">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / habits.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Habit list */}
        {habitsLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">加载中…</div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-gray-500 font-medium">还没有习惯</p>
            <p className="text-gray-400 text-sm mt-1">点击下方按钮添加你的第一个习惯</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                checked={isChecked(habit.id)}
                streak={streaks[habit.id] ?? 0}
                onToggle={() => toggleCheckin(habit.id)}
                onEdit={() => handleEdit(habit)}
                onDelete={() => deleteHabit(habit.id)}
              />
            ))}
          </div>
        )}

        {/* All done banner */}
        {habits.length > 0 && completedCount === habits.length && (
          <div className="mt-6 bg-emerald-50 rounded-2xl p-5 flex items-center gap-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-700">全部完成！</p>
              <p className="text-emerald-600 text-sm">今天的习惯全部打卡，太棒了</p>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditHabit(null); setShowModal(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center transition-all duration-200 active:scale-95"
        aria-label="添加习惯"
      >
        <Plus className="w-7 h-7" />
      </button>

      {showModal && (
        <HabitModal
          onClose={handleCloseModal}
          onSave={handleSave}
          editHabit={editHabit}
        />
      )}
    </div>
  );
}
