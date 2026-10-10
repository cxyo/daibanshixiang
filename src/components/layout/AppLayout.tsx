import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  Grid2X2,
  MoreHorizontal,
  Search,
  Star,
} from 'lucide-react';
import BottomNav from './BottomNav';

const sideNavItems = [
  { to: '/', icon: CheckCircle2, label: '收集箱' },
  { to: '/calendar', icon: CalendarDays, label: '日历' },
  { to: '/important', icon: Star, label: '重要' },
  { to: '/search', icon: Search, label: '搜索' },
  { to: '/quadrant', icon: Grid2X2, label: '四象限' },
  { to: '/more', icon: MoreHorizontal, label: '更多' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full bg-[var(--color-bg)]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[var(--color-border)] h-full">
        <div className="flex items-center h-16 px-6">
          <h1 className="text-xl font-bold text-primary">滴答待办</h1>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {sideNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-primary'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full relative">
        <div className="flex-1 overflow-y-auto md:overflow-hidden">
          <div className="h-full overflow-y-auto pb-20 md:pb-0">{children}</div>
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
