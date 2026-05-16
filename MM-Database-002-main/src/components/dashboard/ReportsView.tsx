/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Creator } from '../../types';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ReportsViewProps {
  creators: Creator[];
}

export function ReportsView({ creators }: ReportsViewProps) {
  const gmvByTier = [
    { tier: 'Platinum', gmv: creators.filter(c => c.tier === 'Platinum').reduce((acc, c) => acc + c.metrics.mtd.gmv, 0) },
    { tier: 'Gold', gmv: creators.filter(c => c.tier === 'Gold').reduce((acc, c) => acc + c.metrics.mtd.gmv, 0) },
    { tier: 'Silver', gmv: creators.filter(c => c.tier === 'Silver').reduce((acc, c) => acc + c.metrics.mtd.gmv, 0) },
    { tier: 'Bronze', gmv: creators.filter(c => c.tier === 'Bronze').reduce((acc, c) => acc + c.metrics.mtd.gmv, 0) },
  ];

  const totalGMV = creators.reduce((acc, c) => acc + c.metrics.mtd.gmv, 0);
  const totalPosts = creators.reduce((acc, c) => acc + c.metrics.mtd.posts, 0);
  const activeRate = (creators.filter(c => c.isActive).length / creators.length) * 100;

  const COLORS = ['#A855F7', '#EAB308', '#D4D4D8', '#FB923C'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Performance Reports</h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Aggregate metrics and tier analysis</p>
          </div>
        </div>
        <button className="flex items-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-100 transition-all">
          Last 30 Days
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total GMV MTD', value: `$${totalGMV.toLocaleString()}`, icon: DollarSign, trend: '+14.2%', color: 'text-emerald-500' },
          { label: 'Avg. Comm Rate', value: '18.4%', icon: TrendingUp, trend: '+0.4%', color: 'text-blue-500' },
          { label: 'Total Content', value: totalPosts.toLocaleString(), icon: BarChart3, trend: '+28%', color: 'text-purple-500' },
          { label: 'Activation Rate', value: `${activeRate.toFixed(1)}%`, icon: Users, trend: '+2.1%', color: 'text-yellow-500' }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="glass-panel p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                <ArrowUpRight className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-zinc-100 font-mono italic tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">GMV Distrubtion by Tier</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gmvByTier} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="tier" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                   tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="gmv" radius={[6, 6, 0, 0]} barSize={40}>
                  {gmvByTier.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Tier Efficiency Leaderboard</h3>
          <div className="flex-1 space-y-4">
            {gmvByTier.sort((a, b) => b.gmv - a.gmv).map((tier, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl group hover:border-zinc-700 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">{tier.tier} Tier</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tight">
                        {creators.filter(c => c.tier === tier.tier).length} Active Creators
                      </p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-mono font-bold text-emerald-500">${tier.gmv.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-600 font-bold">AVG: ${(tier.gmv / (creators.filter(c => c.tier === tier.tier).length || 1)).toLocaleString()}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
