/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Creator } from '../../types';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Instagram,
  Youtube,
  Twitter,
  Video
} from 'lucide-react';

interface CreatorTableProps {
  creators: Creator[];
  onSelectCreator: (creator: Creator) => void;
  onExport?: () => void;
}

export function CreatorTable({ creators, onSelectCreator, onExport }: CreatorTableProps) {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search creators, discord, handle..." 
            className="w-full pl-10 pr-4 py-2 bg-zinc-950/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-zinc-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 h-10 px-4 text-sm font-medium border border-zinc-800 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button 
            onClick={onExport}
            className="h-10 px-6 text-sm font-bold bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-950/50 border-b border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <th className="px-5 py-3 min-w-[200px]">Name</th>
              <th className="px-5 py-3">Discord</th>
              <th className="px-5 py-3">Tier</th>
              <th className="px-5 py-3">Accounts</th>
              <th className="px-5 py-3">Active</th>
              <th className="px-5 py-3 text-right">1%</th>
              <th className="px-5 py-3 text-right">GMV MTD</th>
              <th className="px-5 py-3 text-right">GMV 7D</th>
              <th className="px-5 py-3 text-right">Posts</th>
              <th className="px-5 py-3 text-right">Lives</th>
              <th className="px-5 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {creators.map((creator) => (
              <tr 
                key={creator.id} 
                className="hover:bg-zinc-800/40 transition-all cursor-pointer group"
                onClick={() => onSelectCreator(creator)}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-400 text-xs shadow-inner">
                      {creator.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-100 leading-none">{creator.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">ID: {creator.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-zinc-400 font-medium">@{creator.discordHandle}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    creator.tier === 'Gold' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                    creator.tier === 'Silver' ? 'bg-zinc-100/10 border-zinc-100/20 text-zinc-300' :
                    creator.tier === 'Platinum' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                    'bg-orange-500/10 border-orange-500/20 text-orange-400'
                  }`}>
                    {creator.tier}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    {creator.accounts.map((acc, idx) => (
                      <div key={idx} title={`${acc.platform}: ${acc.handle}`} className="w-6 h-6 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-500 border border-zinc-700 hover:text-zinc-300 transition-colors">
                        {acc.platform === 'TikTok' && <Video className="w-3.5 h-3.5" />}
                        {acc.platform === 'Instagram' && <Instagram className="w-3.5 h-3.5" />}
                        {acc.platform === 'YouTube' && <Youtube className="w-3.5 h-3.5" />}
                        {acc.platform === 'Twitch' && <Twitter className="w-3.5 h-3.5" />}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${creator.isActive ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-zinc-700 shadow-transparent'}`} />
                    <span className={`text-xs font-bold uppercase tracking-tighter ${creator.isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>{creator.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <p className="text-sm font-mono font-medium text-zinc-400">{creator.commissionRate}%</p>
                </td>
                <td className="px-5 py-4 text-right">
                  <div>
                    <p className="text-sm font-mono font-bold text-zinc-100">${creator.metrics.mtd.gmv.toLocaleString()}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] text-emerald-500 font-bold">12%</span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <p className="text-sm font-mono font-semibold text-zinc-300">${creator.metrics.sevenDay.gmv.toLocaleString()}</p>
                </td>
                <td className="px-5 py-4 text-right">
                  <p className="text-sm font-mono font-medium text-zinc-400">{creator.metrics.mtd.posts}</p>
                </td>
                <td className="px-5 py-4 text-right">
                  <p className="text-sm font-mono font-medium text-zinc-400">{creator.metrics.mtd.lives}</p>
                </td>
                <td className="px-5 py-4">
                  <button className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-all opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-5 border-t border-zinc-800 bg-zinc-950/20 flex items-center justify-between">
        <p className="text-xs text-zinc-500">Showing <span className="font-bold text-zinc-300">{creators.length}</span> creators</p>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-[10px] font-bold border border-zinc-800 rounded-lg bg-zinc-900 text-zinc-500 hover:text-zinc-200 disabled:opacity-30 transition-all tracking-widest" disabled>PREV</button>
          <button className="px-4 py-2 text-[10px] font-bold border border-zinc-800 rounded-lg bg-zinc-900 text-zinc-500 hover:text-zinc-200 transition-all tracking-widest">NEXT</button>
        </div>
      </div>
    </div>
  );
}
