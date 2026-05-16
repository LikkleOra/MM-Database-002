/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth, useUser, RedirectToSignIn } from '@clerk/clerk-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import type { Id } from '../convex/_generated/dataModel';
import { Sidebar } from './components/layout/Sidebar';
import { StatCards } from './components/dashboard/StatCards';
import { CreatorTable } from './components/dashboard/CreatorTable';
import { CreatorDetail } from './components/creator/CreatorDetail';
import { TimelineView } from './components/dashboard/TimelineView';
import { ReportsView } from './components/dashboard/ReportsView';
import { SettingsView } from './components/dashboard/SettingsView';
import { VideosView } from './components/dashboard/VideosView';
import { ActivityType } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, X, AlertCircle, CheckCircle } from 'lucide-react';

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen bg-zinc-950 items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const { user } = useUser();

  const upsertUser = useMutation(api.users.upsert);
  const seedCreators = useMutation(api.creators.seed);

  useEffect(() => {
    upsertUser();
    seedCreators();
  }, []);

  // Queries — undefined while loading
  const creatorsData = useQuery(api.creators.list);
  const activitiesData = useQuery(api.activities.listAll);
  const currentUser = useQuery(api.users.me);
  const createActivity = useMutation(api.activities.create);

  const isLoading = creatorsData === undefined || activitiesData === undefined;
  const creators = creatorsData ?? [];
  const activities = activitiesData ?? [];
  const userRole = currentUser?.role ?? 'viewer';

  const [activeView, setActiveView] = useState('database');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form field errors
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; description?: string }>({});

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const firstName = user?.firstName || 'MM';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const selectedCreator = useMemo(
    () => creators.find((c) => c.id === selectedCreatorId) || null,
    [creators, selectedCreatorId]
  );

  const creatorActivities = useMemo(
    () => activities.filter((a) => a.creatorId === selectedCreatorId),
    [activities, selectedCreatorId]
  );

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  function validateActivityForm(title: string, description: string) {
    const errors: { title?: string; description?: string } = {};
    if (title.trim().length < 3) errors.title = 'Title must be at least 3 characters.';
    if (description.trim().length < 10) errors.description = 'Description must be at least 10 characters.';
    return errors;
  }

  const handleAddActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCreatorId || isSaving) return;

    const formData = new FormData(e.currentTarget);
    const title = (formData.get('title') as string) ?? '';
    const description = (formData.get('description') as string) ?? '';
    const impact = (formData.get('impact') as 'high' | 'medium' | 'low') || undefined;

    const errors = validateActivityForm(title, description);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSaveError(null);
    setIsSaving(true);

    try {
      await createActivity({
        creatorId: selectedCreatorId as Id<'creators'>,
        type: formData.get('type') as ActivityType,
        title,
        description,
        impact,
      });
      setShowAddActivityModal(false);
      showToast('success', 'Activity logged successfully.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  function openModal() {
    setSaveError(null);
    setFieldErrors({});
    setShowAddActivityModal(true);
  }

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Discord', 'Tier', 'Status', 'MTD GMV', '7D GMV', 'Joined At'];
    const rows = creators.map((c) => [
      c.id, c.name, c.discordHandle, c.tier,
      c.isActive ? 'Active' : 'Inactive',
      c.metrics.mtd.gmv, c.metrics.sevenDay.gmv, c.joinedAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `mm_database_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 font-sans text-zinc-100">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="flex-1 ml-64 p-8">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-100 tracking-tight">
              {activeView === 'database' ? `${greeting}, ${firstName}` :
               activeView === 'timeline' ? 'Operational Timeline' :
               activeView === 'reports' ? 'Performance Reports' :
               activeView.charAt(0).toUpperCase() + activeView.slice(1)}
            </h1>
            <p className="text-zinc-500 mt-1 font-medium text-sm">
              {activeView === 'database' ? today :
               activeView === 'timeline' ? 'Reviewing cross-creator operational history and system interventions.' :
               'Analyzing aggregate team performance and tier metrics.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 bg-zinc-900 border rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-xl ${
              isLoading ? 'border-zinc-700 text-zinc-600' : 'border-zinc-800 text-zinc-500'
            }`}>
              {isLoading ? 'Loading...' : 'Live'}
            </div>
          </div>
        </header>

        {/* Loading skeleton for database view */}
        {activeView === 'database' && isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-zinc-900/40 border border-zinc-800 rounded-2xl animate-pulse" />
              ))}
            </div>
            <div className="h-96 bg-zinc-900/40 border border-zinc-800 rounded-2xl animate-pulse" />
          </div>
        )}

        {activeView === 'database' && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <StatCards creators={creators} />
            <CreatorTable
              creators={creators}
              onSelectCreator={(c) => setSelectedCreatorId(c.id)}
              onExport={userRole !== 'viewer' ? handleExportCSV : undefined}
            />
          </motion.div>
        )}

        {activeView === 'timeline' && (
          <TimelineView
            activities={activities}
            creators={creators}
            onSelectCreator={(id) => setSelectedCreatorId(id)}
          />
        )}

        {activeView === 'reports' && <ReportsView creators={creators} />}
        {activeView === 'settings' && <SettingsView />}
        {activeView === 'videos' && <VideosView />}

        {activeView !== 'database' && activeView !== 'timeline' && activeView !== 'reports' && activeView !== 'settings' && activeView !== 'videos' && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-black mb-6 font-bold text-2xl">M</div>
            <h2 className="text-2xl font-bold text-zinc-100 italic font-serif tracking-tight">Module Under Development</h2>
            <p className="text-zinc-500 mt-2 max-w-sm font-medium leading-relaxed">We are currently building the {activeView} module.</p>
            <button onClick={() => setActiveView('database')} className="mt-8 px-8 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] uppercase tracking-widest text-xs">
              Back to Database
            </button>
          </div>
        )}
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl text-sm font-bold ${
              toast.type === 'success'
                ? 'bg-zinc-900 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-900 border-red-500/30 text-red-400'
            }`}
          >
            {toast.type === 'success'
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creator Detail Drawer */}
      <AnimatePresence>
        {selectedCreator && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedCreatorId(null)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-40"
            />
            <CreatorDetail
              creator={selectedCreator}
              activities={creatorActivities}
              userRole={userRole}
              onClose={() => setSelectedCreatorId(null)}
              onAddActivity={() => openModal()}
            />
          </>
        )}
      </AnimatePresence>

      {/* Add Activity Modal */}
      <AnimatePresence>
        {showAddActivityModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddActivityModal(false)}
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <form onSubmit={handleAddActivity} noValidate>
                <div className="p-8 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <Plus className="w-6 h-6 text-black" />
                    </div>
                    Record System Activity
                  </h3>
                  <button type="button" onClick={() => setShowAddActivityModal(false)} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
                    <X className="w-6 h-6 text-zinc-500" />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Context</label>
                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm font-bold text-zinc-400 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      {selectedCreator?.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="type" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Event Type</label>
                      <select id="type" name="type" required className="w-full h-12 px-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer">
                        <option value="win">Win</option>
                        <option value="loss">Loss</option>
                        <option value="observation">Observation</option>
                        <option value="adjustment">Adjustment</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="impact" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Impact Level</label>
                      <select id="impact" name="impact" className="w-full h-12 px-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm font-bold text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer">
                        <option value="low">Low Impact</option>
                        <option value="medium">Medium Impact</option>
                        <option value="high">High Impact</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Short Summary / Title</label>
                    <input
                      id="title" name="title" type="text"
                      onChange={() => fieldErrors.title && setFieldErrors((e) => ({ ...e, title: undefined }))}
                      placeholder="e.g. TikTok video trending"
                      className={`w-full h-12 px-4 bg-zinc-900 border rounded-2xl text-sm font-bold text-zinc-100 focus:outline-none focus:ring-2 transition-all placeholder:text-zinc-700 ${
                        fieldErrors.title ? 'border-red-500/50 focus:ring-red-500/20' : 'border-zinc-800 focus:ring-emerald-500/20'
                      }`}
                    />
                    {fieldErrors.title && <p className="mt-1.5 px-1 text-[10px] font-bold text-red-400">{fieldErrors.title}</p>}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Detailed Observations</label>
                    <textarea
                      id="description" name="description" rows={4}
                      onChange={() => fieldErrors.description && setFieldErrors((e) => ({ ...e, description: undefined }))}
                      placeholder="Add specific details about the event..."
                      className={`w-full px-4 py-3 bg-zinc-900 border rounded-2xl text-sm font-bold text-zinc-100 focus:outline-none focus:ring-2 transition-all resize-none placeholder:text-zinc-700 ${
                        fieldErrors.description ? 'border-red-500/50 focus:ring-red-500/20' : 'border-zinc-800 focus:ring-emerald-500/20'
                      }`}
                    />
                    {fieldErrors.description && <p className="mt-1.5 px-1 text-[10px] font-bold text-red-400">{fieldErrors.description}</p>}
                  </div>

                  {saveError && (
                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-red-400 font-bold">{saveError}</p>
                    </div>
                  )}

                  <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-500/80 leading-relaxed font-bold uppercase tracking-wide">Warning: This entry will be logged permanently and visible to all authorized management personnel.</p>
                  </div>
                </div>

                <div className="p-8 bg-zinc-900/50 border-t border-zinc-800 flex justify-end gap-4">
                  <button type="button" onClick={() => setShowAddActivityModal(false)} className="px-6 h-12 text-[10px] font-bold text-zinc-500 hover:text-zinc-100 uppercase tracking-widest transition-all">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 h-12 bg-emerald-500 text-black text-[10px] font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Log Entry'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
