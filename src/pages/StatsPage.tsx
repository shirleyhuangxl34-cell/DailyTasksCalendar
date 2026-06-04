import { useStats, useHabits, useCheckins } from '../hooks/useData';
import { TrendingUp, Flame, Award, CheckCircle } from 'lucide-react';

const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function getWeekDayLabel(dateStr: string) {
  const day = new Date(dateStr + 'T12:00:00').getDay();
  return DAY_LABELS[day === 0 ? 6 : day - 1];
}

export default function StatsPage() {
  const stats = useStats();
  const { habits } = useHabits();
  const { checkins } = useCheckins();

  const maxCount = Math.max(...stats.weeklyData.map((d) => d.count), 1);

  const cards = [
    { label: '总打卡次数', value: stats.totalCheckins, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: '当前连续', value: `${stats.currentStreak}天`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: '本周完成率', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '习惯数量', value: habits.length, icon: Award, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const todayCheckedCount = checkins.length;
  const totalHabits = habits.length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 pb-24">
        <div className="pt-8 pb-6">
          <h1 className="text-2xl font-bold text-gray-900">数据统计</h1>
          <p className="text-gray-500 text-sm mt-1">坚持的力量，数字见证成长</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              </div>
            );
          })}
        </div>

        {/* Today summary */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">今日完成情况</h3>
          {totalHabits === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">暂无习惯数据</p>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const done = checkins.some((c) => c.habit_id === habit.id);
                return (
                  <div key={habit.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: habit.color + '20' }}
                    >
                      {habit.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{habit.name}</span>
                        <span className="text-xs text-gray-400">{done ? '已完成' : '未完成'}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: done ? '100%' : '0%',
                            backgroundColor: habit.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">完成率</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {totalHabits > 0 ? Math.round((todayCheckedCount / totalHabits) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Weekly bar chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-1">近7天打卡</h3>
          <p className="text-xs text-gray-400 mb-5">每天完成的打卡次数</p>
          <div className="flex items-end justify-between gap-2 h-32">
            {stats.weeklyData.map((d, i) => {
              const height = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
              const isToday = i === 6;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">{d.count || ''}</span>
                  <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                    <div
                      className={`w-full rounded-xl transition-all duration-500 ${
                        isToday ? 'bg-emerald-400' : d.count > 0 ? 'bg-emerald-200' : 'bg-gray-100'
                      }`}
                      style={{ height: `${Math.max(height, d.count > 0 ? 15 : 8)}%` }}
                    />
                  </div>
                  <span className={`text-xs ${isToday ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                    {getWeekDayLabel(d.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak motivation */}
        {stats.currentStreak > 0 && (
          <div className="mt-4 bg-gradient-to-r from-orange-400 to-amber-400 rounded-3xl p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔥</div>
              <div>
                <p className="font-bold text-lg">连续打卡 {stats.currentStreak} 天！</p>
                <p className="text-orange-50 text-sm">坚持就是胜利，继续加油！</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
