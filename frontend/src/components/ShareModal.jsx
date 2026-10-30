import React, { useState } from 'react';
import { Share2, Copy, Check, Users, Mail, X, Shield, Sparkles } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, trip, onInviteCollaborator }) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [collaborators, setCollaborators] = useState([
    { id: '1', email: 'you@wanderloom.app', role: 'owner', status: 'active' },
    { id: '2', email: 'partner@example.com', role: 'editor', status: 'accepted' }
  ]);
  const [inviting, setInviting] = useState(false);

  if (!isOpen || !trip) return null;

  const shareUrl = `${window.location.origin}/trip/${trip.id}?share=${trip.share_token || 'demo-token'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);

    if (onInviteCollaborator) {
      onInviteCollaborator(trip.id, email, role);
    }

    setTimeout(() => {
      setCollaborators(prev => [
        ...prev,
        { id: Date.now().toString(), email, role, status: 'invited' }
      ]);
      setEmail('');
      setInviting(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Share & Co-Plan</h3>
              <p className="text-xs text-slate-400">Collaborate with fellow travelers on {trip.destination}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shareable Link Box */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Shareable Itinerary Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs truncate outline-none select-all font-mono"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 text-xs font-semibold border border-slate-700 transition-all shrink-0 active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Invite Co-Planner Form */}
        <form onSubmit={handleInvite} className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Invite Co-Traveler via Email
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@wanderlust.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 text-white rounded-xl pl-9 pr-3 py-2 text-xs outline-none transition-colors"
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-2.5 py-2 outline-none"
            >
              <option value="editor">Can Edit</option>
              <option value="viewer">Can View</option>
            </select>
            <button
              type="submit"
              disabled={inviting || !email.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-50"
            >
              {inviting ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </form>

        {/* Active Collaborators List */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Trip Members ({collaborators.length})
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {collaborators.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center space-x-2 truncate">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                    {c.email[0].toUpperCase()}
                  </div>
                  <span className="text-slate-300 truncate">{c.email}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {c.role}
                  </span>
                  {c.status === 'invited' && (
                    <span className="text-[10px] text-amber-400">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
