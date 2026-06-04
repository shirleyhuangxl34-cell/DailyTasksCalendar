import { CheckCircle2, CalendarDays, BarChart2, User } from 'lucide-react';

type Tab = 'today' | 'calendar' | 'stats' | 'profile';

const tabs: { id: Tab; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'today', label: '今日', Icon: CheckCircle2 },
  { id: 'calendar', label: '日历', Icon: CalendarDays },
  { id: 'stats', label: '统计', Icon: BarChart2 },
  { id: 'profile', label: '我的', Icon: User },
];

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 pb-safe z-40">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center justify-center pt-3 pb-4 gap-1 transition-all"
          >
            <Icon
              className={`w-5 h-5 transition-all duration-200 ${
                active === id ? 'text-emerald-500 scale-110' : 'text-gray-400'
              }`}
            />
            <span
              className={`text-xs font-medium transition-all duration-200 ${
                active === id ? 'text-emerald-500' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
