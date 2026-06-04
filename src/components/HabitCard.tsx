import { useState } from 'react';
import { CheckCircle2, Circle, Edit2, Trash2, Flame } from 'lucide-react';
import { Habit } from '../lib/supabase';

interface Props {
  habit: Habit;
  checked: boolean;
  streak: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function HabitCard({ habit, checked, streak, onToggle, onEdit, onDelete }: Props) {
  const [pressed, setPressed] = useState(false);

  const handleToggle = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 300);
    onToggle();
  };

  return (
    <div
      className={`bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border transition-all duration-200 ${
        checked ? 'border-transparent' : 'border-gray-100'
      } ${pressed ? 'scale-98' : ''}`}
      style={checked ? { borderColor: habit.color + '40', backgroundColor: habit.color + '08' } : {}}
    >
      {/* Check button */}
      <button
        onClick={handleToggle}
        className="flex-shrink-0 transition-transform active:scale-90"
        aria-label={checked ? '取消打卡' : '打卡'}
      >
        {checked ? (
          <CheckCircle2
            className="w-8 h-8 transition-all duration-300"
            style={{ color: habit.color }}
          />
        ) : (
          <Circle className="w-8 h-8 text-gray-300 hover:text-gray-400 transition" />
        )}
      </button>

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: habit.color + '20' }}
      >
        {habit.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm truncate ${checked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
          {habit.name}
        </p>
        {habit.description && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{habit.description}</p>
        )}
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs font-semibold text-orange-400">{streak}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onEdit}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
