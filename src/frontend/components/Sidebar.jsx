import React from 'react';
import { FileText, LayoutDashboard, ShieldAlert, Users, Home } from 'lucide-react';
import { useLanguage } from '../controllers/LanguageContext.jsx';

export default function Sidebar({ user, currentRoute, onNavigate }) {
  const { t, lang } = useLanguage();

  if (!user) return null;

  const isStudent = user.role === 'student';

  const studentMenuItems = [
    {
      label: t('menuHome'),
      route: '/',
      icon: Home,
    },
    {
      label: t('menuDashboard'),
      route: '/student/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: t('menuForm'),
      route: '/student/register-form',
      icon: FileText,
    },
    {
      label: t('menuStatus'),
      route: '/student/status',
      icon: ShieldAlert,
    },
  ];

  const adminMenuItems = [
    {
      label: t('menuHome'),
      route: '/',
      icon: Home,
    },
    {
      label: t('menuDashboard'),
      route: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: t('menuRegistry'),
      route: '/admin/students',
      icon: Users,
    },
  ];

  const items = isStudent ? studentMenuItems : adminMenuItems;

  return (
    <nav 
      aria-label="Portal Navigation" 
      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 sm:p-2.5 shadow-xs mb-4 sticky top-16 z-30 backdrop-blur-md bg-white/95 dark:bg-zinc-950/95"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 w-full">
        {items.map((item) => {
          const isActive = currentRoute === item.route;
          const IconComponent = item.icon;

          return (
            <button
              key={item.route}
              type="button"
              onClick={() => onNavigate(item.route)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-150 cursor-pointer whitespace-nowrap select-none shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25 active:scale-[0.98]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-50/80 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-850 border border-zinc-200/60 dark:border-zinc-800/80'
              }`}
            >
              <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-500 dark:text-blue-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

