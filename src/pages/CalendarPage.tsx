import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useHabits, useMonthCheckins } from '../hooks/useData';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { habits } = useHabits();
  const { checkins } = useMonthCheckins(year, month);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = today.toISOString().split('T')[0];

  const getDateCheckins = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return checkins.filter((c) => c.check_date === dateStr);
  };

  const getDateStr = (day: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const selectedCheckins = selectedDate
    ? checkins.filter((c) => c.check_date === selectedDate)
    : [];
  const selectedHabits = selectedCheckins.map((c) => habits.find((h) => h.id === c.habit_id)).filter(Boolean);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 pb-24">
        <div className="pt-8 pb-6">
          <h1 className="text-2xl font-bold text-gray-900">打卡日历</h1>
          <p className="text-gray-500 text-sm mt-1">查看历史打卡记录</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-base font-semibold text-gray-900">
              {year}年{month}月
            </h2>
            <button
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition"
              disabled={year === today.getFullYear() && month === today.getMonth() + 1}
            >
              <ChevronRight className="w-5 h-5 text-gray-500 disabled:opacity-30" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = getDateStr(day);
              const dayCheckins = getDateCheckins(day);
              const isToday = dateStr === todayStr;
              const isFuture = dateStr > todayStr;
              const isSelected = dateStr === selectedDate;
              const checkinCount = dayCheckins.length;
              const habitCount = habits.length;
              const isPartial = checkinCount > 0 && checkinCount < habitCount;
              const isFull = checkinCount > 0 && (habitCount === 0 || checkinCount >= habitCount);

              return (
                <button
                  key={day}
                  onClick={() => !isFuture && setSelectedDate(isSelected ? null : dateStr)}
                  disabled={isFuture}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all relative ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-md'
                      : isToday
                      ? 'bg-emerald-50 text-emerald-600 font-bold'
                      : isFuture
                      ? 'text-gray-200 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{day}</span>
                  {!isSelected && (isFull || isPartial) && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isFull ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            {[
              { color: 'bg-emerald-400', label: '全部打卡' },
              { color: 'bg-amber-400', label: '部分打卡' },
              { color: 'bg-gray-200', label: '未打卡' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                <span className="text-xs text-gray-400">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected date detail */}
        {selectedDate && (
          <div className="mt-4 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} 打卡记录
            </h3>
            {selectedHabits.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">当天没有打卡记录</p>
            ) : (
              <div className="space-y-2">
                {selectedHabits.map((habit) => habit && (
                  <div key={habit.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: habit.color + '20' }}
                    >
                      {habit.icon}
                    </div>
                    <span className="text-sm text-gray-700 flex-1">{habit.name}</span>
                    <CheckCircle2 className="w-5 h-5" style={{ color: habit.color }} />
                  </div>
                ))}
                {habits.filter((h) => !selectedHabits.find((sh) => sh?.id === h.id)).map((habit) => (
                  <div key={habit.id} className="flex items-center gap-3 opacity-40">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 bg-gray-100">
                      {habit.icon}
                    </div>
                    <span className="text-sm text-gray-400 flex-1 line-through">{habit.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
