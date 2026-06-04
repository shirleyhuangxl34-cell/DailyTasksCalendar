import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Habit } from '../lib/supabase';

const ICONS = ['⭐', '💪', '📚', '🏃', '💧', '🧘', '🎯', '🌱', '🎨', '🎵', '✍️', '🍎', '😴', '🧹', '💻', '🤸'];
const COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

interface Props {
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<unknown>;
  editHabit?: Habit | null;
}

export default function HabitModal({ onClose, onSave, editHabit }: Props) {
  const [name, setName] = useState(editHabit?.name ?? '');
  const [description, setDescription] = useState(editHabit?.description ?? '');
  const [icon, setIcon] = useState(editHabit?.icon ?? '⭐');
  const [color, setColor] = useState(editHabit?.color ?? '#10B981');
  const [targetDays, setTargetDays] = useState(editHabit?.target_days ?? 21);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('请输入习惯名称'); return; }
    setLoading(true);
    const err = await onSave({
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      frequency: 'daily',
      target_days: targetDays,
      sort_order: 0,
      is_active: true,
    });
    setLoading(false);
    if (err) setError('保存失败，请重试');
    else onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{editHabit ? '编辑习惯' : '添加习惯'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Icon & Color Preview */}
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm flex-shrink-0"
              style={{ backgroundColor: color + '20', border: `2px solid ${color}40` }}
            >
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">选择图标</p>
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition ${
                      icon === ic ? 'bg-gray-900 text-white scale-110' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">选择颜色</p>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">习惯名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：每天喝8杯水"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-900 placeholder-gray-400"
              maxLength={20}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">备注说明</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="可选，简短描述"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-900 placeholder-gray-400"
              maxLength={50}
            />
          </div>

          {/* Target days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">目标天数：{targetDays} 天</label>
            <input
              type="range"
              min={7}
              max={365}
              step={1}
              value={targetDays}
              onChange={(e) => setTargetDays(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            {/* Tick marks positioned at their actual proportional locations */}
            <div className="relative mt-1 h-4">
              {([7, 30, 100, 365] as const).map((v) => {
                const pct = ((v - 7) / (365 - 7)) * 100;
                return (
                  <span
                    key={v}
                    className="absolute text-xs text-gray-400 -translate-x-1/2"
                    style={{ left: `${pct}%` }}
                  >
                    {v}天
                  </span>
                );
              })}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-200 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {editHabit ? '保存修改' : '添加习惯'}
          </button>
        </form>
      </div>
    </div>
  );
}
