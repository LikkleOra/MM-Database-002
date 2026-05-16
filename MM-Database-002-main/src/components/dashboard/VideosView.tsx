/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Play, 
  Eye, 
  MessageCircle, 
  Heart, 
  MoreVertical,
  ExternalLink,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';

const MOCK_VIDEOS = [
  { id: '1', title: 'Viral Unboxing - Eco Pro', creator: 'Jordan S', views: '2.4M', likes: '142k', comments: '1.2k', platform: 'TikTok', thumbnail: '📦', date: '2h ago' },
  { id: '2', title: 'Why I Use This Daily', creator: 'Sarah K', views: '840k', likes: '62k', comments: '842', platform: 'Instagram', thumbnail: '✨', date: '5h ago' },
  { id: '3', title: 'Extreme Durability Test', creator: 'Alex W', views: '1.2M', likes: '91k', comments: '3.1k', platform: 'YouTube', thumbnail: '🔨', date: '1d ago' },
  { id: '4', title: 'Product Review (Honest)', creator: 'Mia Z', views: '45k', likes: '3.2k', comments: '124', platform: 'TikTok', thumbnail: '🗣️', date: '2d ago' },
  { id: '5', title: 'Summer Lookbook', creator: 'Chris P', views: '210k', likes: '18k', comments: '431', platform: 'Instagram', thumbnail: '☀️', date: '3d ago' },
  { id: '6', title: 'How to Setup Fast', creator: 'Luna R', views: '85k', likes: '7.1k', comments: '210', platform: 'YouTube', thumbnail: '⚙️', date: '4d ago' },
];

export function VideosView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Play className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Content Explorer</h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Real-time cross-platform content monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search content..." 
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all w-48"
            />
          </div>
          <button className="flex items-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-100 transition-all">
            Platform
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_VIDEOS.map((video, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={video.id} 
            className="glass-panel overflow-hidden group cursor-pointer"
          >
            <div className="relative aspect-video bg-zinc-950 flex items-center justify-center text-5xl">
              {video.thumbnail}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                   <Play className="w-6 h-6 fill-current" />
                </div>
              </div>
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-[9px] font-bold text-white uppercase tracking-widest">
                {video.platform}
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-[9px] font-bold text-white uppercase tracking-widest">
                {video.date}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">{video.title}</h3>
                  <p className="text-xs text-zinc-500 font-medium">by {video.creator}</p>
                </div>
                <button className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-4 border-t border-zinc-800 pt-3">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                       <Eye className="w-3.5 h-3.5 text-zinc-500" />
                       <span className="text-[10px] font-bold text-zinc-500">{video.views}</span>
                    </div>
                    <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                       <Heart className="w-3.5 h-3.5 text-red-500/70" />
                       <span className="text-[10px] font-bold text-zinc-500">{video.likes}</span>
                    </div>
                 </div>
                 <button className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-100">
                    <ExternalLink className="w-3.5 h-3.5" />
                 </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-center p-4">
        <button className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:text-zinc-100 hover:border-zinc-600 transition-all">
          Load More Content
        </button>
      </div>
    </div>
  );
}
