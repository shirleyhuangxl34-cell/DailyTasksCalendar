import { useState, useEffect } from 'react';
import { LogOut, User, Edit2, Save, X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useStats } from '../hooks/useData';

export default function ProfilePage() {
  const { user, signOut, nickname: authNickname } = useAuth();
  const stats = useStats();
  const [nickname, setNickname] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('user_profiles').select('nickname').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { if (data) { setNickname(data.nickname); setEditNickname(data.nickname); } });
  }, [user, authNickname]);

  const saveNickname = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('user_profiles').update({ nickname: editNickname.trim() }).eq('user_id', user.id);
    setNickname(editNickname.trim());
    setSaving(false);
    setEditing(false);
  };

  const handleSignOut = async () => {
    if (confirm('确定要退出登录吗？')) await signOut();
  };

  const achievements = [
    { icon: '🌱', label: '初次打卡', unlocked: stats.totalCheckins >= 1 },
    { icon: '⚡', label: '7天连续', unlocked: stats.currentStreak >= 7 },
    { icon: '🔥', label: '30天连续', unlocked: stats.currentStreak >= 30 },
    { icon: '💎', label: '100次打卡', unlocked: stats.totalCheckins >= 100 },
    { icon: '🏆', label: '100天连续', unlocked: stats.currentStreak >= 100 },
    { icon: '⭐', label: '365天连续', unlocked: stats.currentStreak >= 365 },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 pb-24">
        <div className="pt-8 pb-6">
          <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-2xl text-white font-bold flex-shrink-0">
              {nickname ? nickname[0].toUpperCase() : <User className="w-7 h-7" />}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editNickname}
                    onChange={(e) => setEditNickname(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    maxLength={20}
                    autoFocus
                  />
                  <button onClick={saveNickname} disabled={saving} className="text-emerald-500 hover:text-emerald-600">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 truncate">{nickname || '未设置昵称'}</p>
                  <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-400 mt-0.5">每日打卡会员</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
            {[
              { label: '总打卡', value: stats.totalCheckins },
              { label: '连续天数', value: stats.currentStreak },
              { label: '完成率', value: `${stats.completionRate}%` },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">成就徽章</h3>
          <div className="grid grid-cols-3 gap-4">
            {achievements.map((a) => (
              <div
                key={a.label}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition ${
                  a.unlocked ? 'bg-emerald-50' : 'bg-gray-50 opacity-40'
                }`}
              >
                <span className="text-2xl">{a.icon}</span>
                <span className={`text-xs font-medium text-center leading-tight ${
                  a.unlocked ? 'text-emerald-700' : 'text-gray-400'
                }`}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational quote */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 mb-4 text-white">
          <p className="text-lg font-semibold leading-relaxed">"坚持是一种习惯，而不是一种才能。"</p>
          <p className="text-emerald-100 text-sm mt-2">每一天的坚持都在塑造更好的你</p>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full bg-white hover:bg-red-50 text-red-500 hover:text-red-600 font-medium py-4 rounded-2xl border border-gray-100 hover:border-red-100 transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>
      </div>
    </div>
  );
}
