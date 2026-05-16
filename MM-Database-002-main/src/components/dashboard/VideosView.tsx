/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Play, Eye, DollarSign, MoreVertical, ExternalLink, Search, ChevronDown, Video } from 'lucide-react';
import { motion } from 'motion/react';

const PLATFORMS = ['All', 'TikTok', 'Instagram', 'YouTube', 'Facebook'] as const;

const PLATFORM_COLORS: Record<string, string> = {
  TikTok: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
  Instagram: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  YouTube: 'bg-red-500/10 border-red-500/20 text-red-400',
  Facebook: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
};

export function VideosView() {
  const videosData = useQuery(api.videos.list);
  const isLoading = videosData === undefined;
  const videos = videosData ?? [];

  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState<string>('All');
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return videos.filter((v) => {
      const matchesSearch = !q || v.title.toLowerCase().includes(q) || v.creatorName.toLowerCase().includes(q);
      const matchesPlatform = platform === 'All' || v.platform === platform;
      return matchesSearch && matchesPlatform;
    });
  }, [videos, search, platform]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Play className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Content Explorer</h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
              {isLoading ? 'Loading...' : `${videos.length} videos tracked`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search content..."
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all w-48 placeholder:text-zinc-600"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowPlatformMenu((v) => !v)}
              className={`flex items-center gap-2 h-10 px-4 border rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                platform !== 'All'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {platform}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showPlatformMenu && (
              <div className="absolute right-0 top-12 w-40 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-10 overflow-hidden">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPlatform(p); setShowPlatformMenu(false); }}
                    className={`w-full px-4 py-2.5 text-xs font-bold text-left uppercase tracking-widest transition-colors ${
                      platform === p ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-zinc-800" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
            <Video className="w-7 h-7 text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-zinc-400 tracking-tight">No videos tracked yet</h3>
          <p className="text-zinc-600 text-sm mt-2 max-w-sm font-medium">
            Videos will appear here once creators start submitting content or platform integrations are connected.
          </p>
        </div>
      )}

      {/* No filter results */}
      {!isLoading && videos.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <p className="text-zinc-500 text-sm font-medium">No videos match your search or filter.</p>
          <button onClick={() => { setSearch(''); setPlatform('All'); }} className="mt-2 text-emerald-500 text-xs font-bold hover:text-emerald-400">
            Clear filters
          </button>
        </div>
      )}

      {/* Video grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((video, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={video.id}
              className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden group cursor-pointer hover:border-zinc-700 transition-all"
            >
              <div className="relative aspect-video bg-zinc-950 flex items-center justify-center">
                {video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <Video className="w-10 h-10 text-zinc-700" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                </div>
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[9px] font-bold border uppercase tracking-widest ${PLATFORM_COLORS[video.platform] ?? 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                  {video.platform}
                </div>
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                  video.status === 'done' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  video.status === 'processing' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                  'bg-zinc-800 border-zinc-700 text-zinc-500'
                }`}>
                  {video.status}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-zinc-100 truncate group-hover:text-emerald-400 transition-colors">{video.title}</h3>
                    <p className="text-xs text-zinc-500 font-medium">by {video.creatorName}</p>
                  </div>
                  <button className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500 shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4 border-t border-zinc-800 pt-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="text-[10px] font-bold text-zinc-500">{video.views.toLocaleString()}</span>
                    </div>
                    {video.revenue > 0 && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500">${video.revenue.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <button className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-100">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
