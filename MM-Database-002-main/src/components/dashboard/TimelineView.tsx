/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, Creator } from '../../types';
import { 
  History, 
  Search, 
  Filter, 
  User, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface TimelineViewProps {
  activities: Activity[];
  creators: Creator[];
  onSelectCreator: (id: string) => void;
}

export function TimelineView({ activities, creators, onSelectCreator }: TimelineViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <History className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">System Operational Timeline</h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Real-time intervention log across all creators</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all w-48"
            />
          </div>
          <button className="p-2 border border-zinc-800 rounded-lg bg-zinc-900 text-zinc-500 hover:text-zinc-200">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="glass-panel p-1 overflow-hidden">
        <div className="divide-y divide-zinc-800/50">
          {activities.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">No activities recorded in the system.</p>
            </div>
          ) : (
            activities.map((activity, idx) => {
              const creator = creators.find(c => c.id === activity.creatorId);
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={activity.id} 
                  className="p-5 hover:bg-zinc-800/30 transition-all flex items-start gap-5 group"
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg ${
                      activity.type === 'win' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      activity.type === 'loss' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                      activity.type === 'adjustment' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                      'bg-zinc-800 border-zinc-700 text-zinc-500'
                    }`}>
                      {activity.type === 'win' ? '🏆' : 
                       activity.type === 'loss' ? '⚠️' : 
                       activity.type === 'adjustment' ? '⚙️' : '📝'}
                    </div>
                    <div className="w-px h-full bg-zinc-800 mt-2 min-h-[20px]" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => onSelectCreator(activity.creatorId)}
                          className="text-xs font-bold text-zinc-300 hover:text-emerald-400 transition-colors uppercase tracking-widest flex items-center gap-1.5"
                        >
                          {creator?.name || 'Unknown Creator'}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <span className="text-zinc-700">•</span>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(activity.recordedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                          activity.type === 'win' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          activity.type === 'loss' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                          activity.type === 'adjustment' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                          'bg-zinc-800 border-zinc-700 text-zinc-500'
                        }`}>
                          {activity.type}
                        </span>
                        {activity.impact && (
                           <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                            activity.impact === 'high' ? 'bg-zinc-100 text-black border-zinc-100 shadow-[0_0_10px_rgba(255,255,255,0.2)]' :
                            'bg-zinc-900 border-zinc-800 text-zinc-500'
                          }`}>
                            {activity.impact} Impact
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl group-hover:border-zinc-700 transition-colors">
                      <h4 className="font-bold text-zinc-100 mb-1">{activity.title}</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed">{activity.description}</p>
                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-800">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-500">
                            {activity.recordedBy.charAt(0)}
                          </div>
                          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Logged by System Admin</span>
                        </div>
                        <button 
                          onClick={() => onSelectCreator(activity.creatorId)}
                          className="text-[10px] font-bold text-zinc-500 hover:text-emerald-400 transition-colors tracking-widest uppercase opacity-0 group-hover:opacity-100"
                        >
                          View Creator Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
      
      <div className="flex justify-center p-4">
        <button className="px-6 py-2 border border-zinc-800 rounded-xl text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-100 hover:bg-zinc-900 transition-all">
          Load Historical Data
        </button>
      </div>
    </div>
  );
}
