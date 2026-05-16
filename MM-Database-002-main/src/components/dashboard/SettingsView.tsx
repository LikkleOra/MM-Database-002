/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Settings as SettingsIcon, Shield, Bell, Smartphone, ExternalLink } from 'lucide-react';

export function SettingsView() {
  const { user } = useUser();
  const currentUser = useQuery(api.users.me);

  const displayName = user?.fullName || user?.firstName || 'Unknown';
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const role = currentUser?.role ?? 'viewer';
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.firstName?.[0]?.toUpperCase() ?? '?';

  const roleLabel: Record<string, string> = {
    admin: 'System Super Admin',
    manager: 'Manager',
    viewer: 'Viewer (Read Only)',
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">System Settings</h2>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Account and operational configuration</p>
        </div>
      </div>

      {/* Account */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 space-y-2">
          <h3 className="text-sm font-bold text-zinc-200">Account Configuration</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Your identity and access level within the system.</p>
        </div>
        <div className="col-span-2">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-4">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={displayName} className="w-16 h-16 rounded-2xl object-cover border border-zinc-800" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-zinc-800 flex items-center justify-center text-xl font-bold text-emerald-400">
                  {initials}
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-zinc-200">{displayName}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{email}</p>
                <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest font-bold">
                  Managed by Clerk — edit profile at clerk.com
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Display Name</label>
                <div className="w-full h-10 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-300 flex items-center">
                  {displayName}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Access Role</label>
                <div className="w-full h-10 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-400 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  {roleLabel[role] ?? role}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-zinc-800">
        <div className="col-span-1 space-y-2">
          <h3 className="text-sm font-bold text-zinc-200">External API Keys</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Platform integrations for content and GMV tracking.</p>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 mt-2">
            <Smartphone className="w-3.5 h-3.5" />
            Configure in your Convex dashboard
          </div>
        </div>
        <div className="col-span-2">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
            {[
              { name: 'TikTok Shop API', connected: false },
              { name: 'Instagram Graph API', connected: false },
              { name: 'YouTube Data API V3', connected: false },
            ].map((apiItem, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-zinc-200">{apiItem.name}</p>
                  <p className="text-[10px] text-zinc-600 font-mono tracking-widest italic">Not configured</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border bg-zinc-800 border-zinc-700 text-zinc-500">
                    Pending
                  </div>
                  <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-zinc-800">
        <div className="col-span-1 space-y-2">
          <h3 className="text-sm font-bold text-zinc-200">Notifications</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">System event alerts — coming in a future update.</p>
        </div>
        <div className="col-span-2">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
            <div className="space-y-4">
              {[
                { label: 'GMV Win Events', desc: 'Notify when a creator hits a daily GMV win threshold.' },
                { label: 'System Interventions', desc: 'Notify when a team member logs a high-impact adjustment.' },
                { label: 'Weekly Performance Digest', desc: 'Email a summary of tier shifts and ranking changes.' },
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-zinc-400">{pref.label}</p>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{pref.desc}</p>
                  </div>
                  <div className="w-10 h-5 bg-zinc-800 border border-zinc-700 rounded-full relative cursor-not-allowed opacity-50" title="Coming soon">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-zinc-600 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[10px] text-zinc-600 font-bold uppercase tracking-widest text-center">Notification preferences coming in Phase 4</p>
          </div>
        </div>
      </div>
    </div>
  );
}
