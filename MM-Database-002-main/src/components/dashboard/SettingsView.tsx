/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Smartphone,
  ExternalLink,
  Save,
  RefreshCcw
} from 'lucide-react';
import { motion } from 'motion/react';

export function SettingsView() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight">System Settings</h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Configure operational parameters and account preferences</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 h-10 px-4 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-100 transition-all">
              <RefreshCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button className="flex items-center gap-2 h-10 px-6 bg-emerald-500 text-black text-[10px] font-bold rounded-lg hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] uppercase tracking-widest">
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 space-y-2">
          <h3 className="text-sm font-bold text-zinc-200">Account Configuration</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Manage your personal profile and administrative credentials.</p>
        </div>
        <div className="col-span-2 space-y-4">
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-500">AD</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-zinc-200">Profile Image</p>
                <p className="text-xs text-zinc-500 mb-3">Upload a high-resolution avatar for your internal records.</p>
                <button className="px-4 py-1.5 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-100 hover:bg-zinc-900 transition-all">Change Avatar</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Display Name</label>
                  <input type="text" defaultValue="Admin User" className="w-full h-10 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-200" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Access Role</label>
                  <div className="w-full h-10 px-4 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-500 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    System Super Admin
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-zinc-800">
        <div className="col-span-1 space-y-2">
          <h3 className="text-sm font-bold text-zinc-200">External API Keys</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Connect your internal system to the relevant platform APIs.</p>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 mt-2">
            <Smartphone className="w-3.5 h-3.5" />
            V3 CLOUD API STATUS: ONLINE
          </div>
        </div>
        <div className="col-span-2 space-y-4">
          <div className="glass-panel p-6 space-y-6">
            {[
              { name: 'TikTok Shop API', key: '••••••••••••••••••••••••••••', connected: true },
              { name: 'Instagram Graph API', key: '••••••••••••••••••••', connected: true },
              { name: 'YouTube Data API V3', key: '••••••••••••••••••••••••', connected: false }
            ].map((api, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl">
                 <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-200">{api.name}</p>
                    <p className="text-xs font-mono text-zinc-600 italic tracking-widest">{api.key}</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                      api.connected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                      {api.connected ? 'Connected' : 'Disconnected'}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-zinc-800">
        <div className="col-span-1 space-y-2">
          <h3 className="text-sm font-bold text-zinc-200">Notifications</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">Choose which system events trigger mobile and desktop alerts.</p>
        </div>
        <div className="col-span-2 space-y-4">
          <div className="glass-panel p-6">
            <div className="space-y-4">
               {[
                 { label: 'GMV Win Events', desc: 'Notify when a creator hits a daily GMV win threshold.' },
                 { label: 'System Interventions', desc: 'Notify when a team member logs a high-impact adjustment.' },
                 { label: 'Weekly Performance Digest', desc: 'Email a summary of tier shifts and ranking changes.' }
               ].map((pref, i) => (
                 <div key={i} className="flex items-center justify-between group">
                    <div className="space-y-0.5">
                       <p className="text-sm font-bold text-zinc-200">{pref.label}</p>
                       <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{pref.desc}</p>
                    </div>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full" />
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
