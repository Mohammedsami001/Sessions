"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { profileService } from "../../lib/container";
import type { Profile } from "../../lib/types";
import { computeLevelProgress, formatFocusHours } from "../../lib/types";
import { Footer } from "@/components/ui/footer";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // Use getUser() — validates JWT with the server (reliable)
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user) {
          setHasSession(true);
          const p = await profileService.ensureProfile(user.id, user.email || undefined, user.user_metadata);
          if (p) { setProfile(p); setDisplayName(p.display_name); }
        }
      } catch (err) {
        console.error('Profile init error:', err);
      }
      setLoading(false);
    }
    init();
  }, []);

  const handleSave = async () => {
    if (!displayName.trim() || !profile) return;
    setSaving(true);
    const updated = await profileService.updateProfile(profile.id, { display_name: displayName.trim() });
    if (updated) setProfile(updated);
    setEditing(false);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!profile) return;
    if (deleteConfirmText.toLowerCase() !== "delete my account") {
      alert("Please type 'delete my account' exactly to confirm.");
      return;
    }
    setDeleting(true);
    const success = await profileService.deleteAccount(profile.id);
    if (success) {
      window.location.href = "/";
    } else {
      alert("Failed to delete account. Please try again.");
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
    }
  };

  const levelInfo = profile ? computeLevelProgress(profile.exp) : { level: 0, currentExp: 0, nextLevelExp: 100, progress: 0 };

  if (loading) return <main className="dashboard-wrapper"><p style={{ textAlign: 'center', color: 'var(--text-gray)', marginTop: '100px' }}>Loading profile...</p></main>;
  if (!hasSession) return <main className="dashboard-wrapper"><p style={{ textAlign: 'center', color: 'var(--text-gray)', marginTop: '100px' }}>Not authenticated. <Link href="/login" style={{ color: 'var(--gold)' }}>Sign in</Link></p></main>;
  if (!profile) return <main className="dashboard-wrapper"><p style={{ textAlign: 'center', color: 'var(--text-gray)', marginTop: '100px' }}>Setting up your profile...</p></main>;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main className="dashboard-wrapper flex-1" style={{ maxWidth: '700px', width: '100%' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-gray)', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>← <span style={{ color: 'white' }}>Dashboard</span></Link>
        </div>

      {/* Profile Card */}
      <div className="bento-card" style={{ gridColumn: 'span 12', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div className="dashboard-avatar" style={{ width: '72px', height: '72px', fontSize: '28px', borderRadius: '16px' }}>{profile.display_name.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            {editing ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="auth-input" style={{ marginBottom: 0, maxWidth: '300px' }} />
                <button onClick={handleSave} disabled={saving} style={{ background: 'var(--gold)', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>{saving ? '...' : 'Save'}</button>
                <button onClick={() => { setEditing(false); setDisplayName(profile.display_name); }} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-gray)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
              </div>
            ) : (
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {profile.display_name}
                  <button onClick={() => setEditing(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-gray)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                </h1>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-gray)' }}>Member since {new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
          <div className="dashboard-badge">✦ LEVEL {levelInfo.level} ✦</div>
        </div>

        {/* EXP Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-gray)', marginBottom: '6px' }}>
            <span>Level {levelInfo.level}</span>
            <span>{levelInfo.currentExp} / {levelInfo.nextLevelExp} EXP</span>
            <span>Level {levelInfo.level + 1}</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${levelInfo.progress}%`, background: 'linear-gradient(90deg, var(--orange), var(--gold))', borderRadius: '4px', transition: 'width 0.5s' }} />
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'Total Focus', value: formatFocusHours(profile.total_focus_seconds), color: 'white' },
            { label: 'Total EXP', value: profile.exp.toLocaleString(), color: 'var(--gold)' },
            { label: 'Sessions', value: profile.total_sessions.toString(), color: 'var(--orange)' },
            { label: 'Streak', value: `${profile.streak_days} days`, color: '#10B981' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-gray)', marginTop: '4px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bento-card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FCA5A5', marginBottom: '12px' }}>⚠ Danger Zone</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-gray)', marginBottom: '16px' }}>Permanently delete your account, all tasks, messages, and study data. This action cannot be undone.</p>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Delete Account</button>
        ) : (
          <div>
            <p style={{ fontSize: '12px', color: '#FCA5A5', marginBottom: '8px' }}>Type <strong>DELETE</strong> to confirm:</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="DELETE" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 12px', borderRadius: '6px', color: 'white', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', outline: 'none', width: '120px' }} />
              <button onClick={handleDelete} disabled={deleteConfirmText !== 'DELETE' || deleting} style={{ background: deleteConfirmText === 'DELETE' ? '#EF4444' : 'rgba(239,68,68,0.2)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed', opacity: deleteConfirmText === 'DELETE' ? 1 : 0.5 }}>{deleting ? 'Deleting...' : 'Confirm Delete'}</button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-gray)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </main>
    <Footer />
  </div>
  );
}
