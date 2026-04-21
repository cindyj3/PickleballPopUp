import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import type { HistoryEntry } from '../types';

function formatTime(t: string | undefined): string {
  if (!t) return '';
  try {
    return new Date(t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch { return t; }
}

export default function GameHistory() {
  const { data: games, loading, error } = useApi<HistoryEntry[]>('/api/games/history');
  const { username } = useAuth();
  const [filter, setFilter] = useState<'all' | 'mine'>('all');

  const filtered = (games ?? []).filter(g =>
    filter === 'mine' ? g.players?.includes(username ?? '') : true
  );

  const myRecord = (games ?? []).reduce(
    (acc, g) => {
      if (!g.players?.includes(username ?? '')) return acc;
      return g.winner === username
        ? { ...acc, wins: acc.wins + 1 }
        : { ...acc, losses: acc.losses + 1 };
    },
    { wins: 0, losses: 0 }
  );

  const total = myRecord.wins + myRecord.losses;
  const winPct = total > 0 ? Math.round((myRecord.wins / total) * 100) : 0;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <div className="page-title">Game History</div>
        <div className="page-subtitle">All recorded match results</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-label">My Wins</div><div className="stat-value" style={{ color: 'var(--green)' }}>{myRecord.wins}</div></div>
        <div className="stat-card"><div className="stat-label">My Losses</div><div className="stat-value">{myRecord.losses}</div></div>
        <div className="stat-card">
          <div className="stat-label">My Win %</div>
          <div className="stat-value">{winPct}%</div>
          <div className="win-bar-wrap" style={{ marginTop: 8 }}><div className="win-bar" style={{ width: `${winPct}%` }} /></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([['all', 'All Games'], ['mine', 'My Games']] as const).map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className="btn btn-sm" style={{
            background: filter === v ? 'var(--charcoal)' : 'var(--white)',
            color: filter === v ? 'var(--white)' : 'var(--gray-700)',
            border: '1.5px solid', borderColor: filter === v ? 'var(--charcoal)' : 'var(--gray-300)',
          }}>{l}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>Loading...</div>}
      {error && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No results recorded yet</div>
          <div>Record match results from an event page</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((game, idx) => {
          const iWon = game.winner === username;
          const iPlayed = game.players?.includes(username ?? '');
          const gameTime = game.time ?? game.GameTime;
          const gameLocation = game.location ?? game.Location ?? '';
          return (
            <div key={idx} className="card fade-in" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              {iPlayed && (
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
                  background: iWon ? 'var(--green-light)' : 'var(--danger-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 12,
                  color: iWon ? 'var(--green-dark)' : 'var(--danger)',
                }}>
                  {iWon ? 'WIN' : 'LOSS'}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{gameLocation}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                  {formatTime(gameTime)} · {game.players?.join(', ')}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {game.score && <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 22, fontWeight: 700 }}>{game.score}</div>}
                {game.winner && <div style={{ fontSize: 12, color: 'var(--green-dark)', fontWeight: 600 }}>🏆 {game.winner}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
