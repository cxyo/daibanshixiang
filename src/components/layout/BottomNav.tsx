import { NavLink, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  MoreHorizontal,
  Search,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: CheckCircle2, label: '待办' },
  { to: '/calendar', icon: CalendarDays, label: '日历' },
  { to: '/important', icon: () => <span className="text-lg">★</span>, label: '重要' },
  { to: '/search', icon: Search, label: '搜索' },
  { to: '/more', icon: MoreHorizontal, label: '更多' },
];

export default function BottomNav() {
  const location = useLocation();
  const hidePaths = ['/quadrant'];
  if (hidePaths.includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[var(--color-border)] pb-safe md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full space-y-0.5 ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
