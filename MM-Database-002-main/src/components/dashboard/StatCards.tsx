/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Video,
  ArrowUpRight
} from 'lucide-react';

export function StatCards() {
  const stats = [
    { label: 'Total GMV MTD', value: '$148,340', change: '+18.4%', icon: DollarSign, trend: 'up' },
    { label: 'Active Creators', value: '615', change: '+12', icon: Users, trend: 'up' },
    { label: 'Total Orders 7D', value: '4,280', change: '-2.1%', icon: TrendingUp, trend: 'down' },
    { label: 'Post Volume 7D', value: '1,842', change: '+8.2%', icon: Video, trend: 'up' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="stat-card backdrop-blur-md border border-zinc-800 bg-zinc-900/40 p-5 rounded-2xl transition-all hover:bg-zinc-900/60">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold font-mono tracking-tight text-zinc-100">{stat.value}</h3>
            </div>
            <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-500">
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
              stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3 rotate-90" />}
              {stat.change}
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  );
}
