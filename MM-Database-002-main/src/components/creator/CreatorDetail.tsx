/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Creator, Activity } from '../../types';
import { 
  X, 
  Plus, 
  MessageSquare, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Trophy,
  AlertCircle,
  Settings,
  Calendar,
  Video,
  Instagram,
  Youtube
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreatorDetailProps {
  creator: Creator;
  activities: Activity[];
  userRole: 'admin' | 'manager' | 'viewer';
  onClose: () => void;
  onAddActivity: (creatorId: string) => void;
}

export function CreatorDetail({ creator, activities, userRole, onClose, onAddActivity }: CreatorDetailProps) {
  const canWrite = userRole === 'admin' || userRole === 'manager';
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full sm:w-[600px] bg-zinc-950 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col border-l border-zinc-800"
    >
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
          <div className="h-6 w-px bg-zinc-800" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Creator Profile</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Header Section */}
        <section className="p-8 border-b border-zinc-800 bg-gradient-to-br from-zinc-900/50 to-zinc-950">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl flex items-center justify-center text-4xl font-serif italic text-zinc-700">
                {creator.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">{creator.name}</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    creator.tier === 'Gold' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                    creator.tier === 'Silver' ? 'bg-zinc-100/10 border-zinc-100/20 text-zinc-300' :
                    creator.tier === 'Platinum' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                    'bg-orange-500/10 border-orange-500/20 text-orange-400'
                  }`}>
                    {creator.tier}
                  </span>
                </div>
                <p className="text-zinc-500 font-medium mt-1">@{creator.discordHandle} <span className="mx-2 text-zinc-800">•</span> Joined {new Date(creator.joinedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
              creator.isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-900/50 border-zinc-800 text-zinc-600'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${creator.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`} />
              {creator.isActive ? 'Status: Active' : 'Status: Inactive'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-10">
            <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl shadow-inner">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">GMV MTD</p>
              <p className="text-2xl font-bold font-mono text-zinc-100">${creator.metrics.mtd.gmv.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl shadow-inner">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Posts 7D</p>
              <p className="text-2xl font-bold font-mono text-zinc-100">{creator.metrics.sevenDay.posts}</p>
            </div>
            <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl shadow-inner">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Comm. Rate</p>
              <p className="text-2xl font-bold font-mono text-zinc-100">{creator.commissionRate}%</p>
            </div>
          </div>
        </section>

        {/* Action Section */}
        <section className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              Operational History
            </h3>
            {canWrite && (
              <button
                onClick={() => onAddActivity(creator.id)}
                className="flex items-center gap-2 h-9 px-4 bg-emerald-500 text-black text-[10px] font-bold rounded-lg hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] uppercase tracking-widest"
              >
                <Plus className="w-3.5 h-3.5" />
                New Log Entry
              </button>
            )}
          </div>

          <div className="space-y-6">
            {activities.length === 0 ? (
              <div className="p-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/30">
                <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">No system activities recorded</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="relative pl-8 pb-8 border-l border-zinc-800 last:pb-0">
                  <div className={`absolute left-[-4.5px] top-0 w-2 h-2 rounded-full ring-4 ring-zinc-950 ${
                    activity.type === 'win' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                    activity.type === 'loss' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                    activity.type === 'adjustment' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                    'bg-zinc-600'
                  }`} />
                  
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3 h-3 text-zinc-700" />
                      {new Date(activity.recordedAt).toLocaleString()}
                    </p>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                      activity.type === 'win' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      activity.type === 'loss' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      activity.type === 'adjustment' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                      'bg-zinc-800 border-zinc-700 text-zinc-500'
                    }`}>
                      {activity.type}
                    </span>
                  </div>
                  
                  <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
                    <p className="font-bold text-zinc-100 mb-2 leading-tight">{activity.title}</p>
                    <p className="text-sm text-zinc-400 leading-relaxed font-medium">{activity.description}</p>
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-500">
                          {activity.recordedBy.charAt(0)}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Logged by System Admin</span>
                      </div>
                      {activity.impact && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                          activity.impact === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                          activity.impact === 'medium' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                          'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                          <AlertCircle className="w-3 h-3" />
                          {activity.impact} Impact
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        
        {/* Account Linking Section */}
        <section className="p-8 bg-zinc-950/40 backdrop-blur-sm border-t border-zinc-800">
           <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Platform Integrations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {creator.accounts.map((acc, idx) => (
                <a 
                  key={idx} 
                  href={acc.url}
                  className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 hover:border-zinc-700 transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-100 transition-colors">
                       {acc.platform === 'TikTok' && <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                       {acc.platform === 'Instagram' && <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                       {acc.platform === 'YouTube' && <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                       {acc.platform === 'Twitch' && <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{acc.platform}</p>
                      <p className="text-sm font-bold text-zinc-200">@{acc.handle}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-700 group-hover:text-zinc-100 transition-colors" />
                </a>
              ))}
              <button className="p-4 border-2 border-dashed border-zinc-800 bg-zinc-950/20 rounded-2xl hover:bg-zinc-950/50 hover:border-zinc-600 transition-all group flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400">Add Account</span>
              </button>
            </div>
        </section>
      </div>

      <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-3">
        <button 
          onClick={onClose}
          className="px-6 h-10 text-[10px] font-bold text-zinc-500 hover:text-zinc-100 uppercase tracking-widest transition-all"
        >
          Close Detail
        </button>
      </div>
    </motion.div>
  );
}
