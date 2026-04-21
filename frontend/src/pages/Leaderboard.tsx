import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import type { LeaderboardEntry } from '../types';

const MEDALS = ['🥇', '🥈', '🥉'];

interface RichEntry extends LeaderboardEntry {
  losses: number;
  winPct: number;
  displayName: string;
  totalG: number;
  totalW: number;
}

export default function Leaderboard() {
  const { data: raw, loading, error } = useApi<LeaderboardEntry[]>('/api/games/leaderboard');
  const { username } = useAuth();

  const players: RichEntry[] = (raw ?? []).map(p => {
    const totalG = p.totalGames ?? p.totalgames ?? 0;
    const totalW = p.wins ?? 0;
    return {
      ...p,
      displayName: p.username ?? p.Username ?? '',
      totalG,
      totalW,
      losses: totalG - totalW,
      winPct: totalG > 0 ? Math.round((totalW / totalG) * 100) : 0,
    };
  });

  const me = players.find(p => p.displayName === username);
  const myRank = me ? players.indexOf(me) + 1 : null;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <div className="page-title">Leaderboard</div>
        <div className="page-subtitle">Ranked by win percentage</div>
      </div>

      {me && myRank && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Your Rank', value: `#${myRank}` },
            { label: 'Win %', value: `${me.winPct}%`, green: true },
            { label: 'Wins', value: String(me.totalW) },
            { label: 'Losses', value: String(me.losses) },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={s.green ? { color: 'var(--green)' } : {}}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--gray-500)' }}>Loading...</div>}
      {error && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}

      {!loading && players.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <div className="empty-title">No stats yet</div>
          <div>Play some games to appear here!</div>
        </div>
      )}

      {players.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 56px 56px 56px 90px', gap: 8, padding: '10px 20px', background: 'var(--gray-100)', fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <div /><div>Player</div>
            <div style={{ textAlign: 'center' }}>W</div>
            <div style={{ textAlign: 'center' }}>L</div>
            <div style={{ textAlign: 'center' }}>G</div>
            <div>Win %</div>
          </div>

          {players.map((p, idx) => {
            const rank = idx + 1;
            const isMe = p.displayName === username;
            return (
              <div key={p.displayName} style={{
                display: 'grid', gridTemplateColumns: '44px 1fr 56px 56px 56px 90px', gap: 8,
                padding: '13px 20px', alignItems: 'center',
                borderTop: idx > 0 ? '1px solid #edf0f4' : 'none',
                background: isMe ? 'var(--green-light)' : 'transparent',
              }}>
                <div style={{ textAlign: 'center', fontSize: rank <= 3 ? 20 : 13, fontWeight: 700, color: 'var(--gray-500)' }}>
                  {rank <= 3 ? MEDALS[rank - 1] : rank}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{p.displayName[0]?.toUpperCase()}</div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {p.displayName}
                    {isMe && <span className="badge badge-green" style={{ marginLeft: 6, fontSize: 10 }}>You</span>}
                  </span>
                </div>
                <div style={{ textAlign: 'center', fontWeight: 700, color: 'var(--green-dark)' }}>{p.totalW}</div>
                <div style={{ textAlign: 'center', color: 'var(--gray-500)' }}>{p.losses}</div>
                <div style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: 13 }}>{p.totalG}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: p.winPct >= 60 ? 'var(--green-dark)' : p.winPct >= 40 ? 'var(--charcoal)' : 'var(--danger)' }}>
                    {p.winPct}%
                  </div>
                  <div className="win-bar-wrap" style={{ width: 70 }}>
                    <div className="win-bar" style={{ width: `${p.winPct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
