/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Users,
  History,
  Video,
  Target,
  MessageSquare,
  Youtube,
  Zap,
  BarChart3,
  Settings,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';
import { useUser, useClerk } from '@clerk/clerk-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const NAV_ITEMS = [
  { id: 'timeline', label: 'Timeline', icon: History },
  { id: 'database', label: 'Creator Database', icon: Users },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'tracker', label: 'Tracker', icon: Target },
  { id: 'discord', label: 'Discord Tracking', icon: MessageSquare },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'gmv', label: 'GMV Max Tests', icon: Zap },
  { id: 'analysis', label: 'Account Analysis', icon: BarChart3 },
  { id: 'simulator', label: 'Simulator', icon: LayoutDashboard },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.firstName?.[0]?.toUpperCase() ?? '?';

  const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || 'User';
  const email = user?.primaryEmailAddress?.emailAddress ?? '';

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-md h-screen flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-black font-bold">M</div>
          MM Database
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Navigation</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === item.id 
                ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
        
        <div className="px-3 mt-6 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">System</div>
        <button
          onClick={() => onViewChange('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            activeView === 'settings' 
              ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
              : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </nav>
      
      <div className="p-4 border-t border-zinc-800 space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
              {initials}
            </div>
          )}
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-zinc-200">{displayName}</p>
            <p className="text-[10px] text-zinc-500 truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
